import mongoose from "mongoose";

export interface IPartnerDocs extends mongoose.Document {
	owner: mongoose.Types.ObjectId;
	aadharUrl: string;
	rcUrl: string;
	licenseUrl: string;
	motorInsuranceUrl: string;
	pucUrl: string;
	status?: "approved" | "rejected" | "pending";
	rejectionMsg?: string;
	createdAt?: Date; // no need to add these becaues extends above, only for more secureness
	updatedAt?: Date;
}

const partnerDocsSchema = new mongoose.Schema<IPartnerDocs>(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		aadharUrl: {
			type: String,
			required: true,
		},

		rcUrl: {
			type: String,
			required: true,
		},

		licenseUrl: {
			type: String,
			required: true,
		},

		motorInsuranceUrl: {
			type: String,
			required: true,
		},

		pucUrl: {
			type: String,
			required: true,
		},

		status: {
			type: String,
			enum: ["approved", "rejected", "pending"],
			default: "pending",
		},

		rejectionMsg: String,
	},
	{ timestamps: true },
);

const PartnerDocs =
	mongoose.models?.partnerDocs ||
	mongoose.model("PartnerDocs", partnerDocsSchema);
export default PartnerDocs;
