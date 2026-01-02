import * as THREE from 'three';
import { paintingsData } from './data.js';
import { createFramedPainting } from './frame.js';
import { createPlaque } from './plaque.js';

export function loadPaintings(scene) {
  const loader = new THREE.TextureLoader();

  paintingsData.forEach((data) => {
    const texture = loader.load(data.imageUrl);
    texture.colorSpace = THREE.SRGBColorSpace;

    // Crear cuadro + marco
    const paintingGroup = createFramedPainting(1.5, 2, texture);

    // Crear placa
    if (data.title) {
      const plaque = createPlaque({ 
        title: data.title, 
        author: data.author || "Artista" 
      });
      plaque.position.y = -1.4; 
      plaque.position.z = 0.06;
      paintingGroup.add(plaque);
    }

    // Posición y Rotación
    paintingGroup.position.set(data.position.x, data.position.y, data.position.z);
    if (data.rotationY) {
      paintingGroup.rotation.y = data.rotationY;
    }

    scene.add(paintingGroup);
  });
}