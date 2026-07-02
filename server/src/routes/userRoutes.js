import express from 'express';
import {
  followUser,
  getFollowers,
  getFollowing,
  getSuggestedDevelopers,
  getTrendingDevelopers,
  getUserActivity,
  getUserProfile,
  getUsers,
  updateMyProfile
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { profileValidator } from '../validators/userValidators.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.get('/suggestions', protect, getSuggestedDevelopers);
router.get('/trending', protect, getTrendingDevelopers);
router.get('/activity/me', protect, getUserActivity);
router.patch('/me', protect, profileValidator, validateRequest, updateMyProfile);
router.post('/:id/follow', protect, followUser);
router.get('/:id/followers', protect, getFollowers);
router.get('/:id/following', protect, getFollowing);
router.get('/:id', protect, getUserProfile);

export default router;
