import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAdminFromRequest } from '../_shared/admin.ts';

type UpsertBody = {
  action?: string;
  room?: Record<string, unknown>;
  artwork?: Record<string, unknown>;
  media?: Array<Record<string, unknown>>;
  entity?: 'room' | 'artwork';
  id?: string;
  slug?: string;
  is_published?: boolean;
};

async function upsertRoom(service: any, room: Record<string, unknown>) {
  const payload = {
    slug: String(room.slug || ''),
    title: String(room.title || ''),
    color: String(room.color || '#30405f'),
    sort_order: Number(room.sort_order ?? room.sortOrder ?? 0),
    is_published: Boolean(room.is_published ?? room.isPublished ?? false)
  };

  if (!payload.slug || !payload.title) {
    throw new Error('room.slug and room.title are required');
  }

  const { data, error } = await service
    .from('rooms')
    .upsert(payload, { onConflict: 'slug' })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function resolveRoomId(service: any, artwork: Record<string, unknown>) {
  if (artwork.room_id) {
    return String(artwork.room_id);
  }

  const roomSlug = artwork.room_slug || artwork.theme_id || artwork.themeId;
  if (!roomSlug) {
    throw new Error('artwork.room_id or artwork.room_slug is required');
  }

  const { data, error } = await service
    .from('rooms')
    .select('id')
    .eq('slug', String(roomSlug))
    .single();

  if (error || !data?.id) {
    throw new Error(`Room not found for slug: ${roomSlug}`);
  }

  return String(data.id);
}

async function upsertArtwork(service: any, artwork: Record<string, unknown>) {
  const roomId = await resolveRoomId(service, artwork);

  const payload: Record<string, unknown> = {
    room_id: roomId,
    legacy_numeric_id: artwork.legacy_numeric_id ?? artwork.legacyNumericId ?? null,
    title: String(artwork.title || ''),
    author: String(artwork.author || 'Artista'),
    year: artwork.year ? String(artwork.year) : null,
    technique: artwork.technique ? String(artwork.technique) : null,
    description: artwork.description ? String(artwork.description) : null,
    theme_id: artwork.theme_id ? String(artwork.theme_id) : null,
    section_id: artwork.section_id ? String(artwork.section_id) : null,
    sort_order: Number(artwork.sort_order ?? artwork.sortOrder ?? 0),
    is_published: Boolean(artwork.is_published ?? artwork.isPublished ?? false)
  };

  if (!payload.title) {
    throw new Error('artwork.title is required');
  }

  let query = service.from('artworks');

  if (artwork.id) {
    payload.id = String(artwork.id);
    query = query.upsert(payload, { onConflict: 'id' });
  } else {
    query = query.insert(payload);
  }

  const { data, error } = await query.select('*').single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function upsertMedia(service: any, mediaRows: Array<Record<string, unknown>>) {
  if (!Array.isArray(mediaRows) || mediaRows.length === 0) {
    throw new Error('media array is required');
  }

  const normalized = mediaRows.map((row) => ({
    artwork_id: String(row.artwork_id || row.artworkId || ''),
    kind: String(row.kind || ''),
    storage_path: String(row.storage_path || row.storagePath || ''),
    width: row.width ? Number(row.width) : null,
    height: row.height ? Number(row.height) : null,
    bytes: row.bytes ? Number(row.bytes) : null,
    mime_type: row.mime_type ? String(row.mime_type) : (row.mimeType ? String(row.mimeType) : null)
  }));

  for (const row of normalized) {
    if (!row.artwork_id || !row.kind || !row.storage_path) {
      throw new Error('Each media row requires artwork_id, kind, storage_path');
    }
  }

  const { data, error } = await service
    .from('artwork_media')
    .upsert(normalized, { onConflict: 'artwork_id,kind' })
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function setPublish(service: any, body: UpsertBody) {
  const entity = body.entity;
  const isPublished = Boolean(body.is_published);

  if (entity === 'room') {
    if (!body.id && !body.slug) {
      throw new Error('room id or slug is required');
    }

    let query = service.from('rooms').update({ is_published: isPublished });
    query = body.id ? query.eq('id', body.id) : query.eq('slug', body.slug);

    const { data, error } = await query.select('*');
    if (error) throw new Error(error.message);
    return data;
  }

  if (entity === 'artwork') {
    if (!body.id) {
      throw new Error('artwork id is required');
    }

    const { data, error } = await service
      .from('artworks')
      .update({ is_published: isPublished })
      .eq('id', body.id)
      .select('*');

    if (error) throw new Error(error.message);
    return data;
  }

  throw new Error('Unsupported entity for set_publish');
}

async function refreshAnalytics(service: any) {
  await service.rpc('refresh_materialized_view', { view_name: 'daily_metrics_mv' }).catch(() => null);
  await service.rpc('refresh_materialized_view', { view_name: 'room_funnel_mv' }).catch(() => null);
  await service.rpc('refresh_materialized_view', { view_name: 'artwork_retention_mv' }).catch(() => null);

  return { ok: true };
}

async function getAnalytics(service: any) {
  const [dailyRes, funnelRes, retentionRes] = await Promise.all([
    service
      .from('daily_metrics_mv')
      .select('*')
      .order('day', { ascending: false })
      .limit(120),
    service
      .from('room_funnel_mv')
      .select('*')
      .order('day', { ascending: false })
      .limit(120),
    service
      .from('artwork_retention_mv')
      .select('*')
      .order('cohort_day', { ascending: false })
      .limit(180)
  ]);

  if (dailyRes.error) throw new Error(dailyRes.error.message);
  if (funnelRes.error) throw new Error(funnelRes.error.message);
  if (retentionRes.error) throw new Error(retentionRes.error.message);

  return {
    daily: dailyRes.data || [],
    funnel: funnelRes.data || [],
    retention: retentionRes.data || []
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { service } = await requireAdminFromRequest(req);
    const body = (await req.json()) as UpsertBody;

    switch (body.action) {
      case 'upsert_room':
        return jsonResponse({ ok: true, data: await upsertRoom(service, body.room || {}) });
      case 'upsert_artwork':
        return jsonResponse({ ok: true, data: await upsertArtwork(service, body.artwork || {}) });
      case 'upsert_media':
        return jsonResponse({ ok: true, data: await upsertMedia(service, body.media || []) });
      case 'set_publish':
        return jsonResponse({ ok: true, data: await setPublish(service, body) });
      case 'refresh_analytics':
        return jsonResponse({ ok: true, data: await refreshAnalytics(service) });
      case 'get_analytics':
        return jsonResponse({ ok: true, data: await getAnalytics(service) });
      default:
        return jsonResponse({ error: 'Unsupported action' }, 400);
    }
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : 'Unexpected error'
    }, 500);
  }
});
