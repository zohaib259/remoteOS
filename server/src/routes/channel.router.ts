import express from "express";
import { createChannel } from "../controller/channel.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import logger from "../utils/logger";

const router = express.Router();

router.post("/create", authMiddleware, (req, res) => {
  createChannel(req, res).catch((err) => {
    logger.error(err);
    res.status(500).send("Internal Server Error");
  });
});

export default router;
