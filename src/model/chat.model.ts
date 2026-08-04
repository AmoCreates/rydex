import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Types.ObjectId,
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

const Chat = mongoose?.models.chat || mongoose.model("Chat", chatSchema);
export default Chat;