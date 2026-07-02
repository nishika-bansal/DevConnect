import { body } from 'express-validator';

export const projectValidator = [
  body('title').trim().notEmpty().withMessage('Project title is required').isLength({ max: 100 }).withMessage('Project title is too long'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ max: 1200 })
    .withMessage('Project description is too long'),
  body('githubUrl').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('GitHub URL must include http or https'),
  body('liveDemoUrl').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('Live demo URL must include http or https'),
  body('status').optional().isIn(['planning', 'building', 'launched']).withMessage('Invalid project status')
];

export const projectUpdateValidator = [
  body('title').optional().trim().notEmpty().withMessage('Project title cannot be empty').isLength({ max: 100 }).withMessage('Project title is too long'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project description cannot be empty')
    .isLength({ max: 1200 })
    .withMessage('Project description is too long'),
  body('githubUrl').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('GitHub URL must include http or https'),
  body('liveDemoUrl').optional({ checkFalsy: true }).isURL({ require_protocol: true }).withMessage('Live demo URL must include http or https'),
  body('status').optional().isIn(['planning', 'building', 'launched']).withMessage('Invalid project status')
];
