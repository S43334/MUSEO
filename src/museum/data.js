const AUTHOR_NAME = 'Dinorah Isabella Dom\u00ednguez Ruiz';

export const ROOMS = [
  {
    id: 'retratos',
    title: 'Retratos y personas queridas',
    themeIds: ['retratos'],
    color: 0x2d4a73
  },
  {
    id: 'fantasia',
    title: 'Fantas\u00eda y color',
    themeIds: ['fantasia'],
    color: 0x355f4a
  },
  {
    id: 'pop',
    title: 'Cultura pop y h\u00e9roes',
    themeIds: ['pop'],
    color: 0x6a3f56
  },
  {
    id: 'tradicion',
    title: 'Tradici\u00f3n, fe y estudio',
    themeIds: ['tradicion'],
    color: 0x6b5a32
  }
];

export const SECTION_DEFINITIONS = {
  memorias_grafito: {
    title: 'Memorias en grafito',
    color: 0xa9b7c9
  },
  retrato_legado: {
    title: 'Retrato y legado',
    color: 0xd7b98d
  },
  fantasia_luminosa: {
    title: 'Fantas\u00eda luminosa',
    color: 0x8ec5df
  },
  aventura_pop: {
    title: 'Aventura pop',
    color: 0x8f86dd
  },
  color_celebracion: {
    title: 'Color y celebraci\u00f3n',
    color: 0xf39fc3
  },
  noches_heroicas: {
    title: 'Noches heroicas',
    color: 0x5f5fc6
  }
};

export const SECTION_ORDER = [
  'memorias_grafito',
  'retrato_legado',
  'fantasia_luminosa',
  'aventura_pop',
  'color_celebracion',
  'noches_heroicas'
];

const SECTION_BY_ARTWORK_ID = {
  1: 'fantasia_luminosa',
  2: 'memorias_grafito',
  3: 'aventura_pop',
  4: 'noches_heroicas',
  5: 'retrato_legado',
  6: 'memorias_grafito',
  7: 'aventura_pop',
  8: 'noches_heroicas',
  9: 'aventura_pop',
  10: 'fantasia_luminosa',
  11: 'aventura_pop',
  12: 'retrato_legado',
  13: 'color_celebracion',
  14: 'aventura_pop',
  15: 'fantasia_luminosa',
  16: 'fantasia_luminosa',
  17: 'retrato_legado',
  18: 'retrato_legado',
  19: 'memorias_grafito',
  20: 'memorias_grafito',
  21: 'fantasia_luminosa',
  22: 'color_celebracion',
  23: 'memorias_grafito',
  24: 'memorias_grafito',
  25: 'retrato_legado',
  26: 'retrato_legado',
  27: 'memorias_grafito',
  28: 'color_celebracion',
  29: 'color_celebracion',
  30: 'memorias_grafito',
  31: 'fantasia_luminosa',
  32: 'retrato_legado'
};

const ARTWORK_BASE = [
  { id: 1, title: 'Sebasti\u00e1n', file: 'dibujo1.png', themeId: 'retratos' },
  { id: 2, title: 'La reina de los p\u00e1jaros canta...', file: 'dibujo2.jpg', themeId: 'fantasia' },
  { id: 3, title: 'WANDAVISION 50s', file: 'dibujo3.jpg', themeId: 'pop' },
  { id: 4, title: '"I KNOW WHO I AM..." - Wanda Maximoff / Scarlet Witch', file: 'dibujo4.jpg', themeId: 'pop' },
  { id: 5, title: 'El gallo', file: 'dibujo5.jpg', themeId: 'tradicion' },
  { id: 6, title: 'Pendiente', file: 'dibujo6.png', themeId: 'tradicion' },
  { id: 7, title: 'Loki y Sylvie', file: 'dibujo7.jpg', themeId: 'pop' },
  { id: 8, title: 'Vision (Disfraz de Vision)', file: 'dibujo8.jpg', themeId: 'pop' },
  { id: 9, title: 'Batgirl', file: 'dibujo9.jpg', themeId: 'pop' },
  { id: 10, title: 'Claus y Charlotte: la magia de la Navidad', file: 'dibujo10.jpg', themeId: 'retratos' },
  { id: 11, title: 'Planeta de pizza', file: 'dibujo11.jpg', themeId: 'fantasia' },
  { id: 12, title: 'Lizzie in the Emmys', file: 'dibujo12.jpg', themeId: 'retratos' },
  { id: 13, title: "Flowers with girl's Redhead", file: 'dibujo13.jpg', themeId: 'fantasia' },
  { id: 14, title: 'NASA', file: 'dibujo14.jpg', themeId: 'fantasia' },
  { id: 15, title: 'La sirena', file: 'dibujo15.jpg', themeId: 'fantasia' },
  { id: 16, title: 'El paraguas', file: 'dibujo16.jpg', themeId: 'fantasia' },
  { id: 17, title: 'El Catr\u00edn', file: 'dibujo17.jpg', themeId: 'tradicion' },
  { id: 18, title: 'La dama', file: 'dibujo18.jpg', themeId: 'retratos' },
  { id: 19, title: 'C\u00f3mic', file: 'dibujo19.jpg', themeId: 'tradicion' },
  { id: 20, title: 'Virgen Mar\u00eda', file: 'dibujo20.jpg', themeId: 'tradicion' },
  { id: 21, title: 'Anne of Green Gables', file: 'dibujo21.jpg', themeId: 'retratos' },
  { id: 22, title: '\u00a1Donaaaa!', file: 'dibujo22.jpg', themeId: 'tradicion' },
  { id: 23, title: 'Jesucristo', file: 'dibujo23.jpg', themeId: 'tradicion' },
  { id: 24, title: 'Los h\u00e9roes tambi\u00e9n toman leche', file: 'dibujo24.jpg', themeId: 'pop' },
  { id: 25, title: 'Walt Disney', file: 'dibujo25.jpg', themeId: 'pop' },
  { id: 26, title: 'Dibujo de mi abuelita', file: 'dibujo26.jpg', themeId: 'retratos' },
  { id: 27, title: 'Sue\u00f1os de cuarentena', file: 'dibujo27.jpg', themeId: 'fantasia' },
  { id: 28, title: 'Dos granitos de arena', file: 'dibujo28.jpg', themeId: 'fantasia' },
  { id: 29, title: '\u00a1Yodaaaaaa!', file: 'dibujo29.jpg', themeId: 'pop' },
  { id: 30, title: '\u00a1Mi perrita Cherry!', file: 'dibujo30.jpg', themeId: 'retratos' },
  { id: 31, title: 'Sheldon Cooper', file: 'dibujo31.jpg', themeId: 'pop' },
  { id: 32, title: 'Mona Lisa', file: 'dibujo32.jpg', themeId: 'retratos' }
];

export const ARTWORKS = ARTWORK_BASE.map((artwork) => {
  const sectionId = SECTION_BY_ARTWORK_ID[artwork.id] || 'memorias_grafito';
  const section = SECTION_DEFINITIONS[sectionId];

  return {
    ...artwork,
    author: AUTHOR_NAME,
    sectionId,
    sectionTitle: section.title,
    sectionColor: section.color,
    image: `textures/paintings/${artwork.file}`,
    year: 'Sin fecha',
    technique: 'Grafito y color',
    description: 'Parte de una colecci\u00f3n personal creada con dedicaci\u00f3n y amor.'
  };
});