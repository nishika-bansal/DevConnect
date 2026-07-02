import { Bookmark, Heart, MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import Avatar from './Avatar.jsx';
import TagList from './TagList.jsx';

const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));

const PostCard = ({ post, onChanged, onDeleted }) => {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [localPost, setLocalPost] = useState(post);

  const liked = useMemo(() => localPost.likes?.some((id) => `${id}` === `${user._id}`), [localPost.likes, user._id]);
  const bookmarked = useMemo(
    () => user.bookmarkedPosts?.some((item) => `${item._id || item}` === `${localPost._id}`),
    [user.bookmarkedPosts, localPost._id]
  );
  const canManage = `${localPost.author?._id}` === `${user._id}` || user.role === 'admin';

  const applyPost = (nextPost) => {
    setLocalPost(nextPost);
    onChanged?.(nextPost);
  };

  const handleLike = async () => {
    try {
      const data = await api.likePost(localPost._id);
      const nextLikes = data.liked
        ? [...(localPost.likes || []), user._id]
        : localPost.likes.filter((id) => `${id}` !== `${user._id}`);
      applyPost({ ...localPost, likes: nextLikes, likesCount: data.likesCount });
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  const handleBookmark = async () => {
    try {
      await api.bookmarkPost(localPost._id);
      pushToast(bookmarked ? 'Bookmark removed' : 'Post bookmarked', 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  const handleComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    try {
      const data = await api.commentPost(localPost._id, { text: comment });
      setComment('');
      applyPost(data.post);
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deletePost(localPost._id);
      onDeleted?.(localPost._id);
      pushToast('Post deleted', 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  return (
    <article className="post-card panel">
      <div className="post-header">
        <button className="identity-button" onClick={() => navigate(`/profile/${localPost.author.username || localPost.author._id}`)}>
          <Avatar user={localPost.author} />
          <span>
            <strong>{localPost.author.name}</strong>
            <small>{localPost.author.headline} / {formatDate(localPost.createdAt)}</small>
          </span>
        </button>
        {canManage && (
          <button className="icon-button ghost" onClick={handleDelete} aria-label="Delete post">
            <Trash2 size={17} />
          </button>
        )}
        {!canManage && (
          <button className="icon-button ghost" aria-label="More">
            <MoreHorizontal size={18} />
          </button>
        )}
      </div>

      <p className="post-content">{localPost.content}</p>
      <TagList items={localPost.techStack} tone="tech" />
      <TagList items={localPost.tags?.map((tag) => `#${tag}`)} />

      {localPost.images?.length > 0 && (
        <div className="image-grid">
          {localPost.images.map((image) => (
            <img src={image.url} alt="Post attachment" key={image.url} />
          ))}
        </div>
      )}

      <div className="post-actions">
        <button className={`icon-text ${liked ? 'active' : ''}`} onClick={handleLike}>
          <Heart size={18} />
          {localPost.likesCount ?? localPost.likes?.length ?? 0}
        </button>
        <button className="icon-text" onClick={() => document.getElementById(`comment-${localPost._id}`)?.focus()}>
          <MessageCircle size={18} />
          {localPost.commentsCount ?? localPost.comments?.length ?? 0}
        </button>
        <button className={`icon-text ${bookmarked ? 'active' : ''}`} onClick={handleBookmark}>
          <Bookmark size={18} />
          Save
        </button>
      </div>

      {localPost.comments?.slice(-3).map((item) => (
        <div className="comment" key={item._id}>
          <Avatar user={item.user} size="xs" />
          <span>
            <strong>{item.user?.name}</strong>
            {item.text}
          </span>
        </div>
      ))}

      <form className="comment-form" onSubmit={handleComment}>
        <input id={`comment-${localPost._id}`} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a comment" />
        <button className="button compact" disabled={!comment.trim()}>
          Reply
        </button>
      </form>
    </article>
  );
};

export default PostCard;
