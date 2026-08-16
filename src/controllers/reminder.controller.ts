import { Request, Response, NextFunction } from 'express';
import * as reminderService from '../services/reminder.service';
import ApiError from '../utils/ApiError';

export const setReminder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { eventId, reminderTime } = req.body;

    // Basic validation
    if (!eventId || !reminderTime) {
      return next(new ApiError(400, 'eventId and reminderTime (ISO Date) are required.'));
    }

    const reminder = await reminderService.setReminder(
      user._id, 
      eventId, 
      new Date(reminderTime)
    );

    res.status(201).json({
      statusCode: 201,
      data: reminder,
      message: 'Reminder set successfully!',
    });
  } catch (error: any) {
    // Forward specific errors like "must purchase a ticket" to the client
    next(new ApiError(400, error.message));
  }
};
