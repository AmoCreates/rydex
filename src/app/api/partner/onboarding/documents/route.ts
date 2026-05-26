import { auth } from "@/auth";
import { cloudinaryUpload } from "@/lib/cloudinary";
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
			return Response.json({ message: "user not found" }, { status: 401 });
		}

		if (user.partnerOnBoardingStep < 1) {
			return Response.json({
				message: "please complete previous steps",
				status: 400,
			});
		}

		const formData = await req.formData();
		const aadhar = formData.get("aadhar") as Blob | null;
		const rc = formData.get("rc") as Blob | null;
		const license = formData.get("license") as Blob | null;
		const puc = formData.get("puc") as Blob | null;
		const motorInsurance = formData.get("motorInsurance") as Blob | null;

		if (!aadhar || !rc || !license || !motorInsurance || !puc) {
			return Response.json({
				message: "missing required documents",
				status: 400,
			});
		}

		const updatePayload: any = {
			status: "pending",
		};

		if (aadhar) {
			const url = await cloudinaryUpload(aadhar);
			if (!url) {
				return Response.json({
					message: "aadhar upload failed",
					status: 500,
				});
			}
			updatePayload.aadharUrl = url;
		}

		if (license) {
			const url = await cloudinaryUpload(license);
			if (!url) {
				return Response.json({
					message: "license upload failed",
					status: 500,
				});
			}
			updatePayload.licenseUrl = url;
		}

		if (rc) {
			const url = await cloudinaryUpload(rc);
			if (!url) {
				return Response.json({
					message: "registration certificate upload failed",
					status: 500,
				});
			}
			updatePayload.rcUrl = url;
		}

		if (puc) {
			const url = await cloudinaryUpload(puc);
			if (!url) {
				return Response.json({
					message: "pollution certificate upload failed",
					status: 500,
				});
			}
			updatePayload.pucUrl = url;
		}

		if (motorInsurance) {
			const url = await cloudinaryUpload(motorInsurance);
			if (!url) {
				return Response.json({
					message: "motor insurance certificate upload failed",
					status: 500,
				});
			}
			updatePayload.motorInsuranceUrl = url;
		}

		const partnerDocs = await PartnerDocs.findOneAndUpdate(
			{ owner: user._id },
			{ $set: updatePayload },
			{ upsert: true, new: true }, // update if present, else create
		);

		if (user.partnerOnBoardingStep == 1) {
			user.partnerOnBoardingStep = 2;
		}

		await user.save();

		return Response.json(partnerDocs, { status: 200 });
	} catch (error) {
		console.log("partner docs error, err: ", error);
		return Response.json(
			{ message: "Upload documents error, err: ", error },
			{ status: 500 },
		);
	}
}