import { body } from 'express-validator';

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }).withMessage('Name is too long'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .matches(/^[a-z0-9_.-]+$/i)
    .withMessage('Username can only contain letters, numbers, dots, dashes, and underscores'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password needs at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password needs at least one number')
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];
