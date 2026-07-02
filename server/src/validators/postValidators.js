import { body } from 'express-validator';

export const postValidator = [
  body('content').trim().notEmpty().withMessage('Post content is required').isLength({ max: 2000 }).withMessage('Post is too long'),
  body('visibility').optional().isIn(['public', 'followers']).withMessage('Invalid post visibility')
];

export const commentValidator = [
  body('text').trim().notEmpty().withMessage('Comment text is required').isLength({ max: 500 }).withMessage('Comment is too long')
];
