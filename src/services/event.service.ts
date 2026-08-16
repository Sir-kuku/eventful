import mongoose, { FilterQuery } from 'mongoose';
import { Event } from '../models/Event.model';
import { redis } from '../config/redis';

const invalidateEventCache = async (eventId?: string) => {
  await redis.del('cache:/api/v1/events');
  if (eventId) { await redis.del(`cache:/api/v1/events/${eventId}`); }
  console.log('?? Event cache invalidated due to data change.');
};

export const createEvent = async (data: any, creatorId: string) => {
  const event = await Event.create({ ...data, created_by: creatorId });
  await invalidateEventCache();
  return event;
};

export const getAllEvents = async (filters: any, page = 1, limit = 10) => {
  const query: FilterQuery<any> = {};
  if (filters.category) query.category = filters.category;
  if (filters.location) query.location = { $regex: filters.location, $options: 'i' };
  if (filters.is_active !== undefined) query.is_active = filters.is_active === 'true';
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }
  const skip = (page - 1) * limit;
  const events = await Event.find(query).populate('created_by', 'name email').skip(skip).limit(limit).sort({ createdAt: -1 });
  const total = await Event.countDocuments(query);
  return { events, total, page, limit };
};

export const getEventById = async (eventId: string) => {
  return await Event.findById(eventId).populate('created_by', 'name email');
};

export const updateEvent = async (eventId: string, userId: string, data: any) => {
  const event = await Event.findOne({ _id: eventId, created_by: userId } as any);
  if (!event) return null;
  Object.assign(event, data);
  await event.save();
  await invalidateEventCache(eventId);
  return event;
};

export const deleteEvent = async (eventId: string, userId: string) => {
  const event = await Event.findOneAndDelete({ _id: eventId, created_by: userId } as any);
  if (event) { await invalidateEventCache(eventId); }
  return event;
};
