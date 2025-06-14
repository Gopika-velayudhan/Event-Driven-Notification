import mongoose, { Document, Schema } from 'mongoose';
import { EventType, Priority, EventData } from '../types';

export interface IEvent extends Document {
  type: EventType;
  priority: Priority;
  data: EventData;
  createdAt: Date;
  processed: boolean;
}

const eventSchema = new Schema({
  type: {
    type: String,
    enum: Object.values(EventType),
    required: true
  },
  priority: {
    type: String,
    enum: Object.values(Priority),
    required: true
  },
  data: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  processed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const Event = mongoose.model<IEvent>('Event', eventSchema);