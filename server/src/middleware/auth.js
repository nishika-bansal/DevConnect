import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getTokenFromRequest = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }
  return req.cookies?.devconnect_token;
};

export const protect = asyncHandler(async (req, _res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new AppError('Please log in to access this resource', 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('+passwordChangedAt');

  if (!user) {
    throw new AppError('The user for this token no longer exists', 401);
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }
    next();
  };
};
