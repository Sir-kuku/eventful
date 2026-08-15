import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/task.model';
import ApiError from '../utils/ApiError';

// 1. CREATE TASK (You already have this)
export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, status } = req.body;
    const user = (req as any).user;

    if (!user) return next(new ApiError(401, 'Unauthorized'));

    const task = await Task.create({ title, description, status, user: user._id });

    res.status(201).json({
      statusCode: 201,
      data: task,
      message: 'Task created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET ALL TASKS (For the logged-in user)
export const getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    // Find tasks where the 'user' field matches the current user's ID
    const tasks = await Task.find({ user: user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      statusCode: 200,
      data: tasks,
      message: 'Tasks fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 3. GET SINGLE TASK
export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    // Find the task ensuring it belongs to the current user
    const task = await Task.findOne({ _id: id, user: user._id });

    if (!task) return next(new ApiError(404, 'Task not found'));

    res.status(200).json({
      statusCode: 200,
      data: task,
      message: 'Task fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 4. UPDATE TASK
export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    // Find task, ensure it belongs to user, and update it. 
    // { new: true } returns the updated task. { runValidators: true } checks schema validation.
    const task = await Task.findOneAndUpdate(
      { _id: id, user: user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) return next(new ApiError(404, 'Task not found'));

    res.status(200).json({
      statusCode: 200,
      data: task,
      message: 'Task updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// 5. DELETE TASK
export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, user: user._id });

    if (!task) return next(new ApiError(404, 'Task not found'));

    // Usually 200 or 204 (No Content) for deletions. We'll send 200 with a message.
    res.status(200).json({
      statusCode: 200,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};