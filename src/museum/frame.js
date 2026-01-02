import * as THREE from 'three';

export function createFramedPainting(texture, width, height) {
  const group = new THREE.Group();

  // 🎨 Material del cuadro (imagen)
  const paintingMaterial = new THREE.MeshStandardMaterial({
    map: texture
  });

  const painting = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    paintingMaterial
  );
  painting.position.z = 0.01;
  group.add(painting);

  // 🪵 Material del marco (AQUÍ estaba el error)
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x4b2e1e,
    roughness: 0.6,
    metalness: 0.1
  });

  const frameThickness = 0.12;
  const frameDepth = 0.08;

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(
      width + frameThickness,
      height + frameThickness,
      frameDepth
    ),
    frameMaterial
  );

  frame.userData.isFrame = true;
  group.add(frame);

  return group;
}
