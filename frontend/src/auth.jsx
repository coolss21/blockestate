import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from './api.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('pc_token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('pc_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    setAuthToken(token);
    if (token) localStorage.setItem('pc_token', token);
    else localStorage.removeItem('pc_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('pc_user', JSON.stringify(user));
    else localStorage.removeItem('pc_user');
  }, [user]);

  async function login({ email, password, role }) {
    const { data } = await api.post('/rbac/auth/login', { email, password, role });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function seedDemoUsers() {
    const { data } = await api.post('/rbac/auth/seed');
    return data;
  }

  function logout() {
    setToken('');
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, login, logout, seedDemoUsers }), [token, user]);

  return (<AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>);
}

export function useAuth() {
  return useContext(AuthCtx);
}
