import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import Post from '../models/Post.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createNotification } from '../utils/notifications.js';
import { normalizeList, toPublicUser } from '../utils/normalize.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

const publicUserSelect = '-password -passwordChangedAt -bookmarkedPosts -savedProjects';

const userQuery = (query) => {
  const filter = {};

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [
      { name: regex },
      { username: regex },
      { headline: regex },
      { bio: regex },
      { skills: regex },
      { technologies: regex }
    ];
  }

  if (query.skill) {
    filter.skills = { $regex: query.skill, $options: 'i' };
  }

  if (query.technology) {
    filter.technologies = { $regex: query.technology, $options: 'i' };
  }

  return filter;
};

export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = userQuery(req.query);
  const [users, total] = await Promise.all([
    User.find(filter).select(publicUserSelect).sort({ lastActiveAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  res.status(200).json({
    status: 'success',
    results: users.length,
    pagination: paginationMeta(page, limit, total),
    users
  });
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const lookup = mongoose.Types.ObjectId.isValid(req.params.id)
    ? { _id: req.params.id }
    : { username: req.params.id.toLowerCase() };

  const user = await User.findOne(lookup).select(publicUserSelect);

  if (!user) {
    throw new AppError('Developer not found', 404);
  }

  const [postsCount, projectsCount] = await Promise.all([
    Post.countDocuments({ author: user._id }),
    Project.countDocuments({ owner: user._id })
  ]);

  res.status(200).json({
    status: 'success',
    user: {
      ...toPublicUser(user),
      postsCount,
      projectsCount
    }
  });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name',
    'headline',
    'bio',
    'location',
    'socials',
    'experience',
    'education',
    'avatar'
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      req.user[field] = req.body[field];
    }
  });

  if (req.body.skills !== undefined) {
    req.user.skills = normalizeList(req.body.skills);
  }

  if (req.body.technologies !== undefined) {
    req.user.technologies = normalizeList(req.body.technologies);
  }

  await req.user.save({ validateBeforeSave: true });

  res.status(200).json({
    status: 'success',
    user: toPublicUser(req.user)
  });
});

export const followUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);

  if (!target) {
    throw new AppError('Developer not found', 404);
  }

  if (`${target._id}` === `${req.user._id}`) {
    throw new AppError('You cannot follow yourself', 400);
  }

  const alreadyFollowing = req.user.following.some((id) => `${id}` === `${target._id}`);

  if (alreadyFollowing) {
    req.user.following.pull(target._id);
    target.followers.pull(req.user._id);
  } else {
    req.user.following.addToSet(target._id);
    target.followers.addToSet(req.user._id);
    await createNotification({
      recipient: target._id,
      sender: req.user._id,
      type: 'follow',
      message: `${req.user.name} started following you`
    });
  }

  await Promise.all([
    req.user.save({ validateBeforeSave: false }),
    target.save({ validateBeforeSave: false })
  ]);

  res.status(200).json({
    status: 'success',
    following: !alreadyFollowing,
    followersCount: target.followers.length,
    followingCount: req.user.following.length
  });
});

export const getFollowers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('followers', publicUserSelect);

  if (!user) {
    throw new AppError('Developer not found', 404);
  }

  res.status(200).json({
    status: 'success',
    users: user.followers
  });
});

export const getFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('following', publicUserSelect);

  if (!user) {
    throw new AppError('Developer not found', 404);
  }

  res.status(200).json({
    status: 'success',
    users: user.following
  });
});

export const getSuggestedDevelopers = asyncHandler(async (req, res) => {
  const ignored = [req.user._id, ...req.user.following];
  const users = await User.find({ _id: { $nin: ignored } })
    .select(publicUserSelect)
    .sort({ lastActiveAt: -1 })
    .limit(Number(req.query.limit) || 6);

  res.status(200).json({
    status: 'success',
    users
  });
});

export const getTrendingDevelopers = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 8, 20);
  const users = await User.aggregate([
    {
      $addFields: {
        followersCount: { $size: '$followers' },
        followingCount: { $size: '$following' }
      }
    },
    { $sort: { followersCount: -1, lastActiveAt: -1 } },
    { $limit: limit },
    {
      $project: {
        password: 0,
        passwordChangedAt: 0,
        bookmarkedPosts: 0,
        savedProjects: 0
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    users
  });
});

export const getUserActivity = asyncHandler(async (req, res) => {
  const [posts, projects, notifications] = await Promise.all([
    Post.find({ author: req.user._id }).sort({ createdAt: -1 }).limit(5),
    Project.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(5),
    Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(5)
  ]);

  res.status(200).json({
    status: 'success',
    activity: { posts, projects, notifications }
  });
});
