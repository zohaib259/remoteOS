import { Request, Response } from "express";
import logger from "../utils/logger";
import { addChannelValidation } from "../utils/validation";
import prisma from "../utils/prisma";

// Add channel
export const createChannel = async (req: Request, res: Response) => {
  logger.info(`addChannel enpoint hits`);
  try {
    const { channelName, visibility, members } = req.body;
    const userId = req.user?.id;

    const { error } = addChannelValidation.validate({
      channelName,
      visibility,
      members,
    });

    if (error) {
      logger.warn(`Validation error ${error.details[0].message}`);
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const userHasJoinedRoom = await prisma.collabRoom.findFirst({
      where: {
        id: 30,
        collabRoomTeamMember: {
          some: { userId: userId },
        },
      },
    });
    if (!userHasJoinedRoom) {
      return res
        .status(404)
        .json({ success: false, message: "User has not joined the room" });
    }

    const existChannel = await prisma.channel.findFirst({
      where: {
        name: channelName,
      },
    });

    if (existChannel) {
      return res
        .status(409)
        .json({ success: false, message: "Channel already exists" });
    }

    if (userId !== userHasJoinedRoom.adminId) {
      return res
        .status(403)
        .json({ success: false, message: "User is not the admin of the room" });
    }

    const newChannel = await prisma.channel.create({
      data: {
        name: channelName,
        isPublic: visibility === "public",
        collabRoom: {
          connect: {
            id: userHasJoinedRoom.id,
          },
        },
      },
    });

    const newChannelAdmin = await prisma.channelAdmin.create({
      data: {
        channel: {
          connect: { id: newChannel.id },
        },
        user: {
          connect: { id: userId },
        },
      },
    });

    await prisma.channelTeamMember.createMany({
      data: members.map((userId: number) => ({
        channelId: newChannel.id,
        userId: userId,
      })),
      skipDuplicates: true,
    });

    res.json({
      success: true,
      message: "Channel created successfully",
      data: newChannel,
    });
  } catch (error) {
    logger.error(`Error in addChannel endpoint: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// get channel by id
export const getChannel = async (req: Request, res: Response) => {
  logger.info(`getChannel endpoint hits`);
  try {
    const channelId = req.params.channelId;
    const userId = req.user?.id;

    if (!userId) {
      logger.warn("Validation error: User ID is missing");
      return res.status(400).json({
        success: false,
        message: "Validation error: User ID is missing",
      });
    }

    if (!channelId) {
      logger.warn("Validation error: Channel ID is missing");
      return res.status(400).json({
        success: false,
        message: "Validation error: Channel ID is missing",
      });
    }

    const userHasJoinedRoom = await prisma.collabRoom.findFirst({
      where: {
        id: 30,
        collabRoomTeamMember: {
          some: { userId: userId },
        },
      },
    });
    if (!userHasJoinedRoom) {
      return res
        .status(404)
        .json({ success: false, message: "User has not joined the room" });
    }
    const userHasJoinedChannel = await prisma.channel.findUnique({
      where: {
        id: +channelId,
      },
      include: {
        channelTeamMembers: {
          include: {
            user: true,
          },
        },
        channelAdmins: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!userHasJoinedChannel) {
      return res
        .status(404)
        .json({ success: false, message: "Channel not found" });
    }

    const cleanData = {
      channelId: userHasJoinedChannel.id,
      channelName: userHasJoinedChannel.name,
      isPublic: userHasJoinedChannel.isPublic,
      collabRoomId: userHasJoinedChannel.collabRoomId,
      createdAt: userHasJoinedChannel.createdAt,

      channelAdmins: userHasJoinedChannel.channelAdmins.map((admin) => ({
        adminId: admin.id,
        adminUserId: admin.user.id,
        adminName: admin.user.name,
        profilePicture: admin.user?.profilePicture,
      })),

      channelMembers: userHasJoinedChannel.channelTeamMembers.map((member) => ({
        memberId: member.id,
        memberUserId: member.user.id,
        memberName: member.user.name,
        memberEmail: member.user.email,
        memberprofilePicture: member.user.profilePicture,
      })),
    };

    res.json({
      success: true,
      data: cleanData,
    });
  } catch (error) {
    logger.error(`Error in getChannel endpoint: ${error}`);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
