import mongoose, { Document, Schema } from 'mongoose';
import { NotificationPreference, NotificationMethod, EventType } from '../types';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  preferences: NotificationPreference[];
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferenceSchema = new Schema({
  eventType: {
    type: String,
    enum: Object.values(EventType),
    required: true
  },
  methods: [{
    type: String,
    enum: Object.values(NotificationMethod),
    required: true
  }]
});

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  preferences: [notificationPreferenceSchema]
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);