import * as THREE from 'three';
import { paintings } from './data.js';
import { createFramedPainting } from './frame.js';
import { createPlaque } from './plaque.js';

export function loadPaintings(scene) {
  const loader = new THREE.TextureLoader();

  paintings.forEach((data) => {
    // 1. Cargar textura
    const texture = loader.load(data.image);
    texture.colorSpace = THREE.SRGBColorSpace;

    // 2. Crear cuadro con marco
    const paintingGroup = createFramedPainting({ 
        texture: texture, 
        width: 1.5, 
        height: 2 
    });

    // 3. Crear placa de información (Título/Autor)
    if (data.title) {
      const plaque = createPlaque({ 
        title: data.title, 
        author: data.author || "Artista" 
      });
      plaque.position.y = -1.4; // Debajo del cuadro
      plaque.position.z = 0.06;
      // Ajuste visual para que se lea bien
      plaque.rotation.y = Math.PI; 
      plaque.rotation.x = -Math.PI / 12; // Un poco inclinada hacia arriba
      paintingGroup.add(plaque);
    }

    // 4. Posicionar y Rotar en el pasillo
    paintingGroup.position.set(data.position.x, data.position.y, data.position.z);
    
    if (data.rotationY) {
      paintingGroup.rotation.y = data.rotationY;
    }

    scene.add(paintingGroup);
  });
}