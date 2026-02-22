const AUTHOR_NAME = 'Dinorah Isabella Domínguez Ruiz';

export const ROOMS = [
  {
    id: 'retratos',
    title: 'Retratos y personas queridas',
    themeIds: ['retratos'],
    color: 0x2d4a73
  },
  {
    id: 'fantasia',
    title: 'Fantasía y color',
    themeIds: ['fantasia'],
    color: 0x355f4a
  },
  {
    id: 'pop',
    title: 'Cultura pop y héroes',
    themeIds: ['pop'],
    color: 0x6a3f56
  },
  {
    id: 'tradicion',
    title: 'Tradición, fe y estudio',
    themeIds: ['tradicion'],
    color: 0x6b5a32
  }
];

export const ARTWORKS = [
  { id: 1, title: 'Sebastián', file: 'dibujo1.png', themeId: 'retratos' },
  { id: 2, title: 'La reina de los pájaros canta...', file: 'dibujo2.jpg', themeId: 'fantasia' },
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
  { id: 17, title: 'El Catrín', file: 'dibujo17.jpg', themeId: 'tradicion' },
  { id: 18, title: 'La dama', file: 'dibujo18.jpg', themeId: 'retratos' },
  { id: 19, title: 'Cómic', file: 'dibujo19.jpg', themeId: 'tradicion' },
  { id: 20, title: 'Virgen María', file: 'dibujo20.jpg', themeId: 'tradicion' },
  { id: 21, title: 'Anne of Green Gables', file: 'dibujo21.jpg', themeId: 'retratos' },
  { id: 22, title: '¡Donaaaa!', file: 'dibujo22.jpg', themeId: 'tradicion' },
  { id: 23, title: 'Jesucristo', file: 'dibujo23.jpg', themeId: 'tradicion' },
  { id: 24, title: 'Los héroes también toman leche', file: 'dibujo24.jpg', themeId: 'pop' },
  { id: 25, title: 'Walt Disney', file: 'dibujo25.jpg', themeId: 'pop' },
  { id: 26, title: 'Dibujo de mi abuelita', file: 'dibujo26.jpg', themeId: 'retratos' },
  { id: 27, title: 'Sueños de cuarentena', file: 'dibujo27.jpg', themeId: 'fantasia' },
  { id: 28, title: 'Dos granitos de arena', file: 'dibujo28.jpg', themeId: 'fantasia' },
  { id: 29, title: '¡Yodaaaaaa!', file: 'dibujo29.jpg', themeId: 'pop' },
  { id: 30, title: '¡Mi perrita Cherry!', file: 'dibujo30.jpg', themeId: 'retratos' },
  { id: 31, title: 'Sheldon Cooper', file: 'dibujo31.jpg', themeId: 'pop' },
  { id: 32, title: 'Mona Lisa', file: 'dibujo32.jpg', themeId: 'retratos' }
].map((artwork) => ({
  ...artwork,
  author: AUTHOR_NAME,
  image: `textures/paintings/${artwork.file}`,
  year: 'Sin fecha',
  technique: 'Grafito y color',
  description: 'Parte de una colección personal creada con dedicación y amor.'
}));
