import { body } from 'express-validator';

export const profileValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2 to 80 characters'),
  body('headline').optional().trim().isLength({ max: 120 }).withMessage('Headline is too long'),
  body('bio').optional().trim().isLength({ max: 600 }).withMessage('Bio is too long'),
  body('socials.github').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('GitHub URL must include http or https'),
  body('socials.linkedin').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('LinkedIn URL must include http or https'),
  body('socials.portfolio').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('Portfolio URL must include http or https')
];
