import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';

const router = Router();
const notificationController = new NotificationController();

router.get('/', notificationController.getAllNotifications.bind(notificationController));
router.get('/:userId', notificationController.getUserNotifications.bind(notificationController));
router.post('/:userId/bulk', notificationController.bulkNotify.bind(notificationController));



export default router;
