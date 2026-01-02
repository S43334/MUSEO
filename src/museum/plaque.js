import * as THREE from 'three';

export function createPlaque({ title, author }) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;

  const ctx = canvas.getContext('2d');

  // Fondo
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Título
  ctx.fillStyle = '#111';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, canvas.width / 2, 90);

  // Autor
  ctx.fillStyle = '#444';
  ctx.font = '32px Arial';
  ctx.fillText(author, canvas.width / 2, 150);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.4,
    metalness: 0.1
  });

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.4),
    material
  );

  return mesh;
}
