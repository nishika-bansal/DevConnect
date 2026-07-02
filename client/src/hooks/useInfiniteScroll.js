import { useEffect, useRef } from 'react';

export const useInfiniteScroll = ({ enabled, loading, onLoadMore }) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled || loading || !sentinelRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '320px' }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [enabled, loading, onLoadMore]);

  return sentinelRef;
};
