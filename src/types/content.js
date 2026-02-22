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
 */

/**
 * @typedef {Object} SessionEventDTO
 * @property {string} id
 * @property {string} [session_id]
 * @property {string} event_name
 * @property {Object} payload
 * @property {string} event_at
 */

export const CONTENT_TYPES = Object.freeze({
  room: 'RoomDTO',
  artwork: 'ArtworkDTO',
  media: 'ArtworkMediaDTO',
  event: 'SessionEventDTO'
});