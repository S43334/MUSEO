import * as THREE from 'three';

export function createPlaque({ title, author }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#111';
  ctx.font = 'bold 90px Arial'; 
  ctx.textAlign = 'center';
  ctx.fillText(title, canvas.width / 2, 180);

  ctx.fillStyle = '#444';
  ctx.font = '60px Arial'; 
  ctx.fillText(author, canvas.width / 2, 300); 

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  
  texture.anisotropy = 16; 

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