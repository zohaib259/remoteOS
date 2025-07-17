import { Request, Response } from "express";
import logger from "../utils/logger";
import { collabRoomValidation } from "../utils/validation";
import prisma from "../utils/prisma";
import crypto from "crypto";
import { sendEmail } from "../utils/email";

export const createCollabRoom = async (req: Request, res: Response) => {
  logger.info(`Create collabRoom end point hit`);
  const redis = (req as any).redisClient;

  try {
    const { companyName, userName, userId, teamMembers } = req.body;

    const { error } = collabRoomValidation.validate({
      companyName,
      userName,
      userId,
      teamMembers,
    });

    if (error) {
      logger.error(`Validation error: ${error.details[0].message}`);
      return res
        .status(400)
        .send({ success: false, message: error.details[0].message });
    }

    const existUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!existUser) {
      logger.error(`User with ID ${userId} does not exist`);
      return res
        .status(404)
        .json({ success: false, message: `User does not exist` });
    }

    // Transaction logic starts here
    await prisma.$transaction(async (tx) => {
      const newCollabRooms = await tx.collabRoom.create({
        data: {
          companyName,
          adminName: userName,
          adminId: userId,
        },
      });

      if (Array.isArray(teamMembers) && teamMembers.length > 0) {
        const existingUsers = await tx.user.findMany({
          where: {
            email: {
              in: teamMembers.map((member: string) => member),
            },
          },
        });

        const existingEmails = new Set(existingUsers.map((user) => user.email));
        const existingIds = new Set(existingUsers.map((user) => user.id));

        const toInvite: string[] = [];
        for (const member of teamMembers) {
          if (!existingEmails.has(member)) {
            toInvite.push(member.toLowerCase());
          }
        }

        const toConnect = Array.from(existingIds).map((id) => ({ id }));

        await tx.collabRoom.update({
          where: { id: newCollabRooms.id },
          data: {
            teamMembers: {
              connect: toConnect,
            },
          },
        });

        // Send invites (outside Prisma tx)
        for (const email of toInvite) {
          const token = crypto.randomBytes(32).toString("hex");
          const inviteLink = `${process.env.CLIENT_URL}/invite/?token=${token}`;
          await redis.set(
            token,
            JSON.stringify({
              email,
              roomId: newCollabRooms.id,
              token,
            }),
            "EX",
            30 * 60
          );
          sendEmail(
            email,
            `${companyName} has invited you to join RemoteOS`,
            `You have been invited to join ${companyName} on RemoteOS. Click here to join: ${inviteLink}`
          );
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
    });
  } catch (error) {
    logger.error(`Error while creating collab room ${error}`);
    res
      .status(500)
      .json({ success: false, message: "Error while creating collab room" });
  }
};
