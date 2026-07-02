const Avatar = ({ user, size = 'md' }) => {
  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (user?.avatar?.url) {
    return <img className={`avatar ${size}`} src={user.avatar.url} alt={user.name} />;
  }

  return <div className={`avatar ${size} initials`}>{initials || 'DC'}</div>;
};

export default Avatar;
