import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "./lib/db";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";
import User from "./model/user.model";

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
						throw new Error("No user found with this email");
					}

					if (!user.password) {
						throw new Error(
							"This account does not have a password. Please use Google sign-in or reset your password.",
						);
					}

					const isMatch = await bcrypt.compare(password, user.password);
					if (!isMatch) {
						throw new Error("password is incorrect");
					}

					return {
						id: user._id,
						name: user.name,
						email: user.email,
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

				let dbUser = await User.findOne({ email: user.email });
				if (!dbUser) {
					dbUser = await User.create({
						name: user.name,
						email: user.email,
						role: "customer",
					});
				}

				user.id = String(dbUser._id);
				user.role = dbUser.role || "customer";
			}

			return true;
		},

		async jwt({ token, user, trigger, session }) {
			if (user) {
				token.id = user.id;
				token.role = user.role;
				token.name = user.name;
				token.email = user.email;
			}

			if (trigger === "update" && session && typeof session === "object") {
				const updatedRole = (session as { role?: string })?.role;
				if (updatedRole && ["customer", "partner", "admin"].includes(updatedRole)) {
					token.role = updatedRole as typeof token.role;
				}
			}

			if (token.email) {
				try {
					await dbConnect();
					const dbUser = await User.findOne({ email: token.email }).select("role");
					if (dbUser?.role && dbUser.role !== token.role) {
						token.role = dbUser.role;
					}
				} catch (error) {
					console.error("Failed to refresh session role from DB:", error);
				}
			}

			return token;
		},

		async session({ session, token }) {
			if (session.user && token) {
				session.user.id = token.id;
				session.user.role = token.role;
				session.user.name = token.name;
				session.user.email = token.email;
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