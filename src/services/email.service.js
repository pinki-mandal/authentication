const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS } = require("../config/env");

async function sendOtpEmail(to, otp) {
  if (!EMAIL_USER || !EMAIL_PASS || EMAIL_USER.includes("example")) {
    console.log(`[OTP EMAIL] ${to}: ${otp}`);
    return true;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: EMAIL_USER,
    to,
    subject: "Your authentication OTP",
    html: `<p>Your verification code is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
  });

  return true;
}

module.exports = {
  sendOtpEmail,
};
