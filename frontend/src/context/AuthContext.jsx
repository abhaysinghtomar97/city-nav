import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('cityroute_token'));

  const saveAuth = (token, user) => {
    localStorage.setItem('cityroute_token', token);
    localStorage.setItem('cityroute_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const clearAuth = useCallback(() => {
    localStorage.removeItem('cityroute_token');
    localStorage.removeItem('cityroute_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('cityroute_token');
      if (savedToken) {
        try {
          const res = await authApi.me();
          setUser(res.data.user);
        } catch {
          clearAuth();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [clearAuth]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    saveAuth(res.data.token, res.data.user);
    toast.success(`Welcome back, ${res.data.user.name}!`);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    saveAuth(res.data.token, res.data.user);
    toast.success('Account created successfully!');
    return res.data.user;
  };

  const logout = () => {
    clearAuth();
    toast.success('Logged out successfully.');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};