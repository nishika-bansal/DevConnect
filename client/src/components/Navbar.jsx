import { Bell, BriefcaseBusiness, LayoutDashboard, LogOut, Moon, Search, Sun, Users, Zap } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import Avatar from './Avatar.jsx';
import NotificationBell from './NotificationBell.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <button className="brand-button" onClick={() => navigate('/')} aria-label="DevConnect home">
        <span className="brand-mark small">DC</span>
        <span>DevConnect</span>
      </button>

      <nav className="desktop-nav" aria-label="Main navigation">
        <NavLink to="/" end>
          <Zap size={18} />
          Feed
        </NavLink>
        <NavLink to="/network">
          <Users size={18} />
          Network
        </NavLink>
        <NavLink to="/projects">
          <BriefcaseBusiness size={18} />
          Projects
        </NavLink>
        <NavLink to="/dashboard">
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>
      </nav>

      <div className="topbar-actions">
        <button className="icon-button" onClick={() => navigate('/search')} aria-label="Search">
          <Search size={19} />
        </button>
        <NotificationBell icon={Bell} />
        <button className="icon-button" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <button className="profile-chip" onClick={() => navigate(`/profile/${user.username || user._id}`)}>
          <Avatar user={user} size="xs" />
          <span>{user.name}</span>
        </button>
        <button className="icon-button" onClick={logout} aria-label="Log out">
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
