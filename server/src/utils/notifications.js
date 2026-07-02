import Notification from '../models/Notification.js';

export const createNotification = async ({ recipient, sender, type, message, post, project }) => {
  if (!recipient || `${recipient}` === `${sender}`) {
    return null;
  }

  return Notification.create({
    recipient,
    sender,
    type,
    message,
    post,
    project
  });
};
