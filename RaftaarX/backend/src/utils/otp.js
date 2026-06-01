const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

export function generateOtp() {
  return String(
    Math.floor(10 ** (OTP_LENGTH - 1) + Math.random() * 9 * 10 ** (OTP_LENGTH - 1))
  );
}

export function getOtpExpiryDate() {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
}

export function getOtpExpiryMinutes() {
  return OTP_EXPIRY_MINUTES;
}
