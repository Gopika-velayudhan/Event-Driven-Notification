export enum EventType {
  TASK_CREATED = 'task_created',
  TASK_DELETED = 'task_deleted',
  USER_SIGNUP = 'user_signup'
}

export enum Priority {
  HIGH = 'high',
  LOW = 'low'
}

export enum NotificationMethod {
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed'
}

export interface EventData {
  title: string;
  description: string;
}

export interface NotificationPreference {
  eventType: EventType;
  methods: NotificationMethod[];
}

export interface CreateEventRequest {
  type: EventType;
  priority: Priority;
  data: EventData;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phone?: string;
  preferences: NotificationPreference[];
}

export interface UpdatePreferencesRequest {
  preferences: NotificationPreference[];
}

export interface NotificationFilter {
  type?: EventType;
  priority?: Priority;
  startDate?: Date;
  endDate?: Date;
  status?: NotificationStatus;
}
