import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import sharp from 'sharp';

const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic']);
const DEFAULT_DISTANCE_THRESHOLD = 0.38;

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

function sanitizeFileSegment(value) {
  return String(value || '')
    .trim()
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function classifyOrientation(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return 'unknown';
  }
  if (width > height * 1.1) {
    return 'horizontal';
  }
  if (height > width * 1.1) {
    return 'vertical';
  }
  return 'square';
}

async function collectImageFiles(rootDir) {
  const files = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (VALID_EXTENSIONS.has(ext)) {
        files.push(fullPath);
      }
    }
  }

  await walk(rootDir);
  files.sort((a, b) => a.localeCompare(b));
  return files;
}

function resolveReferencePath(referenceArg, photosDir, allFiles) {
  if (!referenceArg) {
    throw new Error('Missing reference argument');
  }

  const direct = path.resolve(referenceArg);
  const photosRelative = path.resolve(photosDir, referenceArg);
  const byName = allFiles.find((file) => path.basename(file) === referenceArg);

  if (allFiles.includes(direct)) {
    return direct;
  }
  if (allFiles.includes(photosRelative)) {
    return photosRelative;
  }
  if (byName) {
    return byName;
  }

  throw new Error(`Reference image not found: ${referenceArg}`);
}

async function ensureDir(targetDir) {
  await fs.mkdir(targetDir, { recursive: true });
}

async function normalizeImageForFaceEmbedding(sourcePath, outputPath) {
  const normalized = await sharp(sourcePath, { failOn: 'none' })
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(outputPath);

  return {
    width: normalized.width ?? null,
    height: normalized.height ?? null
  };
}

function detectPythonRuntime() {
  const candidates = [
    { command: 'python', args: [] },
    { command: 'py', args: ['-3'] },
    { command: 'python3', args: [] }
  ];

  for (const candidate of candidates) {
    const probe = spawnSync(
      candidate.command,
      [...candidate.args, '-c', 'import face_recognition; print("ok")'],
      { encoding: 'utf8' }
    );
    if (probe.status === 0) {
      return candidate;
    }
  }

  throw new Error(
    'Python con el paquete "face_recognition" no está disponible. ' +
    'Instala Python + face_recognition para usar este script.'
  );
}

function buildPythonWorkerScript() {
  return `
import json
import math
import os
import sys

import face_recognition

def l2_distance(a, b):
  return math.sqrt(sum((x - y) ** 2 for x, y in zip(a, b)))

def load_encodings(file_path):
  image = face_recognition.load_image_file(file_path)
  locations = face_recognition.face_locations(image, model='hog')
  encodings = face_recognition.face_encodings(image, known_face_locations=locations)
  return encodings

def first_encoding(file_path, label):
  encodings = load_encodings(file_path)
  if not encodings:
    raise RuntimeError(f'No face found in reference image: {label}')
  return encodings[0]

manifest_path = sys.argv[1]
result_path = sys.argv[2]

with open(manifest_path, 'r', encoding='utf-8') as handle:
  manifest = json.load(handle)

distance_threshold = float(manifest.get('distance_threshold', 0.38))
self_ref = first_encoding(manifest['self_ref'], 'self')
partner_ref = first_encoding(manifest['partner_ref'], 'partner')

selected = []
review = []
rejected = []

for candidate in manifest.get('candidates', []):
  file_path = candidate['processed_path']
  source_path = candidate['source_path']
  encodings = load_encodings(file_path)

  if not encodings:
    rejected.append({
      'source_path': source_path,
      'face_count': 0,
      'scores': {
        'self': None,
        'partner': None
      },
      'reason': 'no_face'
    })
    continue

  self_distances = [l2_distance(enc, self_ref) for enc in encodings]
  partner_distances = [l2_distance(enc, partner_ref) for enc in encodings]

  best_self = min(self_distances)
  best_partner = min(partner_distances)
  best_self_index = self_distances.index(best_self)
  best_partner_index = partner_distances.index(best_partner)

  is_self_match = best_self <= distance_threshold
  is_partner_match = best_partner <= distance_threshold
  likely_both = (
    is_self_match and
    is_partner_match and
    len(encodings) >= 2 and
    best_self_index != best_partner_index
  )

  payload = {
    'source_path': source_path,
    'face_count': len(encodings),
    'scores': {
      'self': round(best_self, 6),
      'partner': round(best_partner, 6)
    }
  }

  if likely_both:
    payload['reason'] = 'both_matched'
    selected.append(payload)
    continue

  near_threshold = distance_threshold + 0.06
  maybe_both = (
    best_self <= near_threshold and
    best_partner <= near_threshold
  )

  if maybe_both or (is_self_match and not is_partner_match) or (is_partner_match and not is_self_match):
    payload['reason'] = 'manual_review'
    review.append(payload)
  else:
    payload['reason'] = 'low_confidence'
    rejected.append(payload)

result = {
  'selected': selected,
  'review': review,
  'rejected': rejected
}

with open(result_path, 'w', encoding='utf-8') as handle:
  json.dump(result, handle, ensure_ascii=False, indent=2)
`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const repoRoot = path.resolve(__dirname, '..', '..');

  const photosDirArg = getArg(args, '--photos-dir');
  const selfRefArg = getArg(args, '--self-ref');
  const partnerRefArg = getArg(args, '--partner-ref');
  const outArg = getArg(args, '--out', 'backend/private-room.selection.json');
  const thresholdArg = Number.parseFloat(
    String(getArg(args, '--distance-threshold', DEFAULT_DISTANCE_THRESHOLD))
  );

  if (!photosDirArg || !selfRefArg || !partnerRefArg) {
    throw new Error(
      'Usage: node scripts/select_couple_photos.mjs ' +
      '--photos-dir textures/Fotos --self-ref TU.jpg --partner-ref NOVIA.jpg ' +
      '[--out backend/private-room.selection.json] [--distance-threshold 0.38]'
    );
  }

  const photosDir = path.resolve(repoRoot, photosDirArg);
  const outPath = path.resolve(repoRoot, outArg);
  const distanceThreshold = Number.isFinite(thresholdArg)
    ? thresholdArg
    : DEFAULT_DISTANCE_THRESHOLD;

  const allFiles = await collectImageFiles(photosDir);
  if (allFiles.length === 0) {
    throw new Error(`No images found in ${photosDir}`);
  }

  const selfRefPath = resolveReferencePath(selfRefArg, photosDir, allFiles);
  const partnerRefPath = resolveReferencePath(partnerRefArg, photosDir, allFiles);

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'museo-couple-select-'));
  const normalizedDir = path.join(tempRoot, 'normalized');
  await ensureDir(normalizedDir);

  const normalizedManifest = [];

  for (const sourcePath of allFiles) {
    const relativePath = path.relative(photosDir, sourcePath);
    const safeName = sanitizeFileSegment(relativePath.replace(/[\\/]/g, '__'));
    const processedPath = path.join(normalizedDir, `${safeName}.jpg`);
    const normalizedInfo = await normalizeImageForFaceEmbedding(sourcePath, processedPath);

    normalizedManifest.push({
      source_path: sourcePath,
      relative_path: relativePath,
      processed_path: processedPath,
      width: normalizedInfo.width,
      height: normalizedInfo.height,
      orientation: classifyOrientation(normalizedInfo.width, normalizedInfo.height)
    });
  }

  const selfRefProcessed = normalizedManifest.find((item) => item.source_path === selfRefPath);
  const partnerRefProcessed = normalizedManifest.find((item) => item.source_path === partnerRefPath);
  if (!selfRefProcessed || !partnerRefProcessed) {
    throw new Error('Failed to normalize reference images');
  }

  const manifestPath = path.join(tempRoot, 'face-manifest.json');
  const pythonOutputPath = path.join(tempRoot, 'face-output.json');
  const pythonScriptPath = path.join(tempRoot, 'face-worker.py');

  await fs.writeFile(
    manifestPath,
    JSON.stringify({
      self_ref: selfRefProcessed.processed_path,
      partner_ref: partnerRefProcessed.processed_path,
      distance_threshold: distanceThreshold,
      candidates: normalizedManifest
    }, null, 2),
    'utf8'
  );
  await fs.writeFile(pythonScriptPath, buildPythonWorkerScript(), 'utf8');

  const pythonRuntime = detectPythonRuntime();
  const run = spawnSync(
    pythonRuntime.command,
    [...pythonRuntime.args, pythonScriptPath, manifestPath, pythonOutputPath],
    { encoding: 'utf8' }
  );

  if (run.status !== 0) {
    throw new Error(
      `Face recognition script failed (${pythonRuntime.command}):\n` +
      `${run.stderr || run.stdout || 'Unknown python error'}`
    );
  }

  const pythonResult = JSON.parse(await fs.readFile(pythonOutputPath, 'utf8'));
  const metaBySourcePath = new Map(normalizedManifest.map((item) => [item.source_path, item]));

  function mapItem(item) {
    const meta = metaBySourcePath.get(item.source_path);
    return {
      file: meta?.relative_path || path.basename(item.source_path),
      absolute_path: item.source_path,
      width: meta?.width ?? null,
      height: meta?.height ?? null,
      orientation: meta?.orientation || 'unknown',
      face_count: item.face_count ?? 0,
      scores: item.scores || {
        self: null,
        partner: null
      },
      reason: item.reason || null
    };
  }

  const outputPayload = {
    generated_at: new Date().toISOString(),
    photos_dir: photosDir,
    distance_threshold: distanceThreshold,
    references: {
      self: path.relative(photosDir, selfRefPath),
      partner: path.relative(photosDir, partnerRefPath)
    },
    selected: Array.isArray(pythonResult.selected)
      ? pythonResult.selected.map(mapItem)
      : [],
    review: Array.isArray(pythonResult.review)
      ? pythonResult.review.map(mapItem)
      : [],
    rejected: Array.isArray(pythonResult.rejected)
      ? pythonResult.rejected.map(mapItem)
      : []
  };

  await ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, JSON.stringify(outputPayload, null, 2), 'utf8');

  console.log(`Selection file generated at: ${outPath}`);
  console.log(`Selected: ${outputPayload.selected.length}`);
  console.log(`Review:   ${outputPayload.review.length}`);
  console.log(`Rejected: ${outputPayload.rejected.length}`);
  console.log(`Python runtime: ${pythonRuntime.command} ${pythonRuntime.args.join(' ')}`.trim());
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
