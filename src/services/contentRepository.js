import { ARTWORKS, ROOMS } from '../museum/data.js';
import {
  fetchPublicCatalog,
  isBackendConfigured
} from './backendClient.js';

function toNumericColor(value, fallback = 0x2f3f5a) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace('#', '');
    const numeric = Number.parseInt(normalized, 16);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return fallback;
}

function normalizeBackendRooms(rawRooms = []) {
  return rawRooms
    .map((room, index) => {
      const slug = room.slug || room.id;
      if (!slug) {
        return null;
      }

      return {
        id: slug,
        title: room.title || slug,
        themeIds: [slug],
        color: toNumericColor(room.color, 0x30405f),
        sortOrder: room.sort_order ?? index
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(({ sortOrder, ...room }) => room);
}

function pickArtworkImage(artwork) {
  if (artwork.image) return artwork.image;
  if (artwork.image_web_url) return artwork.image_web_url;
  if (artwork.media?.web_url) return artwork.media.web_url;
  if (artwork.media?.original_url) return artwork.media.original_url;
  if (artwork.media?.thumb_url) return artwork.media.thumb_url;
  return '';
}

function normalizeBackendArtworks(rawArtworks = [], normalizedRooms = []) {
  const roomIds = new Set(normalizedRooms.map((room) => room.id));

  return rawArtworks
    .map((artwork, index) => {
      const roomSlug = artwork.room_slug || artwork.theme_id || artwork.themeId;
      if (!roomSlug || !roomIds.has(roomSlug)) {
        return null;
      }

      const legacyId = Number.parseInt(artwork.legacy_numeric_id, 10);
      const parsedId = Number.isFinite(legacyId)
        ? legacyId
        : Number.parseInt(artwork.id, 10);

      const image = pickArtworkImage(artwork);
      if (!image) {
        return null;
      }

      return {
        id: Number.isFinite(parsedId) ? parsedId : (index + 1),
        title: artwork.title || 'Sin t\u00edtulo',
        file: artwork.file || '',
        author: artwork.author || 'Artista',
        image,
        themeId: roomSlug,
        sectionId: artwork.section_id || artwork.sectionId || 'principal',
        sectionTitle: artwork.section_title || artwork.sectionTitle || 'Colecci\u00f3n principal',
        sectionColor: toNumericColor(artwork.section_color || artwork.sectionColor, 0x8a8a8a),
        year: artwork.year || 'Sin fecha',
        technique: artwork.technique || 'No especificada',
        description: artwork.description || 'Sin descripci\u00f3n adicional.'
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.id - b.id);
}

export async function loadMuseumContent({
  preferBackend = true,
  backendTimeoutMs = 6000
} = {}) {
  if (preferBackend && isBackendConfigured()) {
    try {
      const payload = await fetchPublicCatalog({ timeoutMs: backendTimeoutMs });
      const rawRooms = Array.isArray(payload?.rooms) ? payload.rooms : [];
      const rawArtworks = Array.isArray(payload?.artworks) ? payload.artworks : [];

      const rooms = normalizeBackendRooms(rawRooms);
      const artworks = normalizeBackendArtworks(rawArtworks, rooms);

      if (rooms.length >= 4 && artworks.length > 0) {
        return {
          rooms,
          artworks,
          source: 'backend'
        };
      }
    } catch (error) {
      console.warn('[contentRepository] backend unavailable, fallback local', error);
    }
  }

  return {
    rooms: ROOMS,
    artworks: ARTWORKS,
    source: 'local-fallback'
  };
}
