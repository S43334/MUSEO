const AUTHOR_NAME = 'Dinorah Isabella Dominguez Ruiz';

export const ROOMS = [
  {
    id: 'retratos',
    title: 'Retratos y Personas Queridas',
    themeIds: ['retratos'],
    color: 0x2d4a73,
    capacity: 10,
    startZ: 8
  },
  {
    id: 'fantasia',
    title: 'Fantasia y Color',
    themeIds: ['fantasia'],
    color: 0x355f4a,
    capacity: 10,
    startZ: -22
  },
  {
    id: 'pop',
    title: 'Cultura Pop y Heroes',
    themeIds: ['pop'],
    color: 0x6a3f56,
    capacity: 10,
    startZ: -52
  },
  {
    id: 'tradicion',
    title: 'Tradicion, Fe y Estudio',
    themeIds: ['tradicion'],
    color: 0x6b5a32,
    capacity: 10,
    startZ: -82
  }
];

export const ARTWORKS = [
  { id: 1, title: 'Sebastian', file: 'dibujo1.png', themeId: 'retratos' },
  { id: 2, title: 'La reina de los pajaros canta...', file: 'dibujo2.jpg', themeId: 'fantasia' },
  { id: 3, title: 'WANDAVISION 50s', file: 'dibujo3.jpg', themeId: 'pop' },
  { id: 4, title: '"I KNOW WHO I AM..." - Wanda Maximoff / Scarlet Witch', file: 'dibujo4.jpg', themeId: 'pop' },
  { id: 5, title: 'El Gallo', file: 'dibujo5.jpg', themeId: 'tradicion' },
  { id: 6, title: 'Pendiente', file: 'dibujo6.png', themeId: 'tradicion' },
  { id: 7, title: 'Loki y Sylvie', file: 'dibujo7.jpg', themeId: 'pop' },
  { id: 8, title: 'Vision (Disfraz de Vision)', file: 'dibujo8.jpg', themeId: 'pop' },
  { id: 9, title: 'Batgirl', file: 'dibujo9.jpg', themeId: 'pop' },
  { id: 10, title: 'Claus y Charlotte: La magia de la Navidad', file: 'dibujo10.jpg', themeId: 'retratos' },
  { id: 11, title: 'Planeta de Pizza', file: 'dibujo11.jpg', themeId: 'fantasia' },
  { id: 12, title: 'Lizzie in the Emmys', file: 'dibujo12.jpg', themeId: 'retratos' },
  { id: 13, title: "Flowers with girl's Redhead", file: 'dibujo13.jpg', themeId: 'fantasia' },
  { id: 14, title: 'NASA', file: 'dibujo14.jpg', themeId: 'fantasia' },
  { id: 15, title: 'La sirena', file: 'dibujo15.jpg', themeId: 'fantasia' },
  { id: 16, title: 'El Paraguas', file: 'dibujo16.jpg', themeId: 'fantasia' },
  { id: 17, title: 'El Catrin', file: 'dibujo17.jpg', themeId: 'tradicion' },
  { id: 18, title: 'La dama', file: 'dibujo18.jpg', themeId: 'retratos' },
  { id: 19, title: 'Comic', file: 'dibujo19.jpg', themeId: 'tradicion' },
  { id: 20, title: 'Virgen Maria', file: 'dibujo20.jpg', themeId: 'tradicion' },
  { id: 21, title: 'Anne of Green Gables', file: 'dibujo21.jpg', themeId: 'retratos' },
  { id: 22, title: 'Donaaaa!', file: 'dibujo22.jpg', themeId: 'tradicion' },
  { id: 23, title: 'Jesucristo', file: 'dibujo23.jpg', themeId: 'tradicion' },
  { id: 24, title: 'Los heroes tambien toman leche', file: 'dibujo24.jpg', themeId: 'pop' },
  { id: 25, title: 'Walt Disney', file: 'dibujo25.jpg', themeId: 'pop' },
  { id: 26, title: 'Dibujo de mi abuelita', file: 'dibujo26.jpg', themeId: 'retratos' },
  { id: 27, title: 'Suenos de Cuarentena', file: 'dibujo27.jpg', themeId: 'fantasia' },
  { id: 28, title: '2 granitos de arena', file: 'dibujo28.jpg', themeId: 'fantasia' },
  { id: 29, title: 'Yodaaaaaa!', file: 'dibujo29.jpg', themeId: 'pop' },
  { id: 30, title: 'Mi perrita Cherry!', file: 'dibujo30.jpg', themeId: 'retratos' },
  { id: 31, title: 'Sheldon Cooper', file: 'dibujo31.jpg', themeId: 'pop' },
  { id: 32, title: 'Mona Lisa', file: 'dibujo32.jpg', themeId: 'retratos' }
].map((artwork) => ({
  ...artwork,
  author: AUTHOR_NAME,
  image: `textures/paintings/${artwork.file}`,
  year: 'Sin fecha',
  technique: 'Grafito y color',
  description: 'Parte de una coleccion personal creada con dedicacion y amor.'
}));
