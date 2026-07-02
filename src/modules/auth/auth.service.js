const User = require("../user/user.model");
const { hashPassword, comparePassword } = require("../../utils/bcrypt");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../../utils/jwt");
const { createOtpRecord, verifyOtpRecord } = require("../otp/otp.service");
const { sendOtpEmail } = require("../../services/email.service");
const { sendOtpSms } = require("../../services/sms.service");

function buildAuthResponse(user, accessToken, refreshToken) {
  return {
    success: true,
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, phone: user.phone, isVerified: user.isVerified },
  };
}

async function registerUser({ name, email, phone }) {
  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ name, email, phone });
  const { otp } = await createOtpRecord(user, "register");
  await sendOtpEmail(email, otp);
  await sendOtpSms(phone, otp);

  return {
    success: true,
    message: "Registration initiated. OTP sent to your email and phone.",
    user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
  };
}

async function setPassword({ email, phone, otp, password }) {
  const query = email ? { email } : { phone };
  const user = await User.findOne(query);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await verifyOtpRecord(user, otp, "register");
  user.password = await hashPassword(password);
  user.isVerified = true;
  await user.save();

  return {
    success: true,
    message: "Password set successfully. Account verified.",
  };
}

async function verifyLoginOtp({ email, phone, otp }) {
  const query = email ? { email } : { phone };
  const user = await User.findOne(query);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await verifyOtpRecord(user, otp, "login");
  const accessToken = generateAccessToken({ id: user._id, email: user.email });
  const refreshToken = generateRefreshToken({ id: user._id });
  user.refreshToken = refreshToken;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.loginHistory.push({ ipAddress: "unknown", userAgent: "unknown", device: "unknown" });
  await user.save();

  return buildAuthResponse(user, accessToken, refreshToken);
}

async function loginWithEmailPassword({ email, password, req }) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    const error = new Error("Account temporarily locked. Try again later.");
    error.statusCode = 423;
    throw error;
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save();
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isVerified || !user.password) {
    const { otp } = await createOtpRecord(user, "login");
    await sendOtpEmail(user.email, otp);
    await sendOtpSms(user.phone, otp);
    return {
      success: true,
      message: "Account requires verification. OTP sent.",
      requiresOtp: true,
    };
  }

  const accessToken = generateAccessToken({ id: user._id, email: user.email });
  const refreshToken = generateRefreshToken({ id: user._id });
  user.refreshToken = refreshToken;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.loginHistory.push({ ipAddress: req?.ip || "unknown", userAgent: req?.headers?.["user-agent"] || "unknown", device: "web" });
  await user.save();

  return buildAuthResponse(user, accessToken, refreshToken);
}

async function loginWithEmailOtp({ email }) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const { otp } = await createOtpRecord(user, "login");
  await sendOtpEmail(user.email, otp);
  await sendOtpSms(user.phone, otp);

  return {
    success: true,
    message: "OTP sent to your email and phone",
  };
}

async function loginWithPhoneOtp({ phone }) {
  const user = await User.findOne({ phone });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const { otp } = await createOtpRecord(user, "login");
  await sendOtpEmail(user.email, otp);
  await sendOtpSms(user.phone, otp);

  return {
    success: true,
    message: "OTP sent to your phone and email",
  };
}

async function resendOtp({ email, phone }) {
  const query = email ? { email } : { phone };
  const user = await User.findOne(query);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const { otp } = await createOtpRecord(user, user.isVerified ? "login" : "register");
  await sendOtpEmail(user.email, otp);
  await sendOtpSms(user.phone, otp);

  return {
    success: true,
    message: "OTP resent successfully",
  };
}

async function forgotPassword({ email }) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const { otp } = await createOtpRecord(user, "forgot-password");
  await sendOtpEmail(user.email, otp);
  await sendOtpSms(user.phone, otp);

  return {
    success: true,
    message: "Password reset OTP sent",
  };
}

async function resetPassword({ email, otp, newPassword }) {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  await verifyOtpRecord(user, otp, "forgot-password");
  user.password = await hashPassword(newPassword);
  user.refreshToken = null;
  await user.save();

  return {
    success: true,
    message: "Password reset successfully",
  };
}

async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    const error = new Error("Refresh token missing");
    error.statusCode = 401;
    throw error;
  }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken({ id: user._id, email: user.email });
  return { success: true, accessToken };
}

async function logoutUser(userId) {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
  return { success: true, message: "Logged out successfully" };
}

module.exports = {
  registerUser,
  setPassword,
  verifyLoginOtp,
  loginWithEmailPassword,
  loginWithEmailOtp,
  loginWithPhoneOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logoutUser,
};
