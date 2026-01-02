import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
// Cargamos la madera (asegúrate de que wood.webp esté en la carpeta textures)
const woodTexture = textureLoader.load('textures/wood.webp');
woodTexture.wrapS = THREE.RepeatWrapping;
woodTexture.wrapT = THREE.RepeatWrapping;
woodTexture.repeat.set(1, 1);
woodTexture.colorSpace = THREE.SRGBColorSpace;

export function createFramedPainting(width = 1.5, height = 2, paintingTexture) {
  const group = new THREE.Group();

  // 1. EL DIBUJO
  const paintingMaterial = new THREE.MeshStandardMaterial({
    map: paintingTexture,
    roughness: 0.4,
    side: THREE.FrontSide
  });
  const painting = new THREE.Mesh(new THREE.PlaneGeometry(width, height), paintingMaterial);
  painting.position.z = 0.01;
  painting.rotation.y = Math.PI; // Importante para que mire al frente correcto
  group.add(painting);

  // 2. EL MARCO DE MADERA
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
  frame.position.z = -frameDepth / 2 + 0.005; 
  group.add(frame);

  return group;
}