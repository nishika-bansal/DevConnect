export const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => `${item}`.trim()).filter(Boolean);
  }
  return `${value}`
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export const toPublicUser = (user) => {
  const data = user.toObject ? user.toObject({ virtuals: true }) : { ...user };
  delete data.password;
  delete data.passwordChangedAt;
  return data;
};
