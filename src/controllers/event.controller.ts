import { Request, Response, NextFunction } from 'express';
import * as eventService from '../services/event.service';
import ApiError from '../utils/ApiError';
import { generateShareLinks } from '../utils/shareLinks';

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creator = (req as any).user;
    const event = await eventService.createEvent(req.body, creator._id);
    res.status(201).json({ statusCode: 201, data: event, message: 'Event created successfully' });
  } catch (error) { next(error); }
};

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, location, search, is_active, page, limit } = req.query;
    
    // ? PERFECT FIX: String() converts ANY Express query type to a string, no type errors.
    const filters = {
      category: String(category || ''),
      location: String(location || ''),
      search: String(search || ''),
      is_active: String(is_active || '')
    };

    const limitNum = Number(String(limit)) || 10;
    const pageNum = Number(String(page)) || 1;

    const result = await eventService.getAllEvents(filters, limitNum, pageNum);

    res.status(200).json({
      statusCode: 200,
      data: result.events,
      pagination: { total: result.total, page: result.page, limit: result.limit, totalPages: Math.ceil(result.total / result.limit) },
      message: 'Events fetched successfully',
    });
  } catch (error) { next(error); }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ? req.params.id is always a string, but TS wrongly infers it as string|string[]. Explicit cast fixes it.
    const id = req.params.id as string;
    const event = await eventService.getEventById(id);
    if (!event) return next(new ApiError(404, 'Event not found'));

    const shareLinks = generateShareLinks(event._id.toString(), event.title, event.date.toISOString().split('T')[0]);
    res.status(200).json({ statusCode: 200, data: { ...event.toObject(), shareLinks }, message: 'Event fetched successfully' });
  } catch (error) { next(error); }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = (req as any).user;
    const event = await eventService.updateEvent(id, user._id, req.body);
    if (!event) return next(new ApiError(404, 'Event not found or you are not the owner'));
    res.status(200).json({ statusCode: 200, data: event, message: 'Event updated successfully' });
  } catch (error) { next(error); }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const user = (req as any).user;
    const event = await eventService.deleteEvent(id, user._id);
    if (!event) return next(new ApiError(404, 'Event not found or you are not the owner'));
    res.status(200).json({ statusCode: 200, message: 'Event deleted successfully' });
  } catch (error) { next(error); }
};
