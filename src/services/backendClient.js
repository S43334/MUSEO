const CATALOG_CACHE_TTL_MS = 10000;
const DEFAULT_EDGE_TIMEOUT_MS = 6000;

let catalogCache = {
  at: 0,
  value: null
};
let catalogInFlight = null;
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

  const timeoutMs = Number(options.timeoutMs ?? DEFAULT_EDGE_TIMEOUT_MS);
  const useTimeout = Number.isFinite(timeoutMs) && timeoutMs > 0;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  let timeoutId = null;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (cfg.supabaseAnonKey) {
    headers.apikey = cfg.supabaseAnonKey;
    headers.Authorization = `Bearer ${cfg.supabaseAnonKey}`;
  }

  if (useTimeout && controller) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  let response;
  try {
    response = await fetch(`${cfg.functionsBaseUrl}/${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body,
      signal: controller?.signal
    });
  } catch (error) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (error?.name === 'AbortError') {
      throw new Error(`Edge ${path} timeout after ${timeoutMs}ms`);
    }

    throw error;
  }

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Edge ${path} error: ${response.status} ${message}`);
  }

  return response.json();
}

export async function fetchPublicCatalog({ force = false, timeoutMs } = {}) {
  const now = Date.now();
  if (!force && catalogCache.value && ((now - catalogCache.at) < CATALOG_CACHE_TTL_MS)) {
    return catalogCache.value;
  }

  if (!force && catalogInFlight) {
    return catalogInFlight;
  }

  catalogInFlight = requestEdge('get_public_catalog', { timeoutMs })
    .then((payload) => {
      catalogCache = {
        at: Date.now(),
        value: payload
      };
      return payload;
    })
    .finally(() => {
      catalogInFlight = null;
    });

  return catalogInFlight;
}

export async function fetchPublishedRooms(options = {}) {
  const payload = await fetchPublicCatalog(options);
  return Array.isArray(payload.rooms) ? payload.rooms : [];
}

export async function fetchPublishedArtworks(options = {}) {
  const payload = await fetchPublicCatalog(options);
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
