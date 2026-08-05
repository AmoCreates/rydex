import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },

  sender: {
    type: String,
    enum: ["driver", "customer"]
  },

  msg: {
    type: String,
    required: true,
  }

}, {timestamps: true});

chatSchema.index({ bookingId: 1, createdAt: -1 });
const Chat = mongoose?.models?.Chat || mongoose.model("Chat", chatSchema);
export default Chat;