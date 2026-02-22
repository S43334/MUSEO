import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { ensureConfig } from './config.js';

let client = null;

export function getAdminClient() {
  if (client) {
    return client;
  }

  const cfg = ensureConfig();
  client = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  return client;
}

export async function login(email, password) {
  const supabase = getAdminClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  const supabase = getAdminClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const supabase = getAdminClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getAccessToken() {
  const session = await getSession();
  return session?.access_token || '';
}