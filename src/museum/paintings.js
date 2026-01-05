import * as THREE from 'three';
import { paintings } from './data.js';
import { createFramedPainting } from './frame.js';
import { createPlaque } from './plaque.js';

export function loadPaintings(scene) {
  const loader = new THREE.TextureLoader();

  paintings.forEach((data) => {
    const texture = loader.load(data.image);
    texture.colorSpace = THREE.SRGBColorSpace;

    const paintingGroup = createFramedPainting({ 
        texture: texture, 
        width: 1.5, 
        height: 2 
    });

    if (data.title) {
      const plaque = createPlaque({ 
        title: data.title, 
        author: data.author || "Artista" 
      });
      
      plaque.position.y = -1.4; 
      plaque.position.z = 0.06; 
      
      plaque.rotation.x = -Math.PI / 12; 
      
      paintingGroup.add(plaque);
    }

    paintingGroup.position.set(data.position.x, data.position.y, data.position.z);
    
    if (data.rotationY) {
      paintingGroup.rotation.y = data.rotationY;
    }

    scene.add(paintingGroup);
  });
}