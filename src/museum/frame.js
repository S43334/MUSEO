import * as THREE from 'three';

const sharedPaintingGeo = new THREE.PlaneGeometry(1.5, 2);
const sharedFrameGeo = new THREE.BoxGeometry(1.65, 2.15, 0.1);

export function createFramedPainting({ texture, woodTexture }) {
  const group = new THREE.Group();
  group.userData.isPainting = true;

  const paintingMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.4,
    side: THREE.FrontSide
  });
  
  const painting = new THREE.Mesh(sharedPaintingGeo, paintingMaterial);
  
  painting.position.z = 0.01;
  group.add(painting);

  const frameMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture, 
    roughness: 0.8,
    metalness: 0.1
  });

  const frameDepth = 0.1;

  const frame = new THREE.Mesh(sharedFrameGeo, frameMaterial);
  
  frame.userData.isFrame = true;
  frame.position.z = -frameDepth / 2 + 0.005; 
  group.add(frame);

  return group;
}