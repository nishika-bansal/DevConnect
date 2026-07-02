const Skeleton = ({ rows = 1, className = '' }) => (
  <div className={`skeleton-stack ${className}`}>
    {Array.from({ length: rows }).map((_, index) => (
      <div className="skeleton-card" key={index}>
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
        <div className="skeleton-line wide" />
      </div>
    ))}
  </div>
);

export default Skeleton;
