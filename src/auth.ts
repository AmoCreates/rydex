import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "./lib/db";
import User from "./model/user.model";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Credentials({
			credentials: {
				email: {
					type: "email",
					label: "Email",
					placeholder: "johndoe@gmail.com",
				},
				password: {
					type: "password",
					label: "Password",
					placeholder: "*****",
				},
			},

			authorize: async (credentials) => {
				if (!credentials.email || !credentials.password) {
					throw new Error("missing credentials");
				}

				const email = credentials?.email;
				const password = credentials?.password as string;

				try {
					await dbConnect();

					const user = await User.findOne({ email });
					if (!user) {
						throw new Error("user doesn't exist!");
					}

					const isMatch = await bcrypt.compare(password, user.password);
					if (!isMatch) {
						throw new Error("either email or password is incorrect");
					}

					return {
						id: user._id,
						name: user.name,
						email: user.email,
						image: user.image,
						role: user.role,
					};
				} catch (error) {
					throw new Error("Authentication Error, ERR: " + error);
				}
			},
		}),

		Google({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),
	],

	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider === "google") {
				await dbConnect();
				const userExists = await User.findOne({ email: user.email });
				if (!userExists) {
					await User.create({
						name: user.name,
						email: user.email,
					});
				}

				// update manually **Google doesn't give these
				user.id = userExists._id;
				user.role = userExists.role;
			}

			return true;
		},

		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.role = user.role;
				token.name = user.name;
				token.email = user.email;
				token.image = user.image;
			} else {
				throw Error("jwt-callback: token is missing");
			}
			return token;
		},

		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id;
				session.user.role = token.role;
				session.user.name = token.name;
				session.user.email = token.email;
				session.user.image = token.image;
			} else {
				throw Error("session-callback: either token or session is missing");
			}
			return session;
		},
	},

	pages: {
		signIn: "/auth/signin",
		error: "/auth/signin",
	},

	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},

	secret: process.env.AUTH_SECRET,
});

export default NextAuth;
