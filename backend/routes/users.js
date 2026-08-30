const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");
const CURRENCIES = require("../lib/currencies");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later" },
});

function issueToken(user) {
  return jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

router.post("/register", authLimiter, async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password, currency } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    if (currency && !CURRENCIES.includes(currency)) {
      return res.status(400).json({ message: "Unsupported currency" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      ...(currency ? { currency } : {}),
    });

    res.status(201).json({
      message: "Registration successful",
      token: issueToken(user),
      email: user.email,
      currency: user.currency,
    });
  } catch (error) {
    console.error("Registration failed:", error.message);
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", authLimiter, async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      token: issueToken(user),
      email: user.email,
      currency: user.currency,
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    res.status(500).json({ message: "Login failed" });
  }
});

function serializeUser(user) {
  return {
    email: user.email,
    currency: user.currency,
    overallBudget: user.overallBudget,
    categoryBudgets: Object.fromEntries(user.categoryBudgets || []),
  };
}

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(serializeUser(user));
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch profile" });
  }
});

router.patch("/me", requireAuth, async (req, res) => {
  const { currency } = req.body;

  if (!CURRENCIES.includes(currency)) {
    return res.status(400).json({ message: "Unsupported currency" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { currency },
      { new: true, runValidators: true },
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(serializeUser(user));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/me/budgets", requireAuth, async (req, res) => {
  const { overallBudget, categoryBudgets } = req.body;

  if (overallBudget !== undefined && (typeof overallBudget !== "number" || overallBudget < 0)) {
    return res.status(400).json({ message: "overallBudget must be a non-negative number" });
  }

  if (categoryBudgets !== undefined) {
    if (typeof categoryBudgets !== "object" || categoryBudgets === null) {
      return res.status(400).json({ message: "categoryBudgets must be an object" });
    }
    for (const value of Object.values(categoryBudgets)) {
      if (typeof value !== "number" || value < 0) {
        return res.status(400).json({ message: "Each category budget must be a non-negative number" });
      }
    }
  }

  try {
    const update = {};
    if (overallBudget !== undefined) update.overallBudget = overallBudget;
    if (categoryBudgets !== undefined) update.categoryBudgets = categoryBudgets;

    const user = await User.findByIdAndUpdate(req.userId, update, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(serializeUser(user));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
