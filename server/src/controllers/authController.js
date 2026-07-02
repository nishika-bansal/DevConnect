import crypto from 'crypto';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { attachTokenCookie, generateToken } from '../utils/generateToken.js';
import { normalizeList, toPublicUser } from '../utils/normalize.js';
import { sendEmail } from '../utils/sendEmail.js';

const sendAuthResponse = (res, statusCode, user) => {
  const token = generateToken(user._id);
  attachTokenCookie(res, token);

  res.status(statusCode).json({
    status: 'success',
    token,
    user: toPublicUser(user)
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password, headline, bio, location, skills, technologies } = req.body;

  const user = await User.create({
    name,
    username,
    email,
    password,
    headline,
    bio,
    location,
    skills: normalizeList(skills),
    technologies: normalizeList(technologies)
  });

  const verificationToken = crypto.randomBytes(24).toString('hex');
  try {
    await sendEmail({
      to: user.email,
      subject: 'Welcome to DevConnect',
      html: `<p>Welcome ${user.name}. Your demo verification token is <strong>${verificationToken}</strong>.</p>`
    });
  } catch (error) {
    console.error(`Welcome email failed for ${user.email}:`, error.message);
  }

  sendAuthResponse(res, 201, user);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  user.lastActiveAt = new Date();
  await user.save({ validateBeforeSave: false });

  sendAuthResponse(res, 200, user);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('bookmarkedPosts', 'content createdAt')
    .populate('savedProjects', 'title techStack createdAt');

  res.status(200).json({
    status: 'success',
    user: toPublicUser(user)
  });
});

export const logout = (_req, res) => {
  res.cookie('devconnect_token', 'logged-out', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

export const verifyEmail = asyncHandler(async (req, res) => {
  req.user.emailVerified = true;
  await req.user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Email marked as verified for this demo account'
  });
});
