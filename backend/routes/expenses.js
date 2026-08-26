const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

router.post("/", async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, userId: req.userId });
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch expenses" });
  }
});

router.get("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: "Invalid expense id" });
  }

  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch expense" });
  }
});

router.put("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: "Invalid expense id" });
  }

  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true },
    );
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: "Invalid expense id" });
  }

  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Unable to delete expense" });
  }
});

module.exports = router;
