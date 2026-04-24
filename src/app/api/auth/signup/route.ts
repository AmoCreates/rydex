import dbConnect from "@/lib/db";
import User from "@/model/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { name, email, password } = await req.json();

		if (password.length < 6 || password.length > 15) {
			return NextResponse.json(
				{ message: "password must be in between 6-15 characters long" },
				{ status: 400 },
			);
		}

		await dbConnect();

		const isExist = await User.findOne({ email });
		if (isExist) {
			return NextResponse.json(
				{ message: "email already exists!" },
				{ status: 400 },
			);
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = await User.create({
			name,
			email,
			password: hashedPassword,
		});

		return NextResponse.json({ user }, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ message: `registeration failed ${error}` },
			{ status: 500 },
		);
	}
}
