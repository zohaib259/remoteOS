import { Request, Response } from "express";

export const invalidateCache = async (req: Request, input: string) => {
  const redis = (req as any).redisClient;
  await redis.del(input);
};
