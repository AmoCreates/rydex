import mongoose from "mongoose";

// extends with mongoose doucment will resolve the upcoming id type and timestamps
interface IUser extends mongoose.Document {
  name: string;
  image?: string;
  email: string;
  isEmailVerified?: boolean;
  otp?: string;
  otpExpiry?: Date;
  password?: string;
  role: "user" | "partner" | "admin";
  createdAt?: Date; // no need to add these becaues extends above, only for more secureness
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: false,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      required: false,
    },

    otpExpiry: {
      type: Date,
      required: false,
    },

    password: {
      type: String,
      required: false,
    },

    role: {
      type: String,
      default: "user",
      enum: ['user', 'partner', 'admin']
    }
  },
  { timestamps: true },
);

const User = mongoose.models?.User || mongoose.model("User", userSchema);
export default User;
