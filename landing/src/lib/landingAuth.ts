type SupabaseAuthClient = {
  auth: {
    signInWithPassword: (args: { email: string; password: string }) => Promise<{
      data: { session?: { access_token?: string } | null };
      error: { message?: string } | null;
    }>;
    signUp: (args: {
      email: string;
      password: string;
      options?: { data?: Record<string, string>; emailRedirectTo?: string };
    }) => Promise<{
      data: { session?: { access_token?: string } | null };
      error: { message?: string } | null;
    }>;
    signOut: () => Promise<unknown>;
    signInWithOAuth: (args: {
      provider: 'google';
      options?: { redirectTo?: string; queryParams?: Record<string, string> };
    }) => Promise<{ error: { message?: string } | null }>;
    resetPasswordForEmail: (
      email: string,
      options?: { redirectTo?: string },
    ) => Promise<{ error: { message?: string } | null }>;
  };
};

type CreateClientFn = (
  url: string,
  key: string,
  options?: Record<string, unknown>,
) => SupabaseAuthClient;

const TOKEN_KEY = 'lc_token';
const GUEST_KEY = 'lc_guest';
const SUPABASE_ESM = 'https://esm.sh/@supabase/supabase-js@2.49.8';

declare global {
  interface Window {
    __lcCreateClient?: CreateClientFn;
  }
}

type AuthConfig = {
  enabled: boolean;
  supabase: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

let configCache: AuthConfig | null = null;
let supabaseClient: SupabaseAuthClient | null = null;
let createClientFn: CreateClientFn | null = null;

function origin() {
  if (typeof window === 'undefined') return 'https://lexicoil.com';
  return window.location.origin.replace(/\/$/, '');
}

function appRedirectUrl() {
  return `${origin()}/app.html`;
}

function emailRedirectUrl() {
  return `${origin()}/confirmacion`;
}

/** Load Supabase without eval (CSP blocks unsafe-eval on lexicoil.com). */
async function loadCreateClient(): Promise<CreateClientFn> {
  if (createClientFn) return createClientFn;
  if (typeof window === 'undefined') {
    throw new Error('Authentication is only available in the browser.');
  }
  if (window.__lcCreateClient) {
    createClientFn = window.__lcCreateClient;
    return createClientFn;
  }
  await new Promise<void>((resolve, reject) => {
    const onReady = () => {
      window.removeEventListener('lc-supabase-ready', onReady);
      resolve();
    };
    window.addEventListener('lc-supabase-ready', onReady);
    const s = document.createElement('script');
    s.type = 'module';
    s.textContent = `import { createClient } from "${SUPABASE_ESM}";window.__lcCreateClient=createClient;window.dispatchEvent(new Event("lc-supabase-ready"));`;
    s.onerror = () => {
      window.removeEventListener('lc-supabase-ready', onReady);
      reject(new Error('Could not load authentication SDK.'));
    };
    document.head.appendChild(s);
  });
  if (!window.__lcCreateClient) {
    throw new Error('Could not load authentication SDK.');
  }
  createClientFn = window.__lcCreateClient;
  return createClientFn;
}

async function getAuthConfig(): Promise<AuthConfig> {
  if (configCache) return configCache;
  const res = await fetch('/.netlify/functions/auth-config');
  const data = await res.json().catch(() => ({}));
  configCache = {
    enabled: Boolean(data.enabled),
    supabase: Boolean(data.supabase),
    supabaseUrl: String(data.supabaseUrl || ''),
    supabaseAnonKey: String(data.supabaseAnonKey || ''),
  };
  return configCache;
}

async function getSupabase(): Promise<SupabaseAuthClient | null> {
  const cfg = await getAuthConfig();
  if (!cfg.supabase || !cfg.supabaseUrl || !cfg.supabaseAnonKey) return null;
  if (!supabaseClient) {
    const createClient = await loadCreateClient();
    supabaseClient = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        storageKey: 'lc-supabase-auth',
      },
    });
  }
  return supabaseClient;
}

function mapAuthError(code?: string) {
  const map: Record<string, string> = {
    email_taken: 'Email already registered.',
    bad_credentials: 'Invalid email or password.',
    invalid_fields: 'Fill all fields correctly.',
    auth_not_configured: 'Accounts are not configured on the server yet.',
    supabase_not_configured: 'Supabase is not configured on the server yet.',
    invalid_supabase_session: 'Session expired. Please sign in again.',
  };
  return (code && map[code]) || 'Authentication failed.';
}

function mapSupabaseError(err: { message?: string } | null) {
  const msg = String(err?.message || '').toLowerCase();
  if (msg.includes('invalid login')) return 'Invalid email or password.';
  if (msg.includes('email not confirmed')) return 'Confirm your email before signing in.';
  if (msg.includes('user already registered')) return 'Email already registered.';
  return err?.message || 'Authentication failed.';
}

export function persistSession(token: string, user?: unknown) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(GUEST_KEY);
  if (user) localStorage.setItem('lc_user', JSON.stringify(user));
}

async function exchangeSupabaseSession(accessToken: string) {
  const res = await fetch('/.netlify/functions/auth-supabase-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(mapAuthError(data.error));
  if (!data.token) throw new Error('No token received');
  persistSession(data.token, data.user);
  return data;
}

export async function loginWithEmail(email: string, password: string) {
  const em = email.trim().toLowerCase();
  const cfg = await getAuthConfig();

  if (cfg.supabase) {
    const sb = await getSupabase();
    if (!sb) throw new Error('Could not connect to authentication service.');
    const { data, error } = await sb.auth.signInWithPassword({ email: em, password });
    if (error) throw new Error(mapSupabaseError(error));
    if (!data.session?.access_token) throw new Error('Authentication failed.');
    return exchangeSupabaseSession(data.session.access_token);
  }

  const res = await fetch('/.netlify/functions/auth-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: em, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(mapAuthError(data.error));
  if (!data.token) throw new Error('No token received');
  persistSession(data.token, data.user);
  return data;
}

export type RegisterResult =
  | { pendingConfirmation: true; email: string }
  | { pendingConfirmation?: false };

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<RegisterResult> {
  const em = email.trim().toLowerCase();
  const cfg = await getAuthConfig();

  if (cfg.supabase) {
    const sb = await getSupabase();
    if (!sb) throw new Error('Could not connect to authentication service.');
    const { data, error } = await sb.auth.signUp({
      email: em,
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: emailRedirectUrl(),
      },
    });
    if (error) throw new Error(mapSupabaseError(error));
    if (data.session?.access_token) {
      await exchangeSupabaseSession(data.session.access_token);
      return {};
    }
    try {
      await sb.auth.signOut();
    } catch {
      /* ignore */
    }
    return { pendingConfirmation: true, email: em };
  }

  const res = await fetch('/.netlify/functions/auth-register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim(), email: em, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(mapAuthError(data.error));
  if (!data.token) throw new Error('No token received');
  persistSession(data.token, data.user);
  return {};
}

export async function signInWithGoogle() {
  const cfg = await getAuthConfig();
  if (!cfg.supabase) throw new Error('Google sign-in is not configured on the server.');
  const sb = await getSupabase();
  if (!sb) throw new Error('Could not connect to authentication service.');
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: appRedirectUrl(),
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) throw new Error(mapSupabaseError(error));
}

export async function forgotPassword(email: string) {
  const em = email.trim().toLowerCase();
  if (!em) throw new Error('Enter your email address.');
  const cfg = await getAuthConfig();

  if (cfg.supabase) {
    const sb = await getSupabase();
    if (!sb) throw new Error('Could not connect to authentication service.');
    const { error } = await sb.auth.resetPasswordForEmail(em, {
      redirectTo: `${emailRedirectUrl()}?type=recovery`,
    });
    if (error) throw new Error(mapSupabaseError(error));
    return;
  }

  const res = await fetch('/.netlify/functions/auth-forgot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: em }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(mapAuthError(data.error));
  }
}
