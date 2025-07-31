// backend: Node.js (Express)
import crypto from "crypto";
import dotenv from "dotenv";
import { Request, Response } from "express";
dotenv.config();

export const getSignature = async (req: Request, res: Response) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = "remoteOs_signed_upload"; // optional
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + process.env.CLOUDINARY_API_SECRET)
    .digest("hex");

  res.json({ signature, timestamp, folder });
};
