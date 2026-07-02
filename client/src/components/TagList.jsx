const TagList = ({ items = [], tone = 'default' }) => {
  if (!items?.length) return null;

  return (
    <div className="tag-list">
      {items.map((item) => (
        <span className={`tag ${tone}`} key={item}>
          {item}
        </span>
      ))}
    </div>
  );
};

export default TagList;
