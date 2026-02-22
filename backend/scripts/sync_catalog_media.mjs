import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const envName of REQUIRED_ENV) {
  if (!process.env[envName]) {
    throw new Error(`Missing environment variable: ${envName}`);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const dataPath = path.join(repoRoot, 'src', 'museum', 'data.js');
const texturesDir = path.join(repoRoot, 'textures', 'paintings');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

const MIME_BY_FORMAT = new Map([
  ['jpeg', 'image/jpeg'],
  ['jpg', 'image/jpeg'],
  ['png', 'image/png'],
  ['webp', 'image/webp'],
  ['gif', 'image/gif'],
  ['tiff', 'image/tiff'],
  ['avif', 'image/avif']
]);

function colorToHex(colorValue) {
  if (typeof colorValue === 'string' && colorValue.startsWith('#')) {
    return colorValue;
  }

  const numericColor = Number(colorValue);
  if (!Number.isFinite(numericColor)) {
    return '#30405f';
  }

  return `#${numericColor.toString(16).padStart(6, '0')}`;
}

function detectMimeType(format, fileName) {
  const byFormat = MIME_BY_FORMAT.get(String(format || '').toLowerCase());
  if (byFormat) {
    return byFormat;
  }

  const ext = path.extname(fileName).replace('.', '').toLowerCase();
  return MIME_BY_FORMAT.get(ext) || 'application/octet-stream';
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function loadCatalogFromDataModule() {
  const dataSource = await fs.readFile(dataPath, 'utf8');
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(dataSource, 'utf8').toString('base64')}`;
  const moduleData = await import(moduleUrl);

  return {
    rooms: Array.isArray(moduleData.ROOMS) ? moduleData.ROOMS : [],
    artworks: Array.isArray(moduleData.ARTWORKS) ? moduleData.ARTWORKS : []
  };
}

async function resolveArtworkSourcePath(artwork) {
  const candidates = [];
  if (artwork.image) {
    candidates.push(path.join(repoRoot, String(artwork.image)));
  }
  if (artwork.file) {
    candidates.push(path.join(texturesDir, String(artwork.file)));
  }
  candidates.push(path.join(texturesDir, `dibujo${artwork.id}.jpg`));

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Source image not found for artwork ${artwork.id}`);
}

async function uploadObject(bucket, storagePath, bytes, contentType) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, bytes, {
      contentType,
      upsert: true,
      cacheControl: '31536000'
    });

  if (error) {
    throw new Error(`Upload failed for ${bucket}/${storagePath}: ${error.message}`);
  }
}

function toMediaRows(artworkId, sourceFileName, originalInfo, webResult, thumbResult) {
  const parsed = path.parse(sourceFileName);
  const originalPath = `legacy/${sourceFileName}`;
  const webPath = `legacy/${parsed.name}.web.webp`;
  const thumbPath = `legacy/${parsed.name}.thumb.webp`;

  return {
    uploadTargets: {
      originalPath,
      webPath,
      thumbPath
    },
    rows: [
      {
        artwork_id: artworkId,
        kind: 'original',
        storage_path: originalPath,
        width: originalInfo.width || null,
        height: originalInfo.height || null,
        bytes: originalInfo.bytes,
        mime_type: originalInfo.mimeType
      },
      {
        artwork_id: artworkId,
        kind: 'web',
        storage_path: webPath,
        width: webResult.info.width || null,
        height: webResult.info.height || null,
        bytes: webResult.data.length,
        mime_type: 'image/webp'
      },
      {
        artwork_id: artworkId,
        kind: 'thumb',
        storage_path: thumbPath,
        width: thumbResult.info.width || null,
        height: thumbResult.info.height || null,
        bytes: thumbResult.data.length,
        mime_type: 'image/webp'
      }
    ]
  };
}

async function main() {
  const { rooms, artworks } = await loadCatalogFromDataModule();
  if (rooms.length === 0 || artworks.length === 0) {
    throw new Error('Catalog source is empty');
  }

  console.log(`Loaded local catalog: rooms=${rooms.length}, artworks=${artworks.length}`);

  const roomPayload = rooms.map((room, index) => ({
    slug: String(room.id),
    title: String(room.title),
    color: colorToHex(room.color),
    sort_order: Number(room.sort_order ?? room.sortOrder ?? index + 1),
    is_published: true
  }));

  const { data: upsertedRooms, error: roomError } = await supabase
    .from('rooms')
    .upsert(roomPayload, { onConflict: 'slug' })
    .select('id, slug');

  if (roomError) {
    throw new Error(`Rooms upsert failed: ${roomError.message}`);
  }

  const roomIdBySlug = new Map((upsertedRooms || []).map((room) => [room.slug, room.id]));
  console.log(`Rooms synchronized: ${roomIdBySlug.size}`);

  const artworkPayload = artworks.map((artwork, index) => {
    const roomSlug = String(artwork.themeId || '');
    const roomId = roomIdBySlug.get(roomSlug);
    if (!roomId) {
      throw new Error(`Room slug not found for artwork ${artwork.id}: ${roomSlug}`);
    }

    return {
      legacy_numeric_id: Number(artwork.id),
      room_id: roomId,
      title: String(artwork.title),
      author: String(artwork.author || 'Artista'),
      year: artwork.year ? String(artwork.year) : null,
      technique: artwork.technique ? String(artwork.technique) : null,
      description: artwork.description ? String(artwork.description) : null,
      theme_id: artwork.themeId ? String(artwork.themeId) : null,
      section_id: artwork.sectionId ? String(artwork.sectionId) : null,
      sort_order: Number(artwork.sort_order ?? artwork.sortOrder ?? index + 1),
      is_published: true
    };
  });

  const { data: upsertedArtworks, error: artworkError } = await supabase
    .from('artworks')
    .upsert(artworkPayload, { onConflict: 'legacy_numeric_id' })
    .select('id, legacy_numeric_id');

  if (artworkError) {
    throw new Error(`Artworks upsert failed: ${artworkError.message}`);
  }

  const artworkIdByLegacyId = new Map(
    (upsertedArtworks || []).map((artwork) => [Number(artwork.legacy_numeric_id), artwork.id])
  );
  console.log(`Artworks synchronized: ${artworkIdByLegacyId.size}`);

  const mediaRows = [];
  let processed = 0;

  for (const artwork of artworks) {
    const artworkId = artworkIdByLegacyId.get(Number(artwork.id));
    if (!artworkId) {
      throw new Error(`Missing persisted artwork for legacy id ${artwork.id}`);
    }

    const sourcePath = await resolveArtworkSourcePath(artwork);
    const sourceFileName = path.basename(sourcePath);
    const originalBytes = await fs.readFile(sourcePath);
    const originalMeta = await sharp(originalBytes, { failOn: 'none' }).metadata();
    const originalMimeType = detectMimeType(originalMeta.format, sourceFileName);

    const webResult = await sharp(originalBytes, { failOn: 'none' })
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    const thumbResult = await sharp(originalBytes, { failOn: 'none' })
      .rotate()
      .resize({ width: 480, withoutEnlargement: true })
      .webp({ quality: 78, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    const mediaInfo = toMediaRows(
      artworkId,
      sourceFileName,
      {
        width: originalMeta.width || null,
        height: originalMeta.height || null,
        bytes: originalBytes.length,
        mimeType: originalMimeType
      },
      webResult,
      thumbResult
    );

    await uploadObject('artworks-original', mediaInfo.uploadTargets.originalPath, originalBytes, originalMimeType);
    await uploadObject('artworks-web', mediaInfo.uploadTargets.webPath, webResult.data, 'image/webp');
    await uploadObject('artworks-thumb', mediaInfo.uploadTargets.thumbPath, thumbResult.data, 'image/webp');

    mediaRows.push(...mediaInfo.rows);
    processed += 1;

    if (processed % 8 === 0 || processed === artworks.length) {
      console.log(`Processed images: ${processed}/${artworks.length}`);
    }
  }

  const { error: mediaError } = await supabase
    .from('artwork_media')
    .upsert(mediaRows, { onConflict: 'artwork_id,kind' });

  if (mediaError) {
    throw new Error(`Media upsert failed: ${mediaError.message}`);
  }

  const [{ count: webCount, error: webCountError }, { count: thumbCount, error: thumbCountError }] = await Promise.all([
    supabase.from('artwork_media').select('*', { count: 'exact', head: true }).eq('kind', 'web'),
    supabase.from('artwork_media').select('*', { count: 'exact', head: true }).eq('kind', 'thumb')
  ]);

  if (webCountError) {
    throw new Error(`Web media count failed: ${webCountError.message}`);
  }

  if (thumbCountError) {
    throw new Error(`Thumb media count failed: ${thumbCountError.message}`);
  }

  console.log('Catalog sync completed');
  console.log(`web media rows: ${webCount}`);
  console.log(`thumb media rows: ${thumbCount}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
