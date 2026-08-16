import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Get the user object attached by the auth middleware
    const user = (req as any).user;

    // 2. If no user is attached, it means auth middleware failed or wasn't used
    if (!user) {
      return next(new ApiError(401, 'Unauthorized. Please log in.'));
    }

    // 3. Check if the user's role matches any of the allowed roles
    if (!allowedRoles.includes(user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Required role: ${allowedRoles.join(' or ')}, but you are: ${user.role}.`
        )
      );
    }

    // 4. If the role is allowed, pass control to the next middleware/controller
    next();
  };
};
