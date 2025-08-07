import { Request, Response } from "express";
import logger from "../utils/logger";
import { sendMessageValidation } from "../utils/validation";
import prisma from "../utils/prisma";
import { Server } from "socket.io";

export const createMessage = async (
  req: Request,
  res: Response,
  io: Server
) => {
  logger.info(`createMessage endpoint hit`);
  try {
    const { channelId, content, mediaUrl, mediaPublicId } = req.body;
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
      logger.info("User not found");
      return res
        .status(404)
        .json({ success: true, message: "User found successfully" });
    }
    const existChannel = await prisma.channel.findUnique({
      where: {
        id: +channelId,
      },
      include: {
        collabRoom: true,
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
      where: { channelId: +channelId, userId: userId },
    });

    if (!userHasJoinedChannel) {
      logger.error("User has not joined the channel.");
      return res.status(403).json({ message: "User not in channel" });
    }

    const newMessage = await prisma.channelMessage.create({
      data: {
        content: content,
        mediaUrl: mediaUrl === undefined ? null : mediaUrl,
        mediaPublicId: mediaUrl === undefined ? null : mediaPublicId,
        user: {
          connect: { id: userId },
        },
        channel: {
          connect: { id: +channelId },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    // Emit to all users in the channel room
    io.to(`joinChannel-${channelId}`).emit("newMessage", {
      ...newMessage,
      channelId: channelId,
    });
    io.to(`room-${existChannel.collabRoom.id}-userId-${userId}`).emit(
      "newMessage",
      {
        ...newMessage,
        userId: userId,
        collabRoomId: existChannel.collabRoom.id,
      }
    );

    res.status(201).json({
      success: true,
      message: "Message created in db",
      data: newMessage,
    });
  } catch (error) {
    logger.error(`Error in sendMessage endpoint: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// get all messsages of channel
export const getAllMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      logger.warn("User ID is required");
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
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
    const userHasJoinedChannel = await prisma.channel.findFirst({
      where: {
        channelTeamMembers: {
          some: { userId: userId },
        },
      },
    });

    if (!userHasJoinedChannel) {
      logger.error(`User has not joined the channel ${userId}`);
      return res.status(404).json({
        success: false,
        message: `Please join the channel`,
      });
    }

    const messages = await prisma.channelMessage.findMany({
      where: {
        channelId: userHasJoinedChannel.id,
      },
      include: {
        user: true,
      },
    });

    if (messages.length === 0) {
      logger.error("No messages found for user in the specified channel.");

      return res.status(404).json({
        success: false,
        message: "No messages found for this user in the channel.",
        data: messages,
      });
    }

    res.status(200).json({
      success: true,
      message: "Messages retrieved successfully.",
      data: messages,
    });
  } catch (error) {
    logger.error(`Error in getting all messages endpoint: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
