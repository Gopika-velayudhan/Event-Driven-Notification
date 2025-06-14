import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { validateRequest } from '../middleware/validation';

const router = Router();
const userController = new UserController();

router.post('/', validateRequest('user'), userController.createUser.bind(userController));
router.get('/', userController.getAllUsers.bind(userController));
router.get('/:id', userController.getUser.bind(userController));
router.put('/:id/preferences', userController.updatePreferences.bind(userController));

export { router as userRoutes };
