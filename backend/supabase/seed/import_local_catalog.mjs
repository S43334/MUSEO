import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataPath = path.join(root, 'src', 'museum', 'data.js');
const texturesDir = path.join(root, 'textures', 'paintings');
const outJson = path.join(root, 'backend', 'supabase', 'seed', 'catalog.seed.json');
const outSql = path.join(root, 'backend', 'supabase', 'seed', 'catalog.seed.sql');
fs.mkdirSync(path.dirname(outJson), { recursive: true });

const dataSource = fs.readFileSync(dataPath, 'utf8');
const dataModuleUrl = `data:text/javascript;base64,${Buffer.from(dataSource, 'utf8').toString('base64')}`;
const moduleData = await import(dataModuleUrl);
const rooms = moduleData.ROOMS || [];
const artworks = moduleData.ARTWORKS || [];

const filesInDir = new Set(fs.readdirSync(texturesDir));

const payload = {
  generatedAt: new Date().toISOString(),
  rooms,
  artworks: artworks.map((artwork, index) => {
    const fallbackFile = `dibujo${artwork.id}.jpg`;
    const localFile = artwork.file || fallbackFile;
    const guessedFile = filesInDir.has(localFile) ? localFile : fallbackFile;

    return {
      ...artwork,
      sort_order: index + 1,
      media: {
        original: `legacy/${guessedFile}`,
        web: `legacy/${path.parse(guessedFile).name}.web.webp`,
        thumb: `legacy/${path.parse(guessedFile).name}.thumb.webp`
      }
    };
  })
};

fs.writeFileSync(outJson, JSON.stringify(payload, null, 2));

function sqlString(value) {
  if (value === null || value === undefined) return 'NULL';
  const text = String(value).replaceAll("'", "''");
  return `'${text}'`;
}

const lines = [];
lines.push('-- catalog.seed.sql (generated)');
lines.push('begin;');

for (const [roomIndex, room] of rooms.entries()) {
  const roomSortOrder = Number(room.sort_order ?? room.sortOrder ?? 0);
  lines.push(`
insert into public.rooms (slug, title, color, sort_order, is_published)
values (${sqlString(room.id)}, ${sqlString(room.title)}, ${sqlString(`#${Number(room.color).toString(16).padStart(6, '0')}`)}, ${roomSortOrder || (roomIndex + 1)}, true)
on conflict (slug) do update
set title = excluded.title,
    color = excluded.color,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    updated_at = now();`);
}

for (const artwork of payload.artworks) {
  lines.push(`
insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  ${Number(artwork.id)},
  (select id from public.rooms where slug = ${sqlString(artwork.themeId)}),
  ${sqlString(artwork.title)},
  ${sqlString(artwork.author)},
  ${sqlString(artwork.year || null)},
  ${sqlString(artwork.technique || null)},
  ${sqlString(artwork.description || null)},
  ${sqlString(artwork.themeId || null)},
  ${sqlString(artwork.sectionId || null)},
  ${Number(artwork.sort_order || artwork.id)},
  true
)
on conflict (legacy_numeric_id) do update
set room_id = excluded.room_id,
    title = excluded.title,
    author = excluded.author,
    year = excluded.year,
    technique = excluded.technique,
    description = excluded.description,
    theme_id = excluded.theme_id,
    section_id = excluded.section_id,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    updated_at = now();`);

  for (const kind of ['original', 'web', 'thumb']) {
    lines.push(`
insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = ${Number(artwork.id)}),
  ${sqlString(kind)},
  ${sqlString(artwork.media[kind])}
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;`);
  }
}

lines.push('commit;');

fs.writeFileSync(outSql, lines.join('\n'));
console.log('Generated:', path.relative(root, outJson), path.relative(root, outSql));
