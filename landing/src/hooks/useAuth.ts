'use client';

import { useCallback, useEffect, useState } from 'react';

const TOKEN_KEY = 'lc_token';

export type AuthUser = {
  name?: string;
  email?: string;
  plan?: string;
  guest?: boolean;
  pro?: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setReady(true);
      return null;
    }
    try {
      const res = await fetch('/.netlify/functions/auth-me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
        setReady(true);
        return null;
      }
      const data = await res.json();
      setUser(data.user || data);
      setReady(true);
      return data.user || data;
    } catch {
      setUser(null);
      setReady(true);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const saveToken = useCallback((token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('lc_user');
    setUser(null);
  }, []);

  return { user, ready, fetchMe, saveToken, logout, isLoggedIn: !!user };
}
