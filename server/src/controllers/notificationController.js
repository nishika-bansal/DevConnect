import Notification from '../models/Notification.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { recipient: req.user._id };

  if (req.query.unread === 'true') {
    filter.read = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('sender', 'name username avatar headline')
      .populate('post', 'content')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user._id, read: false })
  ]);

  res.status(200).json({
    status: 'success',
    unreadCount,
    pagination: paginationMeta(page, limit, total),
    notifications
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  notification.read = true;
  await notification.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    notification
  });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});

export const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });

  res.status(204).send();
});
