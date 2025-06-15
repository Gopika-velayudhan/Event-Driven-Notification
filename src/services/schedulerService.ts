import cron from 'node-cron';
import { NotificationService } from './notificationService';
import { logger } from '../utils/logger';

export class SchedulerService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  start(): void {
    
    cron.schedule('0 9 * * *', async () => {
      logger.info('Starting daily batch notification job');
      try {
        await this.notificationService.sendLowPriorityNotifications();
        logger.info('Daily batch notification job completed');
      } catch (error) {
        logger.error('Error in daily batch notification job:', error);
      }
    });

    logger.info('Scheduler service started');
  }
}
