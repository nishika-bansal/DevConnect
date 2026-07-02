import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('devconnect_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('devconnect_token'))
      .finally(() => setLoading(false));
  }, []);

  const finishAuth = (data, message) => {
    localStorage.setItem('devconnect_token', data.token);
    setUser(data.user);
    pushToast(message, 'success');
  };

  const login = async (payload) => {
    const data = await api.login(payload);
    finishAuth(data, 'Welcome back');
  };

  const register = async (payload) => {
    const data = await api.register(payload);
    finishAuth(data, 'Account created');
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      localStorage.removeItem('devconnect_token');
      setUser(null);
      pushToast('Logged out', 'success');
    }
  };

  const refreshMe = async () => {
    const data = await api.me();
    setUser(data.user);
    return data.user;
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshMe
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
