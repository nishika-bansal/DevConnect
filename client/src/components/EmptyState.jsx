const EmptyState = ({ title, action }) => (
  <div className="empty-state">
    <div className="empty-badge">DC</div>
    <h3>{title}</h3>
    {action}
  </div>
);

export default EmptyState;
