import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    
    const token = req.cookies.accessToken;
    
    if (!token) {
      res.status(401).send({ success: false, message: "Unauthorized" });
      return;
    }
    
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );

    if (!decoded) {
      res.status(401).send({ success: false, message: "Invalid token" });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error(`Error in auth middleware: ${error}`);
    res
      .status(500)
      .send({ success: false, message: "Error in auth middleware" });
  }
};
