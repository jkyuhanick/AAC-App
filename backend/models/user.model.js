import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Email should also be unique
    match: [/\S+@\S+\.\S+/, "Please use a valid email address"], // Email format validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Password length validation
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  language: {
    type: String,
    default: "en", // Default language for the user (e.g., English)
  },
  boards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board", // Reference to the boards the user has created
  }],
  isActive: {
    type: Boolean,
    default: true, // If user account is active
  },
  lastLogin: {
    type: Date,
  },
  role: {
    type: String,
    enum: ["user", "admin"], // User roles
    default: "user",
  }
});

userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("User", userSchema);