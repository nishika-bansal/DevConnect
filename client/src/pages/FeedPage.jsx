import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import PostCard from '../components/PostCard.jsx';
import PostComposer from '../components/PostComposer.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll.js';
import { api } from '../services/api.js';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(async (nextPage = 1) => {
    setLoading(true);
    try {
      const data = await api.getFeed(`?page=${nextPage}&limit=6`);
      setPosts((current) => (nextPage === 1 ? data.posts : [...current, ...data.posts]));
      setHasMore(data.pagination.hasMore);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  const sentinelRef = useInfiniteScroll({
    enabled: hasMore,
    loading,
    onLoadMore: () => loadPosts(page + 1)
  });

  const updatePost = (post) => setPosts((current) => current.map((item) => (item._id === post._id ? post : item)));

  return (
    <div className="content-grid feed-layout">
      <section className="primary-column">
        <PostComposer onCreated={(post) => setPosts((current) => [post, ...current])} />
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onChanged={updatePost}
            onDeleted={(id) => setPosts((current) => current.filter((item) => item._id !== id))}
          />
        ))}
        {!loading && posts.length === 0 && <EmptyState title="No posts yet" />}
        {loading && <Skeleton rows={2} />}
        <div ref={sentinelRef} className="sentinel" />
      </section>
      <aside className="side-column">
        <div className="panel compact-panel">
          <h3>Signal Board</h3>
          <button className="button full" onClick={() => loadPosts(1)}>
            <RefreshCw size={17} />
            Refresh feed
          </button>
        </div>
      </aside>
    </div>
  );
};

export default FeedPage;
