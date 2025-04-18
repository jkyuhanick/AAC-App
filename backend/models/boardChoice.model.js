import mongoose from "mongoose";

const boardChoiceSchema = new mongoose.Schema({
  phrase: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user 
      required: false,
  }
});

const BoardChoice = mongoose.model("BoardChoice", boardChoiceSchema);
export default BoardChoice;