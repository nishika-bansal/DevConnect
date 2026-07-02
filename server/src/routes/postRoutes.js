import express from 'express';
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  getFeed,
  getPost,
  toggleBookmark,
  toggleLike,
  updatePost
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { commentValidator, postValidator } from '../validators/postValidators.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getFeed).post(postValidator, validateRequest, createPost);
router.route('/:id').get(getPost).patch(postValidator, validateRequest, updatePost).delete(deletePost);
router.post('/:id/like', toggleLike);
router.post('/:id/bookmark', toggleBookmark);
router.post('/:id/comments', commentValidator, validateRequest, addComment);
router.delete('/:id/comments/:commentId', deleteComment);

export default router;
