import { Request, Response, NextFunction } from 'express';
import * as eventService from '../services/event.service';
import ApiError from '../utils/ApiError';
import { generateShareLinks } from '../utils/shareLinks';

// 1. CREATE EVENT
export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creator = (req as any).user;
    const event = await eventService.createEvent(req.body, creator._id);

    res.status(201).json({
      statusCode: 201,
      data: event,
      message: 'Event created successfully',
    });
  } catch (error) { next(error); }
};

// 2. GET ALL EVENTS
export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, location, search, is_active, page, limit } = req.query;
    const result = await eventService.getAllEvents(
      { category, location, search, is_active },
      Number(page) || 1,
      Number(limit) || 10
    );

    res.status(200).json({
      statusCode: 200,
      data: result.events,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      },
      message: 'Events fetched successfully',
    });
  } catch (error) { next(error); }
};

// 3. GET SINGLE EVENT (UPDATED WITH SHARE LINKS)
export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    if (!event) return next(new ApiError(404, 'Event not found'));

    // Generate the share links using the utility function
    const shareLinks = generateShareLinks(
      event._id.toString(), 
      event.title, 
      event.date.toISOString().split('T')[0]
    );

    // Convert event to object and append shareLinks
    const eventObject = event.toObject();
    
    res.status(200).json({
      statusCode: 200,
      data: { ...eventObject, shareLinks },
      message: 'Event fetched successfully',
    });
  } catch (error) { next(error); }
};

// 4. UPDATE EVENT
export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const event = await eventService.updateEvent(id, user._id, req.body);
    if (!event) return next(new ApiError(404, 'Event not found or you are not the owner'));

    res.status(200).json({
      statusCode: 200,
      data: event,
      message: 'Event updated successfully',
    });
  } catch (error) { next(error); }
};

// 5. DELETE EVENT
export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const event = await eventService.deleteEvent(id, user._id);
    if (!event) return next(new ApiError(404, 'Event not found or you are not the owner'));

    res.status(200).json({
      statusCode: 200,
      message: 'Event deleted successfully',
    });
  } catch (error) { next(error); }
};
