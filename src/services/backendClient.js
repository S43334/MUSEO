const CATALOG_CACHE_TTL_MS = 10000;

let catalogCache = {
  at: 0,
  value: null
};
let trackedSessionId = '';

function getBrowserConfig() {
  if (typeof window === 'undefined') {
    return {};
  }

  return window.__MUSEO_CONFIG__ || {};
}

export function getBackendConfig() {
  const cfg = getBrowserConfig();
  const supabaseUrl = cfg.supabaseUrl || '';
  const supabaseAnonKey = cfg.supabaseAnonKey || '';
  const functionsBaseUrl = cfg.functionsBaseUrl || (supabaseUrl ? `${supabaseUrl}/functions/v1` : '');

  return {
    supabaseUrl,
    supabaseAnonKey,
    functionsBaseUrl
  };
}

export function isBackendConfigured() {
  const cfg = getBackendConfig();
  return Boolean(cfg.functionsBaseUrl);
}

async function requestEdge(path, options = {}) {
  const cfg = getBackendConfig();
  if (!cfg.functionsBaseUrl) {
    throw new Error('Backend no configurado');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (cfg.supabaseAnonKey) {
    headers.apikey = cfg.supabaseAnonKey;
    headers.Authorization = `Bearer ${cfg.supabaseAnonKey}`;
  }

  const response = await fetch(`${cfg.functionsBaseUrl}/${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Edge ${path} error: ${response.status} ${message}`);
  }

  return response.json();
}

export async function fetchPublicCatalog({ force = false } = {}) {
  const now = Date.now();
  if (!force && catalogCache.value && ((now - catalogCache.at) < CATALOG_CACHE_TTL_MS)) {
    return catalogCache.value;
  }

  const payload = await requestEdge('get_public_catalog');
  catalogCache = {
    at: now,
    value: payload
  };

  return payload;
}

export async function fetchPublishedRooms() {
  const payload = await fetchPublicCatalog();
  return Array.isArray(payload.rooms) ? payload.rooms : [];
}

export async function fetchPublishedArtworks() {
  const payload = await fetchPublicCatalog();
  return Array.isArray(payload.artworks) ? payload.artworks : [];
}

export async function trackEvent(eventName, payload = {}) {
  if (!isBackendConfigured()) {
    return { sent: false, reason: 'backend-not-configured' };
  }

  try {
    if (eventName === 'session_start') {
      trackedSessionId = '';
    }

    const body = JSON.stringify({
      eventName,
      payload,
      sessionId: trackedSessionId || null,
      clientAt: new Date().toISOString()
    });

    const response = await requestEdge('track_event', { method: 'POST', body });
    if (response?.sessionId) {
      trackedSessionId = String(response.sessionId);
    }

    if (eventName === 'session_end') {
      trackedSessionId = '';
    }

    return { sent: true, sessionId: trackedSessionId || null };
  } catch (error) {
    return { sent: false, reason: error.message };
  }
}
