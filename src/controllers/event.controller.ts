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
    // Cast query params safely
    const filters = {
      category: category as string,
      location: location as string,
      search: search as string,
      is_active: is_active as string
    };

    const result = await eventService.getAllEvents(
      filters,
      Number(page as string) || 1,
      Number(limit as string) || 10
    );

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
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    if (!event) return next(new ApiError(404, 'Event not found'));

    const shareLinks = generateShareLinks(event._id.toString(), event.title, event.date.toISOString().split('T')[0]);
    res.status(200).json({ statusCode: 200, data: { ...event.toObject(), shareLinks }, message: 'Event fetched successfully' });
  } catch (error) { next(error); }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const event = await eventService.updateEvent(id, user._id, req.body);
    if (!event) return next(new ApiError(404, 'Event not found or you are not the owner'));
    res.status(200).json({ statusCode: 200, data: event, message: 'Event updated successfully' });
  } catch (error) { next(error); }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const event = await eventService.deleteEvent(id, user._id);
    if (!event) return next(new ApiError(404, 'Event not found or you are not the owner'));
    res.status(200).json({ statusCode: 200, message: 'Event deleted successfully' });
  } catch (error) { next(error); }
};
