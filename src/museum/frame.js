import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
// Cargamos la textura de madera para el marco
const woodTexture = textureLoader.load('textures/wood.webp');
woodTexture.colorSpace = THREE.SRGBColorSpace;

export function createFramedPainting({ texture, width = 1.5, height = 2 }) {
  const group = new THREE.Group();

  // 1. EL DIBUJO
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
  // Giramos el dibujo 180° porque en Three.js los planos nacen mirando "atrás"
  painting.rotation.y = Math.PI; 
  group.add(painting);

  // 2. EL MARCO (Con textura de madera)
  const frameMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture, // <--- Aquí usamos la textura
    roughness: 0.8,
    metalness: 0.1
  });

  const frameThickness = 0.15;
  const frameDepth = 0.1;

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width + frameThickness, height + frameThickness, frameDepth),
    frameMaterial
  );
  // Empujamos el marco un poquito atrás para que encaje con el dibujo
  frame.position.z = -frameDepth / 2 + 0.005; 
  group.add(frame);

  return group;
}