require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/users");
const expenseRoutes = require("./routes/expenses");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);

async function startServer() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from .env");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start backend:", error.message);
  process.exit(1);
});
