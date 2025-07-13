import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

export const errorhandler = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.stack);

  res.status(500).json({
    message: err.message || "Internal server error",
  });
};
