import { Router } from "express";
import { adminLogin, getMe, login, register, verifyOTP } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.post("/admin-login", adminLogin);
router.get("/me", protectRoute, getMe);

export default router;
