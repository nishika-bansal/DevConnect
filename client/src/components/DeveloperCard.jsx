import { UserPlus, UserRoundCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import Avatar from './Avatar.jsx';
import TagList from './TagList.jsx';

const DeveloperCard = ({ developer, onFollowChange }) => {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(developer.followers?.some((id) => `${id}` === `${user._id}`));
  const isSelf = `${developer._id}` === `${user._id}`;

  const handleFollow = async () => {
    try {
      const data = await api.followUser(developer._id);
      setFollowing(data.following);
      onFollowChange?.(developer._id, data);
      pushToast(data.following ? `Following ${developer.name}` : `Unfollowed ${developer.name}`, 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  return (
    <article className="developer-card">
      <button className="developer-identity" onClick={() => navigate(`/profile/${developer.username || developer._id}`)}>
        <Avatar user={developer} size="lg" />
        <span>
          <strong>{developer.name}</strong>
          <small>@{developer.username}</small>
        </span>
      </button>
      <p>{developer.headline}</p>
      <TagList items={[...(developer.skills || []), ...(developer.technologies || [])].slice(0, 5)} />
      <div className="developer-card-footer">
        <span>{developer.followersCount ?? developer.followers?.length ?? 0} followers</span>
        {!isSelf && (
          <button className="button compact" onClick={handleFollow}>
            {following ? <UserRoundCheck size={16} /> : <UserPlus size={16} />}
            {following ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    </article>
  );
};

export default DeveloperCard;
