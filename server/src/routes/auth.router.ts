// src/routes/auth.routes.ts
import express from "express";
import {
  googleLogin,
  login,
  newPassword,
  refreshAccessToken,
  register,
  resendOtp,
  resetPassword,
  verifyOtp,
} from "../controller/auth.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import logger from "../utils/logger";
import { roleGuard } from "../middlewares/roleGuard";

const router = express.Router();

router.post("/register", (req, res) => {
  register(req, res).catch((err) => {
    logger.error(err);
    res.status(500).send("Internal Server Error");
  });
});

router.post("/verify-otp", (req, res) => {
  verifyOtp(req, res).catch((err) => {
    logger.error(err);
    res.status(500).send("Internal Server Error");
  });
});

router.post("/verify-otp/resend", (req, res) => {
  resendOtp(req, res).catch((err) => {
    logger.error(err);
    res.status(500).send("Internal Server Error");
  });
});

router.post("/login", (req, res) => {
  login(req, res).catch((err) => {
    logger.error(err);
    res.status(500).send("Internal Server Error");
  });
});

router.get("/refresh-token", (req, res) => {
  refreshAccessToken(req, res).catch((err) => {
    logger.error(err);
    res.status(500).send("Internal Server Error");
  });
});

router.post("/protected", authMiddleware, roleGuard("user"), (req, res) => {
  res.status(200).json("protected");
});

router.post("/send-reset-pass-token", (req, res) => {
  resetPassword(req, res).catch((err) => {
    logger.error(err);
    res.status(500).send("Internal Server Error");
  });
});

router.post("/new-password", (req, res) => {
  newPassword(req, res).catch((err) => {
    logger.error(err);
    res.status(500).send("Internal Server Error");
  });
});

router.post("/google-login", (req, res) => {
  googleLogin(req, res).catch((err) => {
    logger.error(err);
    res.status(500).send("Internal Server Error");
  });
});

router.get("/check-auth", authMiddleware, (req, res, next) => {
  const user = req.user;
  res.json({ success: true, message: "User Authenticated", user });
});

export default router;
