const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const authRoutes = require("./modules/auth/auth.routes");
const errorMiddleware = require("./middleware/error.middleware");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MERN Authentication API Running",
  });
});

app.use("/api/auth", authRoutes);
app.use(errorMiddleware);

module.exports = app;