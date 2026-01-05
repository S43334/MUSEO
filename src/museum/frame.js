import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
const woodTexture = textureLoader.load('textures/wood.webp');
woodTexture.colorSpace = THREE.SRGBColorSpace;

export function createFramedPainting({ texture, width = 1.5, height = 2 }) {
  const group = new THREE.Group();
  
  group.userData.isPainting = true;

  const paintingMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.4,
    side: THREE.FrontSide
  });
  const painting = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    paintingMaterial
  );

  painting.position.z = 0.01;

  group.add(painting);

  const frameMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.8,
    metalness: 0.1
  });

  const frameThickness = 0.15;
  const frameDepth = 0.1;

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width + frameThickness, height + frameThickness, frameDepth),
    frameMaterial
  );
  
  frame.userData.isFrame = true;

  frame.position.z = -frameDepth / 2 + 0.005; 
  group.add(frame);

  return group;
}