import { useEffect, useState } from 'react';
import { api } from '../services/api.js';

const NotificationBell = ({ icon: Icon }) => {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api
      .getNotifications()
      .then((data) => setUnread(data.unreadCount || 0))
      .catch(() => setUnread(0));
  }, []);

  const markRead = async () => {
    if (!unread) return;
    await api.markAllNotificationsRead();
    setUnread(0);
  };

  return (
    <button className="icon-button notification-button" onClick={markRead} aria-label="Notifications">
      <Icon size={19} />
      {unread > 0 && <span className="notification-dot">{unread > 9 ? '9+' : unread}</span>}
    </button>
  );
};

export default NotificationBell;
