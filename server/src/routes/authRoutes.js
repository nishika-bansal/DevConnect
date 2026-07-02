import express from 'express';
import { getMe, login, logout, register, verifyEmail } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginValidator, registerValidator } from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.patch('/verify-email', protect, verifyEmail);

export default router;
