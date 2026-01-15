import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/user.model.js";
import { ENV } from "../config/env.js";
import { sendOTPEmail } from "../config/email.js";
import { generateOTP, storeOTP, verifyOTP as verifyOTPCode } from "../utils/otpStorage.js";

const generateToken = (userId) => {
  if (!ENV.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export async function register(req, res) {
  try {
    const { name, email, password, imageUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with user data (will be used after verification)
    storeOTP(email.toLowerCase(), otp, {
      name,
      email: email.toLowerCase(),
      passwordHash,
      imageUrl: imageUrl || "",
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      return res.status(500).json({
        message: "Failed to send verification email. Please try again later."
      });
    }

    res.status(200).json({
      message: "OTP sent to your email. Please verify your email to complete registration.",
      email: email.toLowerCase(),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      message: "Logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMe(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Verify OTP
    const result = verifyOTPCode(email.toLowerCase(), otp);

    if (!result.valid) {
      return res.status(400).json({ message: result.error || "Invalid or expired OTP" });
    }

    // Check if user already exists (edge case - user registered between OTP send and verify)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Create user with verified data
    const user = await User.create(result.userData);

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: "Email verified successfully. Account created!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function adminLogin(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!ENV.ADMIN_EMAIL) {
      return res.status(500).json({ message: "ADMIN_EMAIL is not configured on server" });
    }

    if (email.toLowerCase() !== ENV.ADMIN_EMAIL.toLowerCase()) {
      return res.status(401).json({ message: "Unauthorized admin email" });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create admin user automatically with a random password hash (never used for login)
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(
        `${ENV.ADMIN_EMAIL}-${ENV.JWT_SECRET || "secret"}`,
        salt
      );

      user = await User.create({
        name: "Admin",
        email: email.toLowerCase(),
        passwordHash,
        imageUrl: "",
      });
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      message: "Admin logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}


