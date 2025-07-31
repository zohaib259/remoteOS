import express, { Request, Response } from "express";
import { createChannel, getChannel } from "../controller/channel.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import logger from "../utils/logger";
import multer from "multer";
import { getSignature } from "../utils/getSignature";

const router = express.Router();

router.post("/create", authMiddleware, (req, res) => {
  createChannel(req, res).catch((err) => {
    logger.error(err);
    res.status(500).send("Internal Server Error");
  });
});

// Get channel by id
router.get("/get/:channelId", authMiddleware, (req, res) => {
  getChannel(req, res).catch((err) => {
    logger.error(err);
    res.status(500).send("Internal Server Error");
  });
});

// get signature for cloudinary signed uploads  files
router.get("/signature", authMiddleware, (req, res) => {
  getSignature(req, res).catch((err) => {
    logger.error(err);
    res.status(500).send("Internal Server Error");
  });;
});

export default router;
