const { body, validationResult } = require("express-validator");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error) => ({ field: error.path, message: error.msg })),
    });
  }
  next();
}

const strongPassword = (value) => {
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);
  return hasUpper && hasLower && hasNumber && hasSpecial;
};

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 50 }),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("phone").trim().notEmpty().withMessage("Phone is required").isMobilePhone("any", { strictMode: false }),
];

const passwordSetupValidation = [
  body("email").optional().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("phone").optional().trim().notEmpty().withMessage("Phone is required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .custom((value) => strongPassword(value))
    .withMessage("Password must include uppercase, lowercase, a number and a special character"),
];

const loginEmailPasswordValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const emailOtpValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
];

const phoneOtpValidation = [
  body("phone").trim().notEmpty().withMessage("Phone is required"),
];

const otpRequestValidation = [
  body("email").optional().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("phone").optional().trim().notEmpty().withMessage("Phone is required"),
];

const verifyOtpValidation = [
  body("email").optional().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("phone").optional().trim().notEmpty().withMessage("Phone is required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  body("purpose").optional().isIn(["register", "login", "forgot-password"]).withMessage("Invalid OTP purpose"),
];

const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
];

const resetPasswordValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .custom((value) => strongPassword(value))
    .withMessage("Password must include uppercase, lowercase, a number and a special character"),
];

const refreshTokenValidation = [
  body("refreshToken").optional().isString(),
];

module.exports = {
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
};
