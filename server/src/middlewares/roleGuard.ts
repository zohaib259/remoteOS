import { Request, Response, NextFunction } from "express";

export function roleGuard(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ success: false, message: "Forbidden" });
    }
  };
}
