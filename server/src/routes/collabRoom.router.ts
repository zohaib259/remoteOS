import express from "express";
import {
  createCollabRoom,
  getCollabRoomsWithChannelsByUserId,
} from "../controller/collabRoom.controller";
import logger from "../utils/logger";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/create", authMiddleware, (req, res) => {
  createCollabRoom(req, res).catch((err) => {
    logger.error(err);
    res.status(500).send("Internal Server Error");
  });
});

router.get("/get", authMiddleware, (req, res) => {
  getCollabRoomsWithChannelsByUserId(req, res).catch((err) => {
    logger.error(err);
    res.status(500).send("Internal Server Error");
  });
});

export default router;
