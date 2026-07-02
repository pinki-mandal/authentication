async function sendOtpSms(phone, otp) {
  console.log(`[OTP SMS] ${phone}: ${otp}`);
  return true;
}

module.exports = {
  sendOtpSms,
};
