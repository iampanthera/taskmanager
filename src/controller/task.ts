import { Request, Response } from 'express';
import Task from '../models/task';
import User from '../models/user';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q, filter, limit, skip } = req.query as unknown as {
      q: string;
      filter: string;
      limit: string;
      skip: string;
    };

    // Build query object
    let queryObject = {};
    if (q) {
      queryObject = {
        $text: { $search: q },
      };
    }
    if (filter) {
      try {
        const parsedFilter = JSON.parse(filter);
        queryObject = { ...queryObject, ...parsedFilter };
      } catch (error) {
        // Handle invalid filter format
        return res.status(400).json({ message: 'Invalid filter format' });
      }
    }

    // Apply pagination if parameters provided
    const options = {} as unknown as { limit: number; skip: number };
    if (limit) {
      options.limit = parseInt(limit);
    }
    if (skip) {
      options.skip = parseInt(skip);
    }

    const tasks = await Task.find(queryObject, options).select({
      _id: 0,
      title: 1,
      description: 1,
      tags: 1,
      priority: 1,
      dueDate: 1,
      status: 1,
    });

    console.log({ tasks });
    res.json({ tasks });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task?.user?.toString() !== req?.userId) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task' });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, dueDate, priority, tags } = req.body;

    const user = await User.findById(req?.userId);

    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      tags,
      user: user?._id,
    });

    await task.save();
    res.json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task' });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, dueDate, priority, tags, status } = req.body;

    console.log({ id: req.params.id });

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task?.user?.toString() !== req.userId) {
      return res.status(401).json({ message: 'Unauthorized access' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;
    task.tags = tags || task.tags;
    task.status = status || task.status;

    await task.save();
    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  const taskId = req.params.id;
  const userId = req.userId;

  try {
    await Task.findByIdAndDelete(taskId, { where: { user: userId } });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
};
