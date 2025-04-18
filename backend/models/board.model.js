import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Name of the board 
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the user 
    required: true,
  },
  choices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "BoardChoice", // Choices from the pre-existing list (BoardChoice schema)
  }],
  customChoices: [{
    phrase: {
      type: String,
      required: true, // Custom phrase that the user can add
    },
    image: {
      type: String,
      required: true, // Custom image URL (or path)
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Automatically update the `updatedAt` field when the board is modified
boardSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Board", boardSchema);