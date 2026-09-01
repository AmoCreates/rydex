import { sendMail } from "@/lib/sendMail";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { name, email, subject, message } = await request.json();

		// Validate required fields
		if (!name || !email || !message) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: "Invalid email address" },
				{ status: 400 },
			);
		}

		// Prepare email content
		const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
        <h2 style="color: #000; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        <div style="margin-top: 20px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
            ${message}
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          This email was sent from the RYDEX contact form. Reply to this email to reach out to the sender.
        </p>
      </div>
    `;

		const textContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This email was sent from the RYDEX contact form.
    `;

		// Send email to admin
		await sendMail(
			process.env.SMTP_USER || "anmolmaurya.in@outlook.com",
			`[RYDEX Contact] ${subject}`,
			textContent,
			htmlContent,
		);

		return NextResponse.json(
			{ success: true, message: "Email sent successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Contact form error:", error);
		return NextResponse.json(
			{ error: "Failed to send email. Please try again later." },
			{ status: 500 },
		);
	}
}
