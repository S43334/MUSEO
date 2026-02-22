import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

function required(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

export function getEnvConfig() {
  return {
    supabaseUrl: required('SUPABASE_URL'),
    serviceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
    anonKey: required('SUPABASE_ANON_KEY')
  };
}

export function createServiceClient(): SupabaseClient {
  const env = getEnvConfig();
  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function createAnonClient(authHeader?: string): SupabaseClient {
  const env = getEnvConfig();
  return createClient(env.supabaseUrl, env.anonKey, {
    global: authHeader
      ? {
          headers: {
            Authorization: authHeader
          }
        }
      : undefined,
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}