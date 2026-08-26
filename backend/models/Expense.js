const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, trim: true, maxlength: 50 },
    type: {
      type: String,
      enum: ["income", "expense"],
      default: "expense",
    },
    paymentMethod: { type: String, trim: true, maxlength: 50 },
    notes: { type: String, trim: true, maxlength: 500 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Expense", expenseSchema);
