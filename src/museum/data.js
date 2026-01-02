export const paintings = [
  // --- PARED IZQUIERDA ---
  {
    id: 1,
    title: "El Comienzo",
    author: "Tu Amiga",
    image: "textures/paintings/dibujo1.png",
    position: { x: -2.4, y: 1.8, z: -5 },
    rotationY: Math.PI / 2 // Girado 90 grados para mirar al pasillo
  },
  {
    id: 2,
    title: "Inspiración",
    author: "Tu Amiga",
    image: "textures/paintings/dibujo1.png", // Repetimos imagen por ahora
    position: { x: -2.4, y: 1.8, z: -10 },
    rotationY: Math.PI / 2
  },
  {
    id: 3,
    title: "Boceto #3",
    author: "Tu Amiga",
    image: "textures/paintings/dibujo1.png",
    position: { x: -2.4, y: 1.8, z: -15 },
    rotationY: Math.PI / 2
  },

  // --- PARED DERECHA ---
  {
    id: 4,
    title: "Retrato",
    author: "Tu Amiga",
    image: "textures/paintings/dibujo1.png",
    position: { x: 2.4, y: 1.8, z: -7.5 }, // Intercalado
    rotationY: -Math.PI / 2 // Girado -90 grados
  },
  {
    id: 5,
    title: "Paisaje",
    author: "Tu Amiga",
    image: "textures/paintings/dibujo1.png",
    position: { x: 2.4, y: 1.8, z: -12.5 },
    rotationY: -Math.PI / 2
  }
];