// In-memory storage for OTP codes
// In production, consider using Redis or MongoDB for distributed systems

const otpStorage = new Map();

// OTP expires after 10 minutes
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Generate a 6-digit OTP code
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP with user registration data
 * @param {string} email - User's email
 * @param {string} otp - OTP code
 * @param {object} userData - User registration data (name, email, passwordHash)
 */
export const storeOTP = (email, otp, userData) => {
  const key = email.toLowerCase();
  otpStorage.set(key, {
    otp,
    userData,
    expiresAt: Date.now() + OTP_EXPIRY_TIME,
  });
};

/**
 * Verify OTP and return user data if valid
 * @param {string} email - User's email
 * @param {string} otp - OTP code to verify
 * @returns {object|null} - User data if OTP is valid, null otherwise
 */
export const verifyOTP = (email, otp) => {
  const key = email.toLowerCase();
  const stored = otpStorage.get(key);

  if (!stored) {
    return { valid: false, error: "OTP not found or expired" };
  }

  if (Date.now() > stored.expiresAt) {
    otpStorage.delete(key);
    return { valid: false, error: "OTP has expired" };
  }

  if (stored.otp !== otp) {
    return { valid: false, error: "Invalid OTP code" };
  }

  // OTP is valid, remove it and return user data
  const userData = stored.userData;
  otpStorage.delete(key);

  return { valid: true, userData };
};

/**
 * Remove expired OTPs (cleanup function)
 */
export const cleanupExpiredOTPs = () => {
  const now = Date.now();
  for (const [key, value] of otpStorage.entries()) {
    if (now > value.expiresAt) {
      otpStorage.delete(key);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);

