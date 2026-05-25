import mongoose from "mongoose";

export interface IPartnerDocs extends mongoose.Document {
	owner: mongoose.Types.ObjectId;
	aadharUrl: string;
	rcUrl: string;
	dlUrl: string;
	motorInsuranceUrl: string;
	pucUrl: string;
	status: "Approved" | "Rejected" | "Pending";
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

		dlUrl: {
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
			enum: ["Approved", "Rejected", "Pending"],
			default: "Pending",
		},

		rejectionMsg: String,
	},
	{ timestamps: true },
);

const PartnerDocs =
	mongoose.models?.partnerDocs ||
	mongoose.model("PartnerDocs", partnerDocsSchema);
export default PartnerDocs;
