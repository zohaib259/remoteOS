import { Request, Response } from "express";
import logger from "../utils/logger";
import {
  loginValidation,
  newPasswordValidation,
  sendResetPasswordOpt,
  signUpValidation,
  verifyOtpValidation,
  verifyResendOtpValidation,
} from "../utils/validation";
import { sendEmail } from "../utils/email";
import prisma from "../utils/prisma";
import bcrypt from "bcrypt";
import { invalidateCache } from "../utils/invalidate-redis";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generate-token";
import crypto from "crypto";

// Register
export const register = async (req: Request, res: Response) => {
  try {
    const redis = (req as any).redisClient;

    logger.info(`create user endpoint hit`);
    const { name, email, password } = req.body;
    const { error } = signUpValidation.validate({ name, email, password });

    if (error) {
      logger.error(`Validation error: ${error.details[0].message}`);
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    }

    const existUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { name: name }],
      },
    });

    if (existUser) {
      logger.error(`user already exists`);
      return res
        .status(400)
        .send({ success: false, message: "user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10); // Encrypt OTP using bcrypt

    await redis.set(`otp:${email}`, hashedOtp, "EX", 300);

    await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        verified: false,
      },
    });
    await sendEmail(email, "Opt", otp); // Send the plain OTP to the user
    res.status(201).json({
      success: true,
      message: "we have sent you an OTP via email",
    });
  } catch (error) {
    logger.error(`Error creating user: ${error}`);
    res.status(500).send({ success: false, message: "Error creating user" });
  }
};

// verify otp
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const redis = (req as any).redisClient;

    const { email, otp }: { email: string; otp: number } = req.body;

    const { error } = verifyOtpValidation.validate({ email, otp });

    if (error) {
      logger.error(`Validation error: ${error.details[0].message}`);
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    }

    const existUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existUser) {
      logger.warn(`User not found`);
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    if (existUser.verified) {
      logger.warn(`User is already verified`);
      return res
        .status(400)
        .send({ success: false, message: "User is already verified" });
    }

    const storedOtp = await redis.get(`otp:${email}`);
    if (!storedOtp || storedOtp === null) {
      logger.error(`OTP has expired`);
      return res
        .status(400)
        .send({ success: false, message: "OTP has expired" });
    }

    const isCorrectOpt = await bcrypt.compare(otp.toString(), storedOtp);

    if (!isCorrectOpt) {
      logger.error(`Incorrect OTP`);
      return res.status(400).send({ success: false, message: "Incorrect OTP" });
    }
    await prisma.user.update({
      where: { email },
      data: { verified: true },
    });

    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    logger.error(`Error verifying OTP: ${error}`);
    res.status(500).send({ success: false, message: "Error verifying OTP" });
  }
};

// Resend otp
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const redis = (req as any).redisClient;

    const { email }: { email: string } = req.body;

    const { error } = verifyResendOtpValidation.validate({ email });

    if (error) {
      logger.error(`Validation error: ${error.details[0].message}`);
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    }

    const existUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existUser) {
      logger.warn(`User not found`);
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    if (existUser.verified) {
      logger.warn(`User is already verified`);
      return res
        .status(400)
        .send({ success: false, message: "User is already verified" });
    }

    const cacheKey = `otp:${email}`;
    await invalidateCache(req, cacheKey);

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendEmail(email, "Opt", newOtp); // send email
    const hashedOtp = await bcrypt.hash(newOtp, 10);

    await redis.set(`otp:${email}`, hashedOtp, "EX", 300);

    res.status(200).json({
      success: true,
      message: "Otp has resend successfully",
    });
  } catch (error) {
    logger.error(`Error resending OTP: ${error}`);
    res.status(500).send({ success: false, message: "Error resending OTP" });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: { email: string; password: string } = req.body;
    const { error } = loginValidation.validate({ email, password });

    if (error) {
      logger.error(`Validation error: ${error.details[0].message}`);
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    }

    const existUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existUser) {
      logger.warn(`User not found with email : ${email}`);
      return res
        .status(404)
        .send({ success: false, message: "Invalid credentials" });
    }

    if (!existUser.verified) {
      logger.warn(`User email is not verified`);
      return res
        .status(400)
        .send({ success: false, message: "Please verify your email" });
    }

    const isCorrectPassword = await bcrypt.compare(
      password,
      existUser.password
    );

    if (!isCorrectPassword) {
      logger.warn(` Password is wrong: ${password} email : ${email}`);
      return res
        .status(404)
        .send({ success: false, message: "Invalid credentials" });
    }

    // Access Token
    const accessToken = generateAccessToken({
      id: existUser.id,
      email: existUser.email,
      role: existUser.role,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 15 * 60 * 1000,
    });

    const { token, hashed } = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const existingToken = await prisma.refreshToken.findFirst({
      where: { userId: existUser.id },
    });

    if (existingToken) {
      await prisma.refreshToken.update({
        where: { id: existingToken.id },
        data: {
          token: hashed,
          expiresAt,
        },
      });
    } else {
      await prisma.refreshToken.create({
        data: {
          token: hashed,
          userId: existUser.id,
          expiresAt,
        },
      });
    }

    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...user } = existUser;

    res.status(200).json({
      success: true,
      message: "Loged in successfully",
      user,
      accessToken,
      token,
    });
  } catch (error) {
    logger.error(`Error while loging in : ${error}`);
    res.status(500).send({ success: false, message: "Error while loging in" });
  }
};

// Refresh access token
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    logger.info(`Refresh token endpoint hit`);

    const token = req.cookies.refreshToken;
    if (!token) {
      return res
        .status(401)
        .send({ success: false, message: "No token provided" });
    }

    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token: hashedRefreshToken },
      include: { user: true },
    });

    if (!refreshToken) {
      logger.error("Refresh token not found");
      return res.status(404).send({ success: false, message: "Invalid token" });
    }

    if (refreshToken.expiresAt < new Date()) {
      return res
        .status(401)
        .send({ success: false, message: "Token has expired" });
    }

    const accessToken = generateAccessToken({
      id: refreshToken.user.id,
      email: refreshToken.user.email,
      role: refreshToken.user.role,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "created new access token",
      token: accessToken,
    });
  } catch (error) {
    logger.error(`Error while refreshing access token: ${error}`);
    res
      .status(500)
      .send({ success: false, message: "Error while refreshing access token" });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    logger.info(`resetPasswordOpt endpoint hit`);

    const { email } = req.body;

    const { error } = sendResetPasswordOpt.validate({ email });

    if (error) {
      logger.warn(`Validation error ${error.details[0].message}`);
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    }

    const existUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existUser) {
      logger.warn(`User with email ${email} not found`);
      return res.status(404).send({
        success: false,
        message: `User with email ${email} not found`,
      });
    }

    const restPassToken = crypto.randomBytes(40).toString("hex");
    const hashedResetPassToken = crypto
      .createHash("sha256")
      .update(restPassToken)
      .digest("hex");

    const redis = (req as any).redisClient;
    const cacheKey = `restPassToken:${restPassToken}`;
    const resetUrl = `${
      process.env.CLIENT_URL as string
    }/new-password?token=${restPassToken}`;

    const existResetPassToken = await redis.get(cacheKey);
    if (existResetPassToken) {
      logger.info(`cache invalidated`);
      await invalidateCache(req, cacheKey);
    }
    const value = JSON.stringify({
      token: hashedResetPassToken,
      email: email,
    });

    await redis.set(cacheKey, value, "EX", 900);

    await sendEmail(email, "rest password token", resetUrl);

    res.status(201).json({
      success: true,
      message: "Reset password email sent",
    });
  } catch (error) {
    logger.error(`Error while resetting password: ${error}`);
    res
      .status(500)
      .send({ success: false, message: "Error while resetting password" });
  }
};

// New password
export const newPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    console.log("token", token);

    const { error } = newPasswordValidation.validate({ token, password });

    if (error) {
      logger.warn(`Validation error ${error.details[0].message}`);
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    }

    const redis = (req as any).redisClient;
    const cacheKey = `restPassToken:${token}`;

    const existResetPassToken = await redis.get(cacheKey);
    if (!existResetPassToken) {
      logger.error(`Reset password token is invalid or expired`);
      return res.status(400).send({
        success: false,
        message: "Reset password token is invalid or expired",
      });
    }

    const { token: cachedToken, email } = JSON.parse(existResetPassToken);

    const existUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!existUser) {
      logger.warn(`User not found`);
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    if (cachedToken !== hashedToken) {
      logger.error(`Token mismatch: ${cachedToken} !== ${hashedToken}`);
      return res.status(400).send({
        success: false,
        message: "Invalid Token ",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: {
        email: existUser.email,
      },
      data: {
        password: hashedPassword,
      },
    });

    await invalidateCache(req, cacheKey);
    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    logger.error(`Error while resetting password: ${error}`);
    res
      .status(500)
      .send({ success: false, message: "Error while resetting password" });
  }
};
