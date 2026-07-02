const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('devconnect_token');

const parseBody = async (response) => {
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const request = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  if (!isFormData && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
    body: isFormData || typeof options.body === 'string' ? options.body : JSON.stringify(options.body)
  });

  const data = await parseBody(response);

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
};

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  verifyEmail: () => request('/auth/verify-email', { method: 'PATCH' }),

  getUsers: (params = '') => request(`/users${params}`),
  getSuggestions: () => request('/users/suggestions'),
  getTrending: () => request('/users/trending'),
  getProfile: (id) => request(`/users/${id}`),
  updateProfile: (payload) => request('/users/me', { method: 'PATCH', body: payload }),
  followUser: (id) => request(`/users/${id}/follow`, { method: 'POST' }),

  getFeed: (params = '') => request(`/posts${params}`),
  createPost: (payload) => request('/posts', { method: 'POST', body: payload }),
  updatePost: (id, payload) => request(`/posts/${id}`, { method: 'PATCH', body: payload }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  likePost: (id) => request(`/posts/${id}/like`, { method: 'POST' }),
  bookmarkPost: (id) => request(`/posts/${id}/bookmark`, { method: 'POST' }),
  commentPost: (id, payload) => request(`/posts/${id}/comments`, { method: 'POST', body: payload }),
  deleteComment: (postId, commentId) => request(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),

  getProjects: (params = '') => request(`/projects${params}`),
  createProject: (payload) => request('/projects', { method: 'POST', body: payload }),
  updateProject: (id, payload) => request(`/projects/${id}`, { method: 'PATCH', body: payload }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  saveProject: (id) => request(`/projects/${id}/save`, { method: 'POST' }),

  getDashboard: () => request('/dashboard'),
  getNotifications: () => request('/notifications'),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  uploadProfileImage: (formData) => request('/upload/profile', { method: 'POST', body: formData }),
  uploadProjectImage: (formData) => request('/upload/project', { method: 'POST', body: formData })
};
