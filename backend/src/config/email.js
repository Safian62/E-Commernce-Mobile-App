import nodemailer from "nodemailer";
import { ENV } from "./env.js";

// Create reusable transporter object using SMTP transport
export const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST || "smtp.gmail.com",
  port: ENV.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: ENV.SMTP_USER, // your email
    pass: ENV.SMTP_PASS, // your email password or app password
  },
});

// Verify transporter configuration
transporter.verify(() => {});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"${ENV.SMTP_FROM_NAME || "E-Commerce App"}" <${ENV.SMTP_USER}>`,
    to: email,
    subject: "Verify Your Email - OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Thank you for registering! Please use the following OTP code to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
          <h1 style="color: #1DB954; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
    text: `Your OTP code is: ${otp}. This code will expire in 10 minutes.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    throw error;
  }
};

