const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: { type: String, required: true, minlength: 8 },
  currency: {
    type: String,
    enum: ["INR", "AED", "CAD"],
    default: "INR",
  },
});

module.exports = mongoose.model("User", userSchema);
