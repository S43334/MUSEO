const artworkData = [
  { title: "Obra: Sebastian", file: "dibujo1.png" },
  { title: "Obra: La reina de los pájaros canta...", file: "dibujo2.jpg" },
  { title: "Obra: WANDAVISION 50’S", file: "dibujo3.jpg" },
  { title: "Obra: “I KNOW WHO I AM….” - Wanda Maximoff/ Scarlet Witch", file: "dibujo4.jpg" },
  { title: "Obra: \"El Gallo\"", file: "dibujo5.jpg" },
  { title: "Obra: PENDIENTE", file: "dibujo6.png" },
  { title: "Loki y Sylvie", file: "dibujo7.jpg" },
  { title: "Vision (Disfraz de Vision)", file: "dibujo8.jpg" },
  { title: "BATGIRL", file: "dibujo9.jpg" },
  { title: "Claus y Charlotte: La magia de la Navidad", file: "dibujo10.jpg" },
  { title: "Planeta de Pizza", file: "dibujo11.jpg" },
  { title: "Lizzie in the EMMYS", file: "dibujo12.jpg" },
  { title: "Flowers with girl’s Redhead", file: "dibujo13.jpg" },
  { title: "NASA", file: "dibujo14.jpg" },
  { title: "La sirena", file: "dibujo15.jpg" },
  { title: "El Paraguas", file: "dibujo16.jpg" },
  { title: "El Catrín", file: "dibujo17.jpg" },
  { title: "La dama", file: "dibujo18.jpg" },
  { title: "Cómic", file: "dibujo19.jpg" },
  { title: "Virgen Maria", file: "dibujo20.jpg" },
  { title: "Anne of green gables", file: "dibujo21.jpg" },
  { title: "¡Donaaaa!", file: "dibujo22.jpg" },
  { title: "Jesucristo", file: "dibujo23.jpg" },
  { title: "Los HEROES tambien toman LECHE", file: "dibujo24.jpg" },
  { title: "Walt Disney", file: "dibujo25.jpg" },
  { title: "Dibujo de mi abuelita", file: "dibujo26.jpg" },
  { title: "Sueños de Cuarentena", file: "dibujo27.jpg" },
  { title: "2 granitos de arena", file: "dibujo28.jpg" },
  { title: "¡Yodaaaaaa!", file: "dibujo29.jpg" },
  { title: "¡Mi perrita Cherry!", file: "dibujo30.jpg" },
  { title: "Sheldon Cooper", file: "dibujo31.jpg" },
  { title: "Mona Lisa", file: "dibujo32.jpg" }
];

export const paintings = [];

const authorName = "Dinorah Isabella Domínguez Ruiz";
const totalSpaces = 60;

for (let i = 0; i < totalSpaces; i++) {
  const id = i + 1;
  
  const isLeft = id % 2 !== 0;
  const x = isLeft ? -4.9 : 4.9;
  const z = -5 - (i * 2.5);
  const rotationY = isLeft ? Math.PI / 2 : -Math.PI / 2;

  let title = "Próximamente";
  let image = "textures/paintings/comingsoon.png";

  if (i < artworkData.length) {
    title = artworkData[i].title;
    image = `textures/paintings/${artworkData[i].file}`;
  } 

  paintings.push({
    id: id,
    title: title,
    author: authorName,
    image: image,
    position: { x, y: 1.8, z },
    rotationY: rotationY
  });
}