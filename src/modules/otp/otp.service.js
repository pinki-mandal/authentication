const { hashPassword, comparePassword } = require("../../utils/bcrypt");
const { generateOtp } = require("../../utils/otp");

async function createOtpRecord(user, purpose) {
  const otp = generateOtp();
  const otpHash = await hashPassword(otp);

  user.otpHash = otpHash;
  user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  user.otpPurpose = purpose;
  user.otpAttempts = 0;
  user.lastOtpSentAt = new Date();
  await user.save();

  return { otp, user };
}

async function verifyOtpRecord(user, otp, purpose) {
  if (!user.otpHash || !user.otpExpiresAt || user.otpPurpose !== purpose) {
    const error = new Error("Invalid or expired OTP");
    error.statusCode = 400;
    throw error;
  }

  if (user.otpExpiresAt < new Date()) {
    const error = new Error("OTP expired");
    error.statusCode = 400;
    throw error;
  }

  if ((user.otpAttempts || 0) >= 3) {
    const error = new Error("Too many OTP attempts");
    error.statusCode = 400;
    throw error;
  }

  const isValid = await comparePassword(otp, user.otpHash);
  if (!isValid) {
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    await user.save();
    const error = new Error("Invalid OTP");
    error.statusCode = 400;
    throw error;
  }

  user.otpHash = null;
  user.otpExpiresAt = null;
  user.otpPurpose = null;
  user.otpAttempts = 0;
  await user.save();

  return true;
}

module.exports = {
  createOtpRecord,
  verifyOtpRecord,
};
