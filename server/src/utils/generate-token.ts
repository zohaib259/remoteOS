import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = (user: {
  id: number;
  email: string;
  role: string;
}) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = () => {
  const token = crypto.randomBytes(40).toString("hex");
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hashed };
};
