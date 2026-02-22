import { ensureConfig } from './config.js';
import { getAccessToken } from './auth.js';

async function callFunction(path, body, method = 'POST') {
  const cfg = ensureConfig();
  const token = await getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    apikey: cfg.supabaseAnonKey
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${cfg.functionsBaseUrl}/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || `${path} failed (${response.status})`);
  }

  return payload;
}

export async function fetchCatalog() {
  return callFunction('get_public_catalog', null, 'GET');
}

export async function upsertRoom(room) {
  return callFunction('admin_upsert_content', {
    action: 'upsert_room',
    room
  });
}

export async function upsertArtwork(artwork) {
  return callFunction('admin_upsert_content', {
    action: 'upsert_artwork',
    artwork
  });
}

export async function upsertMedia(media) {
  return callFunction('admin_upsert_content', {
    action: 'upsert_media',
    media
  });
}

export async function setPublish(entity, id, isPublished) {
  return callFunction('admin_upsert_content', {
    action: 'set_publish',
    entity,
    id,
    is_published: isPublished
  });
}

export async function refreshAnalyticsViews() {
  return callFunction('admin_upsert_content', {
    action: 'refresh_analytics'
  });
}

export async function getAnalytics() {
  const payload = await callFunction('admin_upsert_content', {
    action: 'get_analytics'
  });
  return payload.data || { daily: [], funnel: [], retention: [] };
}

export async function issueUploadUrls(artworkId, extHints = {}) {
  return callFunction('admin_issue_upload_urls', {
    artworkId,
    originalExt: extHints.originalExt,
    webExt: extHints.webExt || 'webp',
    thumbExt: extHints.thumbExt || 'webp'
  });
}
