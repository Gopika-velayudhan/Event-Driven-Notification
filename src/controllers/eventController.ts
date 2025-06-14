import { Request, Response } from 'express';
import { EventService } from '../services/eventService';
import { CreateEventRequest } from '../types';
import { logger } from '../utils/logger';

export class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventData: CreateEventRequest = req.body;
      const event = await this.eventService.createEvent(eventData);

      res.status(201).json({
        id: event._id,
        type: event.type,
        priority: event.priority,
        data: event.data,
        createdAt: event.createdAt
      });
    } catch (error) {
      logger.error('Error creating event:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await this.eventService.getAllEvents();
      res.json(events);
    } catch (error) {
      logger.error('Error getting events:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const event = await this.eventService.getEventById(id);
      
      if (!event) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      res.json(event);
    } catch (error) {
      logger.error('Error getting event:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}