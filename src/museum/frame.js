import * as THREE from 'three';
import { createPlaque } from './plaque.js';

export function createFramedPainting({
  texture,
  title,
  author,
  width = 1.4,
  height = 1.4,
  frameThickness = 0.08,
  frameDepth = 0.1
}) {
  const group = new THREE.Group();

  // 🖼️ Obra
  const canvas = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true
    })
  );
  canvas.position.z = frameDepth / 2 + 0.001;
  group.add(canvas);

  // 🪵 Marco
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

  // 🏷️ Placa
  const plaque = createPlaque({ title, author });
  plaque.position.set(0, -height / 2 - 0.35, frameDepth / 2);
  group.add(plaque);

  return group;
}
