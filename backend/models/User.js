const mongoose = require("mongoose");
const CURRENCIES = require("../lib/currencies");

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
    enum: CURRENCIES,
    default: "USD",
  },
  overallBudget: { type: Number, default: 0, min: 0 },
  categoryBudgets: {
    type: Map,
    of: { type: Number, min: 0 },
    default: {},
  },
});

module.exports = mongoose.model("User", userSchema);
