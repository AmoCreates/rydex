import mongoose from "mongoose";

export interface IPartnerBank extends mongoose.Document {
	owner: mongoose.Types.ObjectId;
	accountHolder: string;
	accountNumber: string;
	ifscCode: string;
	upi?: string;
	rejectionMsg?: string;
	status: "not added" | "added" | "verified" | "rejected";
	createdAt?: Date; // no need to add these becaues extends above, only for more secureness
	updatedAt?: Date;
}

const partnerBankSchema = new mongoose.Schema<IPartnerBank>(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		accountHolder: {
			type: String,
			required: true,
		},

		accountNumber: {
			type: String,
			required: true,
			unique: true,
		},

		ifscCode: {
			type: String,
			required: true,
		},

		upi: String,

		status: {
			type: String,
			enum: ["not added", "added", "verified", "rejected"],
			default: "not added",
		},

		rejectionMsg: String,
	},
	{ timestamps: true },
);

const PartnerBank =
	mongoose.models?.partnerBank ||
	mongoose.model("PartnerBank", partnerBankSchema);
export default PartnerBank;
