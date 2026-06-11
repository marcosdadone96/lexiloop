'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  bindSupabaseAuthListener,
  logoutSession,
  restoreSession,
  type SessionUser,
} from '@/lib/landingAuth';

const TOKEN_KEY = 'lc_token';
const GUEST_KEY = 'lc_guest';
const SUPABASE_STORAGE_KEY = 'lc-supabase-auth';

export type AuthUser = SessionUser;

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const fetchMe = useCallback(async () => {
    if (localStorage.getItem(GUEST_KEY) === '1') {
      setUser(null);
      setReady(true);
      return null;
    }
    try {
      const restored = await restoreSession();
      setUser(restored);
      setReady(true);
      return restored;
    } catch {
      setUser(null);
      setReady(true);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchMe();
    bindSupabaseAuthListener(setUser);

    const onStorage = (e: StorageEvent) => {
      if (
        e.key === TOKEN_KEY ||
        e.key === 'lc_user' ||
        e.key === GUEST_KEY ||
        e.key === SUPABASE_STORAGE_KEY
      ) {
        fetchMe();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [fetchMe]);

  const saveToken = useCallback((token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  }, []);

  const logout = useCallback(async () => {
    await logoutSession();
    setUser(null);
  }, []);

  return { user, ready, fetchMe, saveToken, logout, isLoggedIn: !!user };
}
