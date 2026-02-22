import * as THREE from 'three';
import { createFramedPainting } from './frame.js';
import { createPlaque } from './plaque.js';

export function loadPaintings(scene, { placements, manager, woodTexture }) {
  const loader = new THREE.TextureLoader(manager);
  const instances = [];

  placements.forEach((artwork, index) => {
    const texture = loader.load(artwork.image);
    texture.colorSpace = THREE.SRGBColorSpace;

    const paintingGroup = createFramedPainting({
      texture,
      woodTexture
    });

    if (artwork.title) {
      const plaque = createPlaque({
        title: artwork.title,
        author: artwork.author || 'Artista'
      });

      plaque.position.y = -1.4;
      plaque.position.z = 0.06;
      plaque.rotation.x = -Math.PI / 12;
      paintingGroup.add(plaque);
    }

    paintingGroup.position.set(artwork.position.x, artwork.position.y, artwork.position.z);
    if (typeof artwork.rotationY === 'number') {
      paintingGroup.rotation.y = artwork.rotationY;
    }

    paintingGroup.userData.artwork = artwork;
    paintingGroup.userData.placementIndex = index;

    scene.add(paintingGroup);
    instances.push({ artwork, group: paintingGroup });
  });

  return instances;
}
