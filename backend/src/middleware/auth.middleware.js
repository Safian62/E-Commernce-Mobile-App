import { User } from "../models/user.model.js";
import { ENV } from "../config/env.js";

import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - no token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!ENV.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in protectRoute middleware", error);

    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized - invalid or expired token" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized - user not found" });
  }

  if (req.user.email !== ENV.ADMIN_EMAIL) {
    return res.status(403).json({ message: "Forbidden - admin access only" });
  }

  next();
};
