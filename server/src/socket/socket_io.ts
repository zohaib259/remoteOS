import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "../utils/logger";
import cookie from "cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../utils/prisma";

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST", "DELETE", "PUT"],
    },
    pingInterval: 25000, // every 25s serve send ping
    pingTimeout: 6000, // in 6s if client do not respond with pong it close connection
  });

  return io;
};

export const registerSocketHandlers = (socket: Socket) => {
  const cookiesHeader = socket.handshake.headers.cookie;

  if (!cookiesHeader) {
    logger.error("No cookies found");
    return socket.disconnect();
  }

  const cookies = cookie.parse(cookiesHeader);

  const accessToken = cookies.accessToken;

  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as JwtPayload;
  } catch (err) {
    logger.error("Invalid or expired access token:", err);
    return socket.disconnect();
  }

  if (!decoded) {
    logger.error("Invalid access token in socket");
    return socket.disconnect();
  }

  // room connection
  socket.on("joinRoom", async (roomId: number, userId: number) => {
    if (userId !== decoded.id) {
      logger.warn(
        `Mismatched userId ${userId} and decoded jwt Id ${decoded.id}. Disconnecting.`
      );
      return socket.disconnect();
    }

    const existingMember = await prisma.collabRoomTeamMember.findFirst({
      where: {
        userId: decoded.id,
        roomId: roomId,
      },
    });

    if (!existingMember) {
      logger.warn(`user has not joined the room ${userId}`);
      return socket.disconnect();
    }

    const roomName = `room-${roomId}-userId-${userId}`;
    socket.join(roomName);
    logger.info(`🚪 User ${userId} joined room: ${roomName}`);
  });

  // Handles leaving a specific room within a channel
  socket.on("leaveRoom", (roomId: number, userId: number) => {
    const roomName = `room-${roomId}-userId-${userId}`;
    socket.leave(roomName);
    logger.info(`🚪 User ${userId} left room: ${roomName}`);
  });

  // Handles joining a general channel
  socket.on("joinChannel", async (channelId: number) => {
    const isUserjoinedChannel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        channelTeamMembers: {
          some: {
            userId: decoded.id,
          },
        },
      },
    });

    if (!isUserjoinedChannel) {
      logger.warn(`User ${decoded} has not joind the channel ${channelId}`);
      return socket.disconnect();
    }
    const roomName = `channel-${channelId}`;
    socket.join(roomName);
    logger.info(`📥 User ${channelId} joined channel: ${roomName}`);
  });

  // Handles leaving a general channel
  socket.on("leaveChannel", (channelId: number) => {
    const roomName = `channel-${channelId}`;
    socket.leave(roomName);
    logger.info(`🚪 User ${channelId} left channel: ${roomName}`);
  });
};
