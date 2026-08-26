const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");

const router = express.Router();
const CURRENCIES = ["INR", "AED", "CAD"];

function issueToken(user) {
  return jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

router.post("/register", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

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

router.post("/login", async (req, res) => {
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

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ email: user.email, currency: user.currency });
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
    res.json({ email: user.email, currency: user.currency });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
