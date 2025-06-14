import crypto from 'crypto';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { Event, IEvent } from '../models/Event';
import { Notification, INotification } from '../models/Notification';
import { NotificationMethod, NotificationStatus, Priority } from '../types';
import { logger } from '../utils/logger';

export class NotificationService {
  private async sendEmail(to: string, title: string, description: string): Promise<void> {
    logger.info(`📧 EMAIL sent to ${to}: ${title} - ${description}`);
  }

  private async sendSMS(to: string, title: string, description: string): Promise<void> {
    logger.info(`📱 SMS sent to ${to}: ${title} - ${description}`);
  }

  private async sendInApp(userId: string, title: string, description: string): Promise<void> {
    logger.info(`🖥️ IN-APP notification sent to user ${userId}: ${title} - ${description}`);
  }

  private generateDuplicateHash(userId: string, eventId: string, method: NotificationMethod): string {
    return crypto.createHash('md5').update(`${userId}-${eventId}-${method}`).digest('hex');
  }

  async createNotificationsForEvent(event: IEvent): Promise<void> {
    try {
      const users: IUser[] = await User.find({ 'preferences.eventType': event.type });

      const notifications: INotification[] = [];

      for (const user of users) {
        const preference = user.preferences.find(p => p.eventType === event.type);
        if (!preference) continue;

        const userIdStr = (user._id as mongoose.Types.ObjectId).toString();
        const eventIdStr = (event._id as mongoose.Types.ObjectId).toString();

        for (const method of preference.methods) {
          const duplicateHash = this.generateDuplicateHash(userIdStr, eventIdStr, method);

          const existingNotification = await Notification.findOne({
            userId: user._id,
            eventId: event._id,
            method
          });

          if (existingNotification) {
            logger.info(`⚠️ Duplicate notification prevented for user ${userIdStr}, event ${eventIdStr}, method ${method}`);
            continue;
          }

          notifications.push(new Notification({
            userId: user._id,
            eventId: event._id,
            eventType: event.type,
            priority: event.priority,
            method,
            title: event.data.title,
            description: event.data.description,
            duplicateHash,
            status: NotificationStatus.PENDING
          }));
        }
      }

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        logger.info(`✅ Created ${notifications.length} notifications for event ${event._id}`);
      }

      if (event.priority === Priority.HIGH) {
        await this.sendHighPriorityNotifications((event._id as mongoose.Types.ObjectId).toString());
      }
    } catch (error) {
      logger.error('❌ Error creating notifications for event:', error);
      throw error;
    }
  }

  private async sendHighPriorityNotifications(eventId: string): Promise<void> {
    const notifications = await Notification.find({
      eventId: new mongoose.Types.ObjectId(eventId),
      priority: Priority.HIGH,
      status: NotificationStatus.PENDING
    }).populate('userId');

    for (const notification of notifications) {
      await this.sendNotification(notification);
    }
  }

  async sendLowPriorityNotifications(): Promise<void> {
    const notifications = await Notification.find({
      priority: Priority.LOW,
      status: NotificationStatus.PENDING
    }).populate('userId');

    for (const notification of notifications) {
      await this.sendNotification(notification);
    }
  }

  private async sendNotification(notification: INotification): Promise<void> {
    try {
    const user = notification.userId as IUser;

    if (!user || typeof user !== 'object' || !('email' in user)) {
      logger.warn(`User not populated in notification ${notification._id}`);
      notification.status = NotificationStatus.FAILED;
      await notification.save();
      return;
    }


      switch (notification.method) {
      case NotificationMethod.EMAIL:
        await this.sendEmail(user.email, notification.title, notification.description);
        break;
      case NotificationMethod.SMS:
        if (user.phone) {
          await this.sendSMS(user.phone, notification.title, notification.description);
        }
        break;
      case NotificationMethod.IN_APP:
        await this.sendInApp((user._id as mongoose.Types.ObjectId).toString(), notification.title, notification.description);
        break;
    }

      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
      await notification.save();
    } catch (error) {
      logger.error(`❌ Error sending notification ${notification._id}:`, error);
      notification.status = NotificationStatus.FAILED;
      await notification.save();
    }
  }

  async bulkNotify(
    userId: string,
    notifications: Array<{
      title: string;
      description: string;
      eventType: string;
      priority: Priority;
    }>
  ): Promise<void> {
    const user = await User.findById(userId) as IUser;
    if (!user) throw new Error('User not found');

    for (const notificationData of notifications) {
      const preference = user.preferences.find(p => p.eventType === notificationData.eventType);
      if (!preference) continue;

      const tempEvent = new Event({
        type: notificationData.eventType,
        priority: notificationData.priority,
        data: {
          title: notificationData.title,
          description: notificationData.description
        }
      });
      await tempEvent.save();

      const tempEventIdStr = (tempEvent._id as mongoose.Types.ObjectId).toString();

      for (const method of preference.methods) {
        const duplicateHash = this.generateDuplicateHash(userId, tempEventIdStr, method);

        const notification = new Notification({
          userId,
          eventId: tempEvent._id,
          eventType: notificationData.eventType,
          priority: notificationData.priority,
          method,
          title: notificationData.title,
          description: notificationData.description,
          duplicateHash,
          status: NotificationStatus.PENDING
        });

        await notification.save();

        if (notificationData.priority === Priority.HIGH) {
          await this.sendNotification(notification);
        }
      }
    }
  }
}
