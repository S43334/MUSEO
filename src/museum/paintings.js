import * as THREE from 'three';
import { paintings } from './data.js';
import { createFramedPainting } from './frame.js';

export function loadPaintings(scene) {
  const loader = new THREE.TextureLoader();

  paintings.forEach(p => {
    const texture = loader.load(p.image);
    texture.colorSpace = THREE.SRGBColorSpace;

    const painting = createFramedPainting({
      texture,
      title: p.title,
      author: p.author
    });

    painting.position.set(
      p.position.x,
      p.position.y,
      p.position.z
    );

    scene.add(painting);
  });
}
