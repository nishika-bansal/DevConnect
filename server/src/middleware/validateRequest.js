import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((error) => error.msg)
      .join(', ');
    throw new AppError(message, 400);
  }

  next();
};
