export function resolveAdminConfig() {
  const cfg = window.__MUSEO_ADMIN_CONFIG__ || {};
  const supabaseUrl = cfg.supabaseUrl || '';
  const supabaseAnonKey = cfg.supabaseAnonKey || '';
  const functionsBaseUrl = cfg.functionsBaseUrl || (supabaseUrl ? `${supabaseUrl}/functions/v1` : '');

  return {
    supabaseUrl,
    supabaseAnonKey,
    functionsBaseUrl
  };
}

export function ensureConfig() {
  const cfg = resolveAdminConfig();
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !cfg.functionsBaseUrl) {
    throw new Error('Config incompleta. Define window.__MUSEO_ADMIN_CONFIG__.');
  }
  return cfg;
}