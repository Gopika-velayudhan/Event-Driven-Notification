import mongoose, { Document, Schema } from 'mongoose';
import { EventType, Priority, NotificationMethod, NotificationStatus } from '../types';
import { IUser } from './User'; 

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId | IUser;
  eventId: mongoose.Types.ObjectId;
  eventType: EventType;
  priority: Priority;
  method: NotificationMethod;
  title: string;
  description: string;
  status: NotificationStatus;
  sentAt?: Date;
  createdAt: Date;
  duplicateHash: string;
}

const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  eventType: {
    type: String,
    enum: Object.values(EventType),
    required: true
  },
  priority: {
    type: String,
    enum: Object.values(Priority),
    required: true
  },
  method: {
    type: String,
    enum: Object.values(NotificationMethod),
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING
  },
  sentAt: {
    type: Date
  },
  duplicateHash: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});


notificationSchema.index({ userId: 1, eventId: 1, method: 1 }, { unique: true });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
