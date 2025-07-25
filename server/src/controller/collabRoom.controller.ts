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
    // const userId = 1;
    const userId = req?.user.id;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Valid userId is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get all collab rooms where user is either admin or team member
    const collabRoom = await prisma.collabRoom.findMany({
      where: {
        OR: [
          { adminId: userId },
          {
            collabRoomTeamMember: {
              some: {
                userId: userId,
              },
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
        },
        channel: {
          include: {
            channelAdmins: {
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
            },
            channelTeamMembers: {
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
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!collabRoom || collabRoom.length === 0) {
      logger.info("No collab room found");
      return res
        .status(404)
        .json({ success: false, message: "No collab room found" });
    }

    const collabRoomDataArray = collabRoom.map((room) => {
      const isAdmin = userId === room.admin?.id;

      return {
        id: room.id,
        companyName: room.companyName,
        adminName: room.adminName,
        adminId: room.adminId,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,

        admin: isAdmin
          ? {
              id: room.admin.id,
              name: room.admin.name,
              email: room.admin.email,
              profilePicture: room.admin.profilePicture,
            }
          : null,

        user: !isAdmin
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              profilePicture: user.profilePicture,
            }
          : null,

        roomTeamMember:
          room.collabRoomTeamMember?.map((member) => ({
            userId: member.userId,
            name: member.user.name,
            email: member.user.email,
            profession: member.profession,
            profilePicture: member.user.profilePicture,
          })) || [],

        channel:
          room.channel
            ?.map((data) => {
              const isMember = data.channelTeamMembers?.some(
                (member) => member.userId === userId
              );

              if (data.isPublic || isMember) {
                return {
                  channelId: data.id,
                  name: data.name,
                  isPublic: data.isPublic,
                  channelAdmins:
                    data.channelAdmins?.map((admin) => ({
                      adminId: admin.id,
                      adminName: admin.user.name,
                      adminemail: admin.user.email,
                      adminProfilePicture: admin.user.profilePicture,
                    })) || [],
                  channelTeamMembers: data?.channelTeamMembers.map((member) => {
                    id: member?.userId;
                    name: member?.user.name;
                    email: member?.user.email;
                    profilePicture: member?.user.profilePicture;
                  }),
                };
              }

              return null;
            })
            .filter(Boolean) || [],
      };
    });

    return res.status(200).json({
      success: true,
      message: "Collab rooms retrieved successfully",
      data: collabRoomDataArray,
      count: collabRoom.length,
    });
  } catch (error: any) {
    console.error("Error fetching collab rooms:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
