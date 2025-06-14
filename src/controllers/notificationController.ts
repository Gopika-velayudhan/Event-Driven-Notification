import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { NotificationService } from '../services/notificationService';
import { NotificationFilter, NotificationStatus, EventType, Priority } from '../types';
import { logger } from '../utils/logger';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const {
        type,
        priority,
        startDate,
        endDate,
        status = NotificationStatus.SENT
      } = req.query;

      const filter: any = { userId, status };

      if (type && Object.values(EventType).includes(type as EventType)) {
        filter.eventType = type;
      }
      if (priority && Object.values(Priority).includes(priority as Priority)) {
        filter.priority = priority;
      }
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate as string);
        if (endDate) filter.createdAt.$lte = new Date(endDate as string);
      }

      const notifications = await Notification.find(filter)
        .populate('eventId')
        .sort({ createdAt: -1 });

      res.json(notifications);
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async bulkNotify(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { notifications } = req.body;

      if (!Array.isArray(notifications) || notifications.length === 0) {
        res.status(400).json({ error: 'Notifications array is required and must not be empty' });
        return;
      }

      // Validate notification structure
      for (const notification of notifications) {
        if (!notification.title || !notification.description || !notification.eventType || !notification.priority) {
          res.status(400).json({ error: 'Each notification must have title, description, eventType, and priority' });
          return;
        }
        if (!Object.values(EventType).includes(notification.eventType)) {
          res.status(400).json({ error: `Invalid event type: ${notification.eventType}` });
          return;
        }
        if (!Object.values(Priority).includes(notification.priority)) {
          res.status(400).json({ error: `Invalid priority: ${notification.priority}` });
          return;
        }
      }

      await this.notificationService.bulkNotify(userId, notifications);

      res.status(200).json({ message: 'Bulk notifications processed successfully' });
    } catch (error) {
      logger.error('Error in bulk notify:', error);
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: 'User not found' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getAllNotifications(req: Request, res: Response): Promise<void> {
    try {
      const notifications = await Notification.find()
        .populate('userId', 'name email')
        .populate('eventId')
        .sort({ createdAt: -1 });

      res.json(notifications);
    } catch (error) {
      logger.error('Error getting all notifications:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
