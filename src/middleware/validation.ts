// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { EventType, NotificationMethod, Priority } from '../types';

type ValidationTarget = 'user' | 'event';

export const validateRequest = (target: ValidationTarget) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (target === 'user') {
        const { name, email, preferences } = req.body;

        if (!name || !email || !preferences) {
          res.status(400).json({ error: 'Name, email, and preferences are required' });
          return;
        }

        if (!Array.isArray(preferences)) {
          res.status(400).json({ error: 'Preferences must be an array' });
          return;
        }

        for (const pref of preferences) {
          if (!Object.values(EventType).includes(pref.eventType)) {
            res.status(400).json({ error: `Invalid event type: ${pref.eventType}` });
            return;
          }

          if (!Array.isArray(pref.methods) || pref.methods.length === 0) {
            res.status(400).json({ error: 'Each preference must have at least one notification method' });
            return;
          }

          for (const method of pref.methods) {
            if (!Object.values(NotificationMethod).includes(method)) {
              res.status(400).json({ error: `Invalid notification method: ${method}` });
              return;
            }
          }
        }
      }

      if (target === 'event') {
        const { type, priority, data } = req.body;

        if (!type || !priority || !data) {
          res.status(400).json({ error: 'Type, priority, and data are required' });
          return;
        }

        if (!Object.values(EventType).includes(type)) {
          res.status(400).json({ error: `Invalid event type: ${type}` });
          return;
        }

        if (!Object.values(Priority).includes(priority)) {
          res.status(400).json({ error: `Invalid priority: ${priority}` });
          return;
        }

        if (!data.title || !data.description) {
          res.status(400).json({ error: 'Data must contain title and description' });
          return;
        }
      }

      next();
    } catch (err) {
      res.status(500).json({ error: 'Internal validation error' });
    }
  };
};
