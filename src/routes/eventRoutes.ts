import { Router } from 'express';
import { EventController } from '../controllers/eventController';
import { validateRequest } from '../middleware/validation';

const router = Router();
const eventController = new EventController();

router.post('/', validateRequest('event'), eventController.createEvent.bind(eventController));
router.get('/', eventController.getAllEvents.bind(eventController));
router.get('/:id', eventController.getEvent.bind(eventController));

export { router as eventRoutes };
