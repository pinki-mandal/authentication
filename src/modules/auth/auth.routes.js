const express = require("express");
const controller = require("./auth.controller");
const {
  registerValidation,
  passwordSetupValidation,
  loginEmailPasswordValidation,
  emailOtpValidation,
  phoneOtpValidation,
  otpRequestValidation,
  verifyOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation,
  validate,
} = require("./auth.validation");
const { authLimiter, otpLimiter } = require("../../middleware/rateLimit.middleware");
const { protect } = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/register", authLimiter, registerValidation, validate, controller.register);
router.post("/set-password", otpLimiter, passwordSetupValidation, validate, controller.setPassword);
router.post("/verify-otp", otpLimiter, verifyOtpValidation, validate, controller.verifyOtp);
router.post("/login-password", authLimiter, loginEmailPasswordValidation, validate, controller.loginEmailPassword);
router.post("/login-otp", authLimiter, emailOtpValidation, validate, controller.loginEmailOtp);
router.post("/verify-login-otp", otpLimiter, verifyOtpValidation, validate, controller.verifyOtp);
router.post("/login/phone-otp", authLimiter, phoneOtpValidation, validate, controller.loginPhoneOtp);
router.post("/resend-otp", otpLimiter, otpRequestValidation, validate, controller.resendOtp);
router.post("/forgot-password", otpLimiter, forgotPasswordValidation, validate, controller.forgotPassword);
router.post("/reset-password", otpLimiter, resetPasswordValidation, validate, controller.resetPassword);
router.post("/refresh-token", authLimiter, refreshTokenValidation, validate, controller.refreshToken);
router.post("/logout", protect, controller.logout);

module.exports = router;
