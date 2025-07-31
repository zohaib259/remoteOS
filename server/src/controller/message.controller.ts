import { Request, Response } from "express";
import logger from "../utils/logger";
import { sendMessageValidation } from "../utils/validation";
import prisma from "../utils/prisma";

export const sendMessage = async (req: Request, res: Response) => {
  logger.info(`sendMessage endpoint hit`);
  try {
    const { channelId, content, mediaUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      logger.warn("User ID is required");
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const { error } = sendMessageValidation.validate({
      channelId,
      content,
      mediaUrl,
    });

    if (error) {
      logger.error(`Validation error: ${error.details[0].message}`);
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const existUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existUser) {
      logger.info("User found successfully");
      return res
        .status(200)
        .json({ success: true, message: "User found successfully" });
    }
    const existChannel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!existChannel) {
      logger.error(`Channel with ID ${channelId} not found`);
      return res.status(404).json({
        success: false,
        message: `Channel with ID ${channelId} not found`,
      });
    }

    const userHasJoinedChannel = await prisma.channelTeamMember.findFirst({
      where: { channelId: channelId, userId: userId },
    });

    if (!userHasJoinedChannel) {
      logger.error("User has not joined the channel.");
      res.status(403).json({ message: "User not in channel" });
    }

    const newMessage = prisma.channelMessage.create({
      data: {
        senderId: userId,
        content: content,
        mediaUrl: mediaUrl === undefined ? null : mediaUrl,
      },
    });

    res.status(201).json({
      success: true,
      message: "Message created in db",
    });
  } catch (error) {
    logger.error(`Error in sendMessage endpoint: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
