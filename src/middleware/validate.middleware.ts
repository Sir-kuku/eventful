import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import ApiError from '../utils/ApiError';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new ApiError(400, message));
    }
    next();
  };
};