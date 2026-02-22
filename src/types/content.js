/**
 * @typedef {Object} RoomDTO
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {number|string} color
 * @property {number} sort_order
 * @property {boolean} is_published
 */

/**
 * @typedef {Object} ArtworkMediaDTO
 * @property {string} kind - original | web | thumb
 * @property {string} storage_path
 * @property {number} [width]
 * @property {number} [height]
 * @property {number} [bytes]
 * @property {string} [mime_type]
 */

/**
 * @typedef {Object} ArtworkPrivateMediaDTO
 * @property {string|null} [original_path]
 * @property {string|null} [original_url]
 * @property {number|null} [original_width]
 * @property {number|null} [original_height]
 * @property {string|null} [web_path]
 * @property {string|null} [web_url]
 * @property {number|null} [web_width]
 * @property {number|null} [web_height]
 * @property {string|null} [thumb_path]
 * @property {string|null} [thumb_url]
 * @property {number|null} [thumb_width]
 * @property {number|null} [thumb_height]
 */

/**
 * @typedef {Object} ArtworkDTO
 * @property {string} id
 * @property {number} legacy_numeric_id
 * @property {string} room_id
 * @property {string} title
 * @property {string} author
 * @property {string} [year]
 * @property {string} [technique]
 * @property {string} [description]
 * @property {string} [theme_id]
 * @property {string} [section_id]
 * @property {number} sort_order
 * @property {boolean} is_published
 * @property {string|null} [image_web_url]
 * @property {string|null} [image_thumb_url]
 * @property {string|null} [image_original_url]
 * @property {ArtworkPrivateMediaDTO} [media]
 */

/**
 * @typedef {Object} SessionEventDTO
 * @property {string} id
 * @property {string} [session_id]
 * @property {string} event_name
 * @property {Object} payload
 * @property {string} event_at
 */

/**
 * @typedef {Object} PrivateCatalogDTO
 * @property {'supabase-private'} source
 * @property {string} expires_at
 * @property {RoomDTO[]} rooms
 * @property {ArtworkDTO[]} artworks
 */

export const CONTENT_TYPES = Object.freeze({
  room: 'RoomDTO',
  artwork: 'ArtworkDTO',
  privateCatalog: 'PrivateCatalogDTO',
  media: 'ArtworkMediaDTO',
  event: 'SessionEventDTO'
});
