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


		const { bookingId, currentRole } = await req.json();
		const role = currentRole || session.user.role; // e.g., "driver"
		const otherRole = role === "driver" ? "customer" : "driver";

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
			.limit(10);

		// Format chat history (oldest -> newest)
		const formattedHistory = conversion
			.slice()
			.map((chat) => `${chat.sender}: ${chat.msg}`)
			.join("\n");

		const lastChat = conversion[0];
		const lastSender = lastChat ? lastChat.sender : "none";
		const lastMsgText = lastChat ? lastChat.msg : "No previous messages yet.";

		const prompt = `You are an AI quick-reply assistant for a ride-hailing app (Rydex).

			CRITICAL INSTRUCTION:
			- You are generating quick-reply suggestions strictly from the perspective of the user who is a: ${role}.
			- The other person in the chat is the: ${otherRole}.
			- The last message in the chat was sent by: ${lastSender}.

			Chat History:
			${formattedHistory || "No conversation history."}

			Last Message:
			[${lastSender}]: "${lastMsgText}"

			Rules:
			1. Perspective: Write 3 to 6 suggestions ONLY from the viewpoint of the ${role}. 
				- If ${role} is the "driver", suggest actions/replies a driver would send to a customer (e.g., status updates, confirmation, warnings, ride cancellation reasons).
				- Do NOT suggest replies from the perspective of the ${otherRole}, In sort bascially you have to guess that now what will be next message of current role to the other, like if currentRole is driver and last msg from driver side is I am in traffic then your suggestion is like i am still in traffic, sorry for the delay and and you may also guess for the reply to other party like if the lastmessage if from other side then suggest what to reply him.
			2. Quantity: Return between 3 and 6 suggestions.
			3. Length: Keep each suggestion concise (1 to 8 words).
			4. Language: Match the language/tone used in the chat (Hinglish, Hindi, or English).
			5. You can also reply with emaojies ans short message like: Ok, done, 👍🏻, 😁, 🚲, etc.
			6. Format: Return ONLY a valid JSON array of strings. No extra text, markdown, or commentary.

			Example:
			If ${role} is "driver": ["I am canceling the ride", "Please wait 2 minutes", "I have reached", "Sorry, traffic is heavy"]`;

		const res = await axios.post(geminiUrl, {
			model: "gemini-3.5-flash",
			input: prompt,
		});

		const steps = res.data.steps || [];
		const outputStep = steps.find((s: any) => s.type === "model_output");
		const rawText = outputStep?.content?.[0]?.text;

		if (!rawText) {
			throw new Error("No output text received from Gemini");
		}

		const suggestions = JSON.parse(
			rawText.replace(/```json|```/g, "").trim(),
		);

		return NextResponse.json({ suggestions }, { status: 200 });
	} catch {
		return NextResponse.json(
			{ message: "server error: failed to load chat suggestions" },
			{ status: 500 },
		);
	}
}