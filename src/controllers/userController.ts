import { Request, Response } from 'express';
import { User } from '../models/User';
import { CreateUserRequest, UpdatePreferencesRequest } from '../types';
import { logger } from '../utils/logger';

export class UserController {
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        res.status(400).json({ error: 'User with this email already exists' });
        return;
      }

      const user = new User(userData);
      await user.save();

      logger.info(`User created: ${user._id} - ${user.name}`);
      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        preferences: user.preferences,
        createdAt: user.createdAt
      });
    } catch (error) {
      logger.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        preferences: user.preferences,
        createdAt: user.createdAt
      });
    } catch (error) {
      logger.error('Error getting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { preferences }: UpdatePreferencesRequest = req.body;

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      user.preferences = preferences;
      await user.save();

      logger.info(`User preferences updated: ${user._id}`);
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        preferences: user.preferences,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      logger.error('Error updating user preferences:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.find().select('-__v');
      res.json(users);
    } catch (error) {
      logger.error('Error getting users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}