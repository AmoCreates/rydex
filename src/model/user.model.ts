import mongoose from "mongoose";

// extends with mongoose doucment will resolve the upcoming id type and timestamps
interface IUser extends mongoose.Document {
  name: string;
  image: string;
  email: string;
  password?: string;
  role: "user" | "partner" | "admin";
  createdAt?: Date;
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
