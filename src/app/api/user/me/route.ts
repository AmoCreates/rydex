import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/model/user.model";

export async function GET(req: Request) {
	try {
		await dbConnect();
		const session = await auth();
		if (!session || !session.user) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
			});
		}

		const { email } = session.user;
		const user = await User.findOne({ email }).select("-password").lean();
		if (!user) {
			return new Response(JSON.stringify({ error: "User not found" }), {
				status: 404,
			});
		}

		return Response.json(user, {status: 200})
	} catch (error) {
		return new Response(
			JSON.stringify({ error: `Internal Server Error\nerror: ${error}` }),
			{
				status: 500,
			},
		);
	}
}
