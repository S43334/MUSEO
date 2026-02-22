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

const MIME_BY_FORMAT = new Map([
  ['jpeg', { ext: '.jpg', mime: 'image/jpeg' }],
  ['jpg', { ext: '.jpg', mime: 'image/jpeg' }],
  ['png', { ext: '.png', mime: 'image/png' }],
  ['webp', { ext: '.webp', mime: 'image/webp' }],
  ['gif', { ext: '.gif', mime: 'image/gif' }],
  ['tiff', { ext: '.tiff', mime: 'image/tiff' }],
  ['avif', { ext: '.avif', mime: 'image/avif' }]
]);

function parseArgs(argv) {
  const args = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      continue;
    }
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args.set(token, 'true');
      continue;
    }
    args.set(token, next);
    i += 1;
  }
  return args;
}

function getArg(args, name, fallback = null) {
  return args.get(name) ?? fallback;
}

function sanitizeSegment(value) {
  return String(value || '')
    .trim()
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function canonicalSelectionKey(item) {
  const fileLabel = String(
    item?.file || path.basename(String(item?.absolute_path || ''))
  )
    .trim()
    .toLowerCase();

  if (!fileLabel) {
    return '';
  }

  const ext = path.extname(fileLabel);
  const stemRaw = ext ? fileLabel.slice(0, -ext.length) : fileLabel;
  const stem = stemRaw
    .replace(/\(\d+\)$/g, '')
    .replace(/[_\s-]+copy$/g, '')
    .replace(/_0_$/g, '')
    .replace(/\s+/g, '');

  return `${stem}${ext}`;
}

function dedupeSelectedItems(items = []) {
  const seenCanonical = new Set();
  const seenAbsolute = new Set();
  const deduped = [];
  const removed = [];

  for (const item of items) {
    const absolutePath = String(item?.absolute_path || '').trim().toLowerCase();
    const canonicalKey = canonicalSelectionKey(item);

    if (absolutePath && seenAbsolute.has(absolutePath)) {
      removed.push(item);
      continue;
    }

    if (canonicalKey && seenCanonical.has(canonicalKey)) {
      removed.push(item);
      continue;
    }

    if (absolutePath) {
      seenAbsolute.add(absolutePath);
    }
    if (canonicalKey) {
      seenCanonical.add(canonicalKey);
    }
    deduped.push(item);
  }

  return { deduped, removed };
}

function titleFromFile(filePath) {
  const base = path.parse(filePath).name;
  const normalized = base
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return 'Recuerdo';
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function detectMimeAndExt(format, fallbackName) {
  const normalizedFormat = String(format || '').toLowerCase();
  const byFormat = MIME_BY_FORMAT.get(normalizedFormat);
  if (byFormat) {
    return byFormat;
  }

  const fallbackExt = path.extname(fallbackName || '').toLowerCase();
  const byExt = MIME_BY_FORMAT.get(fallbackExt.replace('.', ''));
  if (byExt) {
    return byExt;
  }

  return {
    ext: '.bin',
    mime: 'application/octet-stream'
  };
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function assertPrivatePasswordConfig(passwordSource) {
  if (passwordSource !== 'env') {
    return;
  }

  if (!process.env.MUSEO_PRIVATE_PASSWORD) {
    throw new Error(
      'password-source=env requiere la variable MUSEO_PRIVATE_PASSWORD para validar la configuración privada.'
    );
  }
}

async function resolveSourcePath(item, repoRoot, selectionDir) {
  const candidates = [];

  if (item.absolute_path) {
    candidates.push(path.resolve(String(item.absolute_path)));
  }
  if (item.file) {
    candidates.push(path.resolve(selectionDir, String(item.file)));
    candidates.push(path.resolve(repoRoot, String(item.file)));
    candidates.push(path.resolve(repoRoot, 'textures', 'Fotos', String(item.file)));
  }

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  throw new Error(`No se encontró archivo para selección: ${JSON.stringify(item)}`);
}

async function uploadObject(supabase, bucket, storagePath, bytes, contentType) {
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const repoRoot = path.resolve(__dirname, '..', '..');

  const selectionArg = getArg(args, '--selection', 'backend/private-room.selection.json');
  const roomSlug = String(getArg(args, '--room-slug', 'mielito'));
  const roomTitle = String(getArg(args, '--room-title', 'Secreto'));
  const passwordSource = String(getArg(args, '--password-source', 'env'));
  const legacyStart = Number.parseInt(String(getArg(args, '--legacy-start', '5001')), 10);

  assertPrivatePasswordConfig(passwordSource);

  const selectionPath = path.resolve(repoRoot, selectionArg);
  const selectionDir = path.dirname(selectionPath);
  const selectionRaw = await fs.readFile(selectionPath, 'utf8');
  const selection = JSON.parse(selectionRaw);

  const selectedRaw = Array.isArray(selection.selected) ? selection.selected : [];
  const { deduped: selected, removed: removedDuplicates } = dedupeSelectedItems(selectedRaw);
  if (selected.length === 0) {
    throw new Error('El archivo de selección no contiene elementos en selected[]');
  }
  if (removedDuplicates.length > 0) {
    console.log(`Removed duplicate private photos: ${removedDuplicates.length}`);
  }

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

  const roomPayload = {
    slug: roomSlug,
    title: roomTitle,
    color: '#5b3e63',
    sort_order: 999,
    is_published: false
  };

  const { data: roomRow, error: roomError } = await supabase
    .from('rooms')
    .upsert(roomPayload, { onConflict: 'slug' })
    .select('id, slug')
    .single();

  if (roomError || !roomRow?.id) {
    throw new Error(`No se pudo crear/actualizar la sala privada: ${roomError?.message || 'unknown error'}`);
  }

  const roomId = roomRow.id;

  const { data: oldArtworks, error: oldArtworksError } = await supabase
    .from('artworks')
    .select('id')
    .eq('room_id', roomId);

  if (oldArtworksError) {
    throw new Error(`No se pudo consultar obras previas: ${oldArtworksError.message}`);
  }

  if (Array.isArray(oldArtworks) && oldArtworks.length > 0) {
    const oldIds = oldArtworks.map((row) => row.id);
    const { error: deleteError } = await supabase
      .from('artworks')
      .delete()
      .in('id', oldIds);

    if (deleteError) {
      throw new Error(`No se pudieron limpiar obras previas: ${deleteError.message}`);
    }
  }

  const authorName = process.env.PRIVATE_ROOM_AUTHOR || 'Colección privada';

  const artworkPayload = selected.map((item, index) => {
    const legacyNumericId = legacyStart + index;
    const fileLabel = item.file || path.basename(item.absolute_path || `foto_${legacyNumericId}`);
    return {
      legacy_numeric_id: legacyNumericId,
      room_id: roomId,
      title: String(item.title || titleFromFile(fileLabel)),
      author: authorName,
      year: String(item.year || 'Sin fecha'),
      technique: String(item.technique || 'Fotografía'),
      description: String(item.description || 'Recuerdo privado'),
      theme_id: roomSlug,
      section_id: String(item.section_id || 'privado'),
      sort_order: index + 1,
      is_published: false
    };
  });

  const { data: insertedArtworks, error: insertError } = await supabase
    .from('artworks')
    .insert(artworkPayload)
    .select('id, legacy_numeric_id, sort_order');

  if (insertError) {
    throw new Error(`No se pudieron crear obras privadas: ${insertError.message}`);
  }

  const artworkIdByLegacy = new Map(
    (insertedArtworks || []).map((row) => [Number(row.legacy_numeric_id), row.id])
  );

  const mediaRows = [];
  let processed = 0;

  for (let index = 0; index < selected.length; index += 1) {
    const item = selected[index];
    const legacyNumericId = legacyStart + index;
    const artworkId = artworkIdByLegacy.get(legacyNumericId);
    if (!artworkId) {
      throw new Error(`No artwork_id para legacy ${legacyNumericId}`);
    }

    const sourcePath = await resolveSourcePath(item, repoRoot, selectionDir);
    const sourceBytes = await fs.readFile(sourcePath);
    const parsedSource = path.parse(sourcePath);
    const fileBase = sanitizeSegment(parsedSource.name) || `photo_${legacyNumericId}`;
    const objectPrefix = `private/${roomSlug}/${legacyNumericId}-${fileBase}`;

    const sourceMetadata = await sharp(sourceBytes, { failOn: 'none' }).metadata();
    const isHeicLike = ['heif', 'heic'].includes(String(sourceMetadata.format || '').toLowerCase())
      || ['.heic', '.heif'].includes(parsedSource.ext.toLowerCase());

    let originalResult;
    if (isHeicLike) {
      originalResult = await sharp(sourceBytes, { failOn: 'none' })
        .rotate()
        .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
        .toBuffer({ resolveWithObject: true });
    } else {
      originalResult = await sharp(sourceBytes, { failOn: 'none' })
        .rotate()
        .toBuffer({ resolveWithObject: true });
    }

    const webResult = await sharp(sourceBytes, { failOn: 'none' })
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 84, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    const thumbResult = await sharp(sourceBytes, { failOn: 'none' })
      .rotate()
      .resize({ width: 420, withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    const originalMimeAndExt = detectMimeAndExt(originalResult.info.format, sourcePath);
    const originalPath = `${objectPrefix}${originalMimeAndExt.ext}`;
    const webPath = `${objectPrefix}.web.webp`;
    const thumbPath = `${objectPrefix}.thumb.webp`;

    await uploadObject(
      supabase,
      'artworks-original',
      originalPath,
      originalResult.data,
      originalMimeAndExt.mime
    );
    await uploadObject(
      supabase,
      'artworks-web',
      webPath,
      webResult.data,
      'image/webp'
    );
    await uploadObject(
      supabase,
      'artworks-thumb',
      thumbPath,
      thumbResult.data,
      'image/webp'
    );

    mediaRows.push(
      {
        artwork_id: artworkId,
        kind: 'original',
        storage_path: originalPath,
        width: originalResult.info.width || null,
        height: originalResult.info.height || null,
        bytes: originalResult.data.length,
        mime_type: originalMimeAndExt.mime
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
    );

    processed += 1;
    if (processed % 10 === 0 || processed === selected.length) {
      console.log(`Processed private photos: ${processed}/${selected.length}`);
    }
  }

  const { error: mediaError } = await supabase
    .from('artwork_media')
    .upsert(mediaRows, { onConflict: 'artwork_id,kind' });

  if (mediaError) {
    throw new Error(`No se pudo guardar artwork_media: ${mediaError.message}`);
  }

  console.log('Private room sync completed');
  console.log(`Room: ${roomSlug} (${roomId})`);
  console.log(`Artworks: ${selected.length}`);
  console.log(`Media rows: ${mediaRows.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
