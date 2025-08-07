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
      const newCollabRoom = await tx.collabRoom.create({
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

        await Promise.all(
          Array.from(toConnect).map((userId) =>
            tx.collabRoomTeamMember.create({
              data: {
                user: { connect: { id: userId.id } },
                room: { connect: { id: newCollabRoom.id } },
              },
            })
          )
        );

        // create all and social channels automatically
        const newChannel = await tx.channel.create({
          data: {
            name: `all ${newCollabRoom.companyName}`,
            isPublic: true,
            collabRoom: {
              connect: {
                id: newCollabRoom.id,
              },
            },
          },
        });
        const newChannelAdmin = await tx.channelAdmin.create({
          data: {
            channel: {
              connect: {
                id: newChannel.id,
              },
            },
            user: {
              connect: {
                id: userId,
              },
            },
          },
        });
        await Promise.all(
          Array.from(toConnect).map((userId) =>
            tx.channelTeamMember.create({
              data: {
                channel: {
                  connect: {
                    id: newChannel.id,
                  },
                },
                user: {
                  connect: {
                    id: userId.id,
                  },
                },
              },
            })
          )
        );

        // Send invites (outside Prisma tx)
        for (const email of toInvite) {
          const token = crypto.randomBytes(32).toString("hex");
          const inviteLink = `${process.env.CLIENT_URL}/invite/?token=${token}`;
          await redis.set(
            token,
            JSON.stringify({
              email,
              roomId: newCollabRoom.id,
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

// Get collab room with channels by userId ID
interface TeamMemberData {
  id: number;
  name: string;
  email: string;
  profilePicture: string | null;
  role: string;
  joinedAt: Date;
}

// Get collab room with channels by userId ID
export const getCollabRoomsWithChannelsByUserId = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req?.user?.id;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Valid userId is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const collabRooms = await prisma.collabRoom.findMany({
      where: {
        OR: [
          { adminId: userId },
          {
            collabRoomTeamMember: {
              some: { userId },
            },
          },
        ],
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
        collabRoomTeamMember: {
          select: {
            userId: true,
            profession: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
        channel: {
          include: {
            channelAdmins: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                    profilePicture: true,
                  },
                },
              },
            },
            channelTeamMembers: {
              select: {
                userId: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                    profilePicture: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!collabRooms || collabRooms.length === 0) {
      logger.info("No collab room found");
      return res
        .status(404)
        .json({ success: false, message: "No collab room found" });
    }

    // Minimal transformation to match exact frontend expectations
    const collabRoomDataArray = collabRooms.map((room) => {
      const isAdmin = room.adminId === userId;

      return {
        id: room.id,
        companyName: room.companyName,
        adminName: room.adminName,
        adminId: room.adminId,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,

        admin: isAdmin ? room.admin : null,
        user: !isAdmin ? user : null,

        roomTeamMember: room.collabRoomTeamMember.map((member) => ({
          userId: member.userId,
          name: member.user.name,
          email: member.user.email,
          profession: member.profession,
          profilePicture: member.user.profilePicture,
        })),

        channel: room.channel
          .map((channel) => {
            const isMember = channel.channelTeamMembers.some(
              (member) => member.userId === userId
            );

            if (channel.isPublic || isMember) {
              return {
                channelId: channel.id,
                name: channel.name,
                isPublic: channel.isPublic,
                channelAdmins: channel.channelAdmins.map((admin) => ({
                  adminId: admin.id,
                  adminName: admin.user.name,
                  adminemail: admin.user.email,
                  adminProfilePicture: admin.user.profilePicture,
                })),
                channelTeamMembers: channel.channelTeamMembers.map(
                  (member) => ({
                    id: member.userId,
                    name: member.user.name,
                    email: member.user.email,
                    profilePicture: member.user.profilePicture,
                  })
                ),
              };
            }

            return null;
          })
          .filter(Boolean),
      };
    });

    return res.status(200).json({
      success: true,
      message: "Collab rooms retrieved successfully",
      data: collabRoomDataArray,
      count: collabRoomDataArray.length,
    });
  } catch (error: any) {
    logger.error("Error fetching collab rooms:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
