import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Booking from "@/model/booking.model";
import Chat from "@/model/chat.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const geminiUrl = process.env.GOOGLE_GEMINI_API_URL!;

export async function POST(req: NextRequest) {
	try {
		await dbConnect();

		const session = await auth();

		if (!session || !session.user?.email || session.user.role === "admin") {
			return NextResponse.json(
				{ message: "unauthorized, please log in to book ride" },
				{ status: 401 },
			);
		}

		const role = "session.user.role;"; // "driver" or "customer"
		const { bookingId } = await req.json();

		if (!bookingId) {
			return NextResponse.json(
				{ message: "Sorry!, we couldn't find any booking right now" },
				{ status: 400 },
			);
		}

		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return NextResponse.json(
				{ message: "Sorry!, we couldn't find any active ride" },
				{ status: 400 },
			);
		}

		// Fetch last 10 messages (newest first)
		const conversion = await Chat.find({ bookingId })
			.sort({ createdAt: -1 })
			.limit(10);

		// Format chat history (oldest -> newest) matching schema keys
		const formattedHistory = conversion
			.slice()
			.reverse()
			.map((chat) => `${chat.sender}: ${chat.msg}`)
			.join("\n");

		const lastMessage = conversion[0]
			? `${conversion[0].sender}: ${conversion[0].msg}`
			: "No previous messages yet.";

		const prompt = `You are an AI quick-reply assistant for a ride-hailing app (Rydex).
        Generate contextually relevant quick replies ONLY for the role: ${role}.

        Context:
        - Chat History:
        ${formattedHistory || "No conversation history."}

        - Last Received Message:
        ${lastMessage}

        Rules:
        1. Role Focus: Write suggestions from the perspective of the ${role} responding to the other party based on the conversation history above.
        2. Quantity: Return between 3 and 6 suggestions.
        3. Length: Keep each suggestion concise (1 to 8 words).
        4. Tone: Helpful, polite, and situational (e.g., waiting, traffic, pickup, confirming location).
        5. Language: User's natural language, like: english, hinglish, hindi, etc., if no past conversations then prefer english.
        6. Format: Return ONLY a valid JSON array of strings. No extra text, markdown, or commentary.

        Examples:
        - If ${role} is "customer": ["I'm waiting outside", "How long will it take?", "I'm near the entrance", "Thanks!", "Where are you", "ok", "no problem"]
        - If ${role} is "driver": ["I have arrived", "Stuck in heavy traffic", "I am on my way", "Where are you standing?"]`;

		// Clean API call using full env URL
		const res = await axios.post(geminiUrl, {
			model: "gemini-3.6-flash",
			input: prompt,
		});

		// Extract output step dynamically from Interactions API format
		const steps = res.data.steps || [];
		const outputStep = steps.find((s: any) => s.type === "model_output");
		const rawText = outputStep?.content?.[0]?.text;

		if (!rawText) {
			throw new Error("No output text received from Gemini");
		}

		// Parse cleaned JSON array
		const suggestions = JSON.parse(
			rawText.replace(/```json|```/g, "").trim(),
		);

		return NextResponse.json({ suggestions }, { status: 200 });
	} catch (error) {
		console.error("Get chat suggestions error:", error);
		return NextResponse.json(
			{ message: "get chat suggestions error" },
			{ status: 500 },
		);
	}
}
