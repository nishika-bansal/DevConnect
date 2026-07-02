import express from 'express';
import { uploadProfileImage, uploadProjectImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect);

router.post('/profile', upload.single('image'), uploadProfileImage);
router.post('/project', upload.single('image'), uploadProjectImage);

export default router;
