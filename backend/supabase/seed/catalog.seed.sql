-- catalog.seed.sql (generated)
begin;

insert into public.rooms (slug, title, color, sort_order, is_published)
values ('retratos', 'Retratos y personas queridas', '#2d4a73', 1, true)
on conflict (slug) do update
set title = excluded.title,
    color = excluded.color,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    updated_at = now();

insert into public.rooms (slug, title, color, sort_order, is_published)
values ('fantasia', 'Fantasía y color', '#355f4a', 2, true)
on conflict (slug) do update
set title = excluded.title,
    color = excluded.color,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    updated_at = now();

insert into public.rooms (slug, title, color, sort_order, is_published)
values ('pop', 'Cultura pop y héroes', '#6a3f56', 3, true)
on conflict (slug) do update
set title = excluded.title,
    color = excluded.color,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    updated_at = now();

insert into public.rooms (slug, title, color, sort_order, is_published)
values ('tradicion', 'Tradición, fe y estudio', '#6b5a32', 4, true)
on conflict (slug) do update
set title = excluded.title,
    color = excluded.color,
    sort_order = excluded.sort_order,
    is_published = excluded.is_published,
    updated_at = now();

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  1,
  (select id from public.rooms where slug = 'retratos'),
  'Sebastián',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'retratos',
  'fantasia_luminosa',
  1,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 1),
  'original',
  'legacy/dibujo1.png'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 1),
  'web',
  'legacy/dibujo1.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 1),
  'thumb',
  'legacy/dibujo1.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  2,
  (select id from public.rooms where slug = 'fantasia'),
  'La reina de los pájaros canta...',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'fantasia',
  'memorias_grafito',
  2,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 2),
  'original',
  'legacy/dibujo2.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 2),
  'web',
  'legacy/dibujo2.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 2),
  'thumb',
  'legacy/dibujo2.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  3,
  (select id from public.rooms where slug = 'pop'),
  'WANDAVISION 50s',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'pop',
  'aventura_pop',
  3,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 3),
  'original',
  'legacy/dibujo3.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 3),
  'web',
  'legacy/dibujo3.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 3),
  'thumb',
  'legacy/dibujo3.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  4,
  (select id from public.rooms where slug = 'pop'),
  '"I KNOW WHO I AM..." - Wanda Maximoff / Scarlet Witch',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'pop',
  'noches_heroicas',
  4,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 4),
  'original',
  'legacy/dibujo4.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 4),
  'web',
  'legacy/dibujo4.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 4),
  'thumb',
  'legacy/dibujo4.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  5,
  (select id from public.rooms where slug = 'tradicion'),
  'El gallo',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'tradicion',
  'retrato_legado',
  5,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 5),
  'original',
  'legacy/dibujo5.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 5),
  'web',
  'legacy/dibujo5.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 5),
  'thumb',
  'legacy/dibujo5.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  6,
  (select id from public.rooms where slug = 'tradicion'),
  'Pendiente',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'tradicion',
  'memorias_grafito',
  6,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 6),
  'original',
  'legacy/dibujo6.png'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 6),
  'web',
  'legacy/dibujo6.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 6),
  'thumb',
  'legacy/dibujo6.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  7,
  (select id from public.rooms where slug = 'pop'),
  'Loki y Sylvie',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'pop',
  'aventura_pop',
  7,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 7),
  'original',
  'legacy/dibujo7.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 7),
  'web',
  'legacy/dibujo7.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 7),
  'thumb',
  'legacy/dibujo7.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  8,
  (select id from public.rooms where slug = 'pop'),
  'Vision (Disfraz de Vision)',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'pop',
  'noches_heroicas',
  8,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 8),
  'original',
  'legacy/dibujo8.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 8),
  'web',
  'legacy/dibujo8.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 8),
  'thumb',
  'legacy/dibujo8.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  9,
  (select id from public.rooms where slug = 'pop'),
  'Batgirl',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'pop',
  'aventura_pop',
  9,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 9),
  'original',
  'legacy/dibujo9.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 9),
  'web',
  'legacy/dibujo9.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 9),
  'thumb',
  'legacy/dibujo9.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  10,
  (select id from public.rooms where slug = 'retratos'),
  'Claus y Charlotte: la magia de la Navidad',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'retratos',
  'fantasia_luminosa',
  10,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 10),
  'original',
  'legacy/dibujo10.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 10),
  'web',
  'legacy/dibujo10.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 10),
  'thumb',
  'legacy/dibujo10.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  11,
  (select id from public.rooms where slug = 'fantasia'),
  'Planeta de pizza',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'fantasia',
  'aventura_pop',
  11,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 11),
  'original',
  'legacy/dibujo11.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 11),
  'web',
  'legacy/dibujo11.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 11),
  'thumb',
  'legacy/dibujo11.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  12,
  (select id from public.rooms where slug = 'retratos'),
  'Lizzie in the Emmys',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'retratos',
  'retrato_legado',
  12,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 12),
  'original',
  'legacy/dibujo12.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 12),
  'web',
  'legacy/dibujo12.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 12),
  'thumb',
  'legacy/dibujo12.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  13,
  (select id from public.rooms where slug = 'fantasia'),
  'Flowers with girl''s Redhead',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'fantasia',
  'color_celebracion',
  13,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 13),
  'original',
  'legacy/dibujo13.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 13),
  'web',
  'legacy/dibujo13.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 13),
  'thumb',
  'legacy/dibujo13.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  14,
  (select id from public.rooms where slug = 'fantasia'),
  'NASA',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'fantasia',
  'aventura_pop',
  14,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 14),
  'original',
  'legacy/dibujo14.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 14),
  'web',
  'legacy/dibujo14.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 14),
  'thumb',
  'legacy/dibujo14.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  15,
  (select id from public.rooms where slug = 'fantasia'),
  'La sirena',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'fantasia',
  'fantasia_luminosa',
  15,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 15),
  'original',
  'legacy/dibujo15.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 15),
  'web',
  'legacy/dibujo15.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 15),
  'thumb',
  'legacy/dibujo15.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  16,
  (select id from public.rooms where slug = 'fantasia'),
  'El paraguas',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'fantasia',
  'fantasia_luminosa',
  16,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 16),
  'original',
  'legacy/dibujo16.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 16),
  'web',
  'legacy/dibujo16.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 16),
  'thumb',
  'legacy/dibujo16.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  17,
  (select id from public.rooms where slug = 'tradicion'),
  'El Catrín',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'tradicion',
  'retrato_legado',
  17,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 17),
  'original',
  'legacy/dibujo17.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 17),
  'web',
  'legacy/dibujo17.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 17),
  'thumb',
  'legacy/dibujo17.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  18,
  (select id from public.rooms where slug = 'retratos'),
  'La dama',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'retratos',
  'retrato_legado',
  18,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 18),
  'original',
  'legacy/dibujo18.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 18),
  'web',
  'legacy/dibujo18.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 18),
  'thumb',
  'legacy/dibujo18.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  19,
  (select id from public.rooms where slug = 'tradicion'),
  'Cómic',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'tradicion',
  'memorias_grafito',
  19,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 19),
  'original',
  'legacy/dibujo19.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 19),
  'web',
  'legacy/dibujo19.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 19),
  'thumb',
  'legacy/dibujo19.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  20,
  (select id from public.rooms where slug = 'tradicion'),
  'Virgen María',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'tradicion',
  'memorias_grafito',
  20,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 20),
  'original',
  'legacy/dibujo20.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 20),
  'web',
  'legacy/dibujo20.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 20),
  'thumb',
  'legacy/dibujo20.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  21,
  (select id from public.rooms where slug = 'retratos'),
  'Anne of Green Gables',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'retratos',
  'fantasia_luminosa',
  21,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 21),
  'original',
  'legacy/dibujo21.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 21),
  'web',
  'legacy/dibujo21.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 21),
  'thumb',
  'legacy/dibujo21.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  22,
  (select id from public.rooms where slug = 'tradicion'),
  '¡Donaaaa!',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'tradicion',
  'color_celebracion',
  22,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 22),
  'original',
  'legacy/dibujo22.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 22),
  'web',
  'legacy/dibujo22.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 22),
  'thumb',
  'legacy/dibujo22.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  23,
  (select id from public.rooms where slug = 'tradicion'),
  'Jesucristo',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'tradicion',
  'memorias_grafito',
  23,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 23),
  'original',
  'legacy/dibujo23.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 23),
  'web',
  'legacy/dibujo23.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 23),
  'thumb',
  'legacy/dibujo23.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  24,
  (select id from public.rooms where slug = 'pop'),
  'Los héroes también toman leche',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'pop',
  'memorias_grafito',
  24,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 24),
  'original',
  'legacy/dibujo24.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 24),
  'web',
  'legacy/dibujo24.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 24),
  'thumb',
  'legacy/dibujo24.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  25,
  (select id from public.rooms where slug = 'pop'),
  'Walt Disney',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'pop',
  'retrato_legado',
  25,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 25),
  'original',
  'legacy/dibujo25.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 25),
  'web',
  'legacy/dibujo25.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 25),
  'thumb',
  'legacy/dibujo25.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  26,
  (select id from public.rooms where slug = 'retratos'),
  'Dibujo de mi abuelita',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'retratos',
  'retrato_legado',
  26,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 26),
  'original',
  'legacy/dibujo26.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 26),
  'web',
  'legacy/dibujo26.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 26),
  'thumb',
  'legacy/dibujo26.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  27,
  (select id from public.rooms where slug = 'fantasia'),
  'Sueños de cuarentena',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'fantasia',
  'memorias_grafito',
  27,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 27),
  'original',
  'legacy/dibujo27.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 27),
  'web',
  'legacy/dibujo27.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 27),
  'thumb',
  'legacy/dibujo27.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  28,
  (select id from public.rooms where slug = 'fantasia'),
  'Dos granitos de arena',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'fantasia',
  'color_celebracion',
  28,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 28),
  'original',
  'legacy/dibujo28.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 28),
  'web',
  'legacy/dibujo28.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 28),
  'thumb',
  'legacy/dibujo28.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  29,
  (select id from public.rooms where slug = 'pop'),
  '¡Yodaaaaaa!',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'pop',
  'color_celebracion',
  29,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 29),
  'original',
  'legacy/dibujo29.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 29),
  'web',
  'legacy/dibujo29.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 29),
  'thumb',
  'legacy/dibujo29.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  30,
  (select id from public.rooms where slug = 'retratos'),
  '¡Mi perrita Cherry!',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'retratos',
  'memorias_grafito',
  30,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 30),
  'original',
  'legacy/dibujo30.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 30),
  'web',
  'legacy/dibujo30.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 30),
  'thumb',
  'legacy/dibujo30.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  31,
  (select id from public.rooms where slug = 'pop'),
  'Sheldon Cooper',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'pop',
  'fantasia_luminosa',
  31,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 31),
  'original',
  'legacy/dibujo31.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 31),
  'web',
  'legacy/dibujo31.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 31),
  'thumb',
  'legacy/dibujo31.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artworks (
  legacy_numeric_id, room_id, title, author, year, technique, description,
  theme_id, section_id, sort_order, is_published
)
values (
  32,
  (select id from public.rooms where slug = 'retratos'),
  'Mona Lisa',
  'Dinorah Isabella Domínguez Ruiz',
  'Sin fecha',
  'Grafito y color',
  'Parte de una colección personal creada con dedicación y amor.',
  'retratos',
  'retrato_legado',
  32,
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
    updated_at = now();

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 32),
  'original',
  'legacy/dibujo32.jpg'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 32),
  'web',
  'legacy/dibujo32.web.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;

insert into public.artwork_media (artwork_id, kind, storage_path)
values (
  (select id from public.artworks where legacy_numeric_id = 32),
  'thumb',
  'legacy/dibujo32.thumb.webp'
)
on conflict (artwork_id, kind) do update
set storage_path = excluded.storage_path;
commit;