import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

export const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details.map((detail: any) => detail.message).join(', ');
      return next(new ApiError(400, message));
    }
    next();
  };
};
