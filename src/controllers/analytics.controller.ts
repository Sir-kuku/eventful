import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service';

export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const data = await analyticsService.getCreatorAnalytics(user._id);

    res.status(200).json({
      statusCode: 200,
      data: data,
      message: 'Analytics overview fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};
