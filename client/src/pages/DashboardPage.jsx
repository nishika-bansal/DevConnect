import { Bell, Bookmark, Heart, MessageCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import Avatar from "../components/Avatar.jsx";
import Skeleton from "../components/Skeleton.jsx";
import TagList from "../components/TagList.jsx";
import { api } from "../services/api.js";

const Stat = ({ icon: Icon, label, value }) => (
  <div className="stat-card panel">
    <Icon size={20} />
    <span>{label}</span>
    <strong>{value ?? 0}</strong>
  </div>
);

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await api.getDashboard();
        console.log("Dashboard Response:", data);
        setDashboard(data.dashboard);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <Skeleton rows={4} />;
  }

  if (!dashboard) {
    return <h2>Unable to load dashboard.</h2>;
  }

  const {
    profile = {},
    summary = {},
    recentPosts = [],
    recentProjects = [],
    notifications = [],
  } = dashboard;

  return (
    <section className="page-stack">
      <div className="dashboard-hero panel">
        <Avatar user={profile} size="xl" />
        <div>
          <h1>{profile.name}</h1>
          <p>{profile.headline}</p>

          <TagList
            items={[
              ...(profile.skills || []),
              ...(profile.technologies || []),
            ].slice(0, 8)}
          />
        </div>
      </div>

      <div className="stats-grid">
        <Stat icon={Users} label="Followers" value={summary.followers || 0} />
        <Stat icon={Heart} label="Likes" value={summary.likesReceived || 0} />
        <Stat
          icon={MessageCircle}
          label="Comments"
          value={summary.commentsReceived || 0}
        />
        <Stat
          icon={Bookmark}
          label="Project Saves"
          value={summary.savesReceived || 0}
        />
        <Stat
          icon={Bell}
          label="Unread"
          value={summary.unreadNotifications || 0}
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>My Posts ({recentPosts.length})</h2>

          {recentPosts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            <div className="mini-list">
              {recentPosts.map((post) => (
                <p key={post._id}>{post.content}</p>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <h2>My Projects ({recentProjects.length})</h2>

          {recentProjects.length === 0 ? (
            <p>No projects yet.</p>
          ) : (
            <div className="mini-list">
              {recentProjects.map((project) => (
                <p key={project._id}>{project.title}</p>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <h2>Activity ({notifications.length})</h2>

          {notifications.length === 0 ? (
            <p>No activity yet.</p>
          ) : (
            <div className="mini-list">
              {notifications.map((notification) => (
                <p key={notification._id}>{notification.message}</p>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}