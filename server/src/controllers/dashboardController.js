import Notification from '../models/Notification.js';
import Post from '../models/Post.js';
import Project from '../models/Project.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { toPublicUser } from '../utils/normalize.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const [posts, projects, unreadNotifications, recentPosts, recentProjects, notifications] = await Promise.all([
    Post.countDocuments({ author: req.user._id }),
    Project.countDocuments({ owner: req.user._id }),
    Notification.countDocuments({ recipient: req.user._id, read: false }),
    Post.find({ author: req.user._id }).sort({ createdAt: -1 }).limit(5),
    Project.find({ owner: req.user._id }).sort({ createdAt: -1 }).limit(5),
    Notification.find({ recipient: req.user._id })
      .populate('sender', 'name username avatar')
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  const likesReceived = await Post.aggregate([
    { $match: { author: req.user._id } },
    { $project: { likesCount: { $size: '$likes' }, commentsCount: { $size: '$comments' } } },
    {
      $group: {
        _id: null,
        likes: { $sum: '$likesCount' },
        comments: { $sum: '$commentsCount' }
      }
    }
  ]);

  const savesReceived = await Project.aggregate([
    { $match: { owner: req.user._id } },
    { $project: { savesCount: { $size: '$savedBy' } } },
    { $group: { _id: null, saves: { $sum: '$savesCount' } } }
  ]);

  res.status(200).json({
    status: 'success',
    dashboard: {
      profile: toPublicUser(req.user),
      summary: {
        posts,
        projects,
        followers: req.user.followers.length,
        following: req.user.following.length,
        likesReceived: likesReceived[0]?.likes || 0,
        commentsReceived: likesReceived[0]?.comments || 0,
        savesReceived: savesReceived[0]?.saves || 0,
        unreadNotifications
      },
      recentPosts,
      recentProjects,
      notifications
    }
  });
});
