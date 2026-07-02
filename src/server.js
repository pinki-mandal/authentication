import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/db.js";

dotenv.config();

const app = express();

connectDB();

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});