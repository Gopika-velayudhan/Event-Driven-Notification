import { Event, IEvent } from '../models/Event';
import { CreateEventRequest } from '../types';
import { NotificationService } from './notificationService';
import { logger } from '../utils/logger';

export class EventService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async createEvent(eventData: CreateEventRequest): Promise<IEvent> {
    try {
      const event = new Event(eventData);
      await event.save();

      logger.info(`Event created: ${event._id} - ${event.type} - ${event.priority}`);

      // Trigger notifications
      await this.notificationService.createNotificationsForEvent(event);

      return event;
    } catch (error) {
      logger.error('Error creating event:', error);
      throw error;
    }
  }

  async getAllEvents(): Promise<IEvent[]> {
    return await Event.find().sort({ createdAt: -1 });
  }

  async getEventById(id: string): Promise<IEvent | null> {
    return await Event.findById(id);
  }
}
