import { auth } from "@/auth";
import cloudinaryUpload from "@/lib/cloudinary";
import dbConnect from "@/lib/db";
import PartnerDocs from "@/model/partnerDocs.model";
import User from "@/model/user.model";

export async function POST(req: Request) {
	try {
		await dbConnect();

		const session = await auth();
		if (!session || !session.user?.email) {
			return Response.json({ message: "unauthorized" }, { status: 401 });
		}

		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return Response.json(
				{ message: "user not found" },
				{ status: 401 },
			);
		}

		// Handle 'undefined' or '0' values robustly
		if (!user.partnerOnBoardingStep || user.partnerOnBoardingStep < 1) {
			return Response.json(
				{
					message: "please complete the previous steps",
				},
				{ status: 400 },
			);
		}

		const formData = await req.formData();
		const aadhaar = formData.get("aadhaar") as Blob | null;
		const rc = formData.get("rc") as Blob | null;
		const license = formData.get("license") as Blob | null;
		const puc = formData.get("puc") as Blob | null;
		const motorInsurance = formData.get("motorInsurance") as Blob | null;

		if (!aadhaar || !rc || !license || !motorInsurance || !puc) {
			return Response.json(
				{
					message: "missing required documents",
				},
				{ status: 400 },
			);
		}

		const updatePayload: any = {
			status: "pending",
		};

		if (aadhaar) {
			const url = await cloudinaryUpload(aadhaar);
			if (!url) {
				return Response.json(
					{
						message: "aadhaar upload failed",
					},
					{ status: 500 },
				);
			}
			updatePayload.aadhaarUrl = url;
		}

		if (license) {
			const url = await cloudinaryUpload(license);
			if (!url) {
				return Response.json(
					{
						message: "license upload failed",
					},
					{ status: 500 },
				);
			}
			updatePayload.licenseUrl = url;
		}

		if (rc) {
			const url = await cloudinaryUpload(rc);
			if (!url) {
				return Response.json(
					{
						message: "registration certificate upload failed",
					},
					{ status: 500 },
				);
			}
			updatePayload.rcUrl = url;
		}

		if (puc) {
			const url = await cloudinaryUpload(puc);
			if (!url) {
				return Response.json(
					{
						message: "pollution certificate upload failed",
					},
					{ status: 500 },
				);
			}
			updatePayload.pucUrl = url;
		}

		if (motorInsurance) {
			const url = await cloudinaryUpload(motorInsurance);
			if (!url) {
				return Response.json(
					{
						message: "motor insurance certificate upload failed",
					},
					{ status: 500 },
				);
			}
			updatePayload.motorInsuranceUrl = url;
		}

		const partnerDocs = await PartnerDocs.findOneAndUpdate(
			{ owner: user._id },
			{ $set: updatePayload },
			{ upsert: true, new: true, runValidators: true }, // Add runValidators to catch schema issues
		);

		// Update the step robustly if it hasn't reached step 2 yet
		if (user.partnerOnBoardingStep < 2) {
			user.partnerOnBoardingStep = 2;
		} else if (user.partnerOnBoardingStep >= 3) {
			user.partnerOnBoardingStep = 3;
		}
		user.videoKycRoomId = "";
		user.videoKycStatus = "not required";
		user.partnerStatus = "pending";
		await user.save();

		return Response.json(partnerDocs, { status: 200 });
	} catch  {
		return Response.json(
			{ message: "server error: failed to upload documents" },
			{ status: 500 },
		);
	}
}
