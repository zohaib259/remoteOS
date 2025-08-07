import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createMessage } from "../controller/message.controller";
import logger from "../utils/logger";
import { Server } from "socket.io";

const router = express.Router();

export const createMessageRouter = (io: Server) => {
  router.post("/send", authMiddleware, (req, res) => {
    createMessage(req, res, io).catch((err) => {
      logger.error(err);
      res.status(500).send("Internal Server Error");
    });
  });

  return router;
};
