import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import Redis from "ioredis";
import dotenv from "dotenv";
import logger from "./utils/logger";
import { errorhandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.router";
import RedisStore from "rate-limit-redis";
import cookieParser from "cookie-parser";
import collabRoomRoutes from "./routes/collabRoom.router";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://your-frontend.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true, // allow cookies/token headers
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(cookieParser());

const redisClient = new Redis(process.env.REDIS_URL || "");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoints rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many requests",
    });
  },

  store: new RedisStore({
    sendCommand: (...args: (string | number)[]) =>
      (redisClient.call as any)(...args),
  }),
});

app.use(helmet());
app.use(errorhandler);
app.use(limiter);

const allowedOrigins = ["http://localhost:5173", process.env.CLIENT_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true, // allow cookies/token headers
    optionsSuccessStatus: 200,
  })
);

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.info(`${req.method} methed recieved for ${req.url} `);
    logger.info(`Request body ${JSON.stringify(req.body)}`);
    next();
  }
);

// Auth routes
app.use(
  "/api/auth",
  (req: Request, res: Response, next: NextFunction) => {
    (req as any).redisClient = redisClient;
    next();
  },
  authRoutes
);

// Collab room routes
app.use(
  "/api/room",
  (req: Request, res: Response, next: NextFunction) => {
    (req as any).redisClient = redisClient;
    next();
  },
  collabRoomRoutes
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.warn(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});
