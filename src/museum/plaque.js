import * as THREE from 'three';

export function createPlaque({ title, author }) {
  const canvas = document.createElement('canvas');
  // CAMBIO: Duplicamos resolución (antes 512x256) -> Ahora 1024x512
  // Esto hace que las letras se vean súper nítidas.
  canvas.width = 1024;
  canvas.height = 512;

  const ctx = canvas.getContext('2d');

  // Fondo
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Título (Ajustamos el tamaño de la fuente para el nuevo canvas)
  ctx.fillStyle = '#111';
  ctx.font = 'bold 90px Arial'; // Antes 48px
  ctx.textAlign = 'center';
  ctx.fillText(title, canvas.width / 2, 180); // Ajustamos posición Y

  // Autor
  ctx.fillStyle = '#444';
  ctx.font = '60px Arial'; // Antes 32px
  ctx.fillText(author, canvas.width / 2, 300); // Ajustamos posición Y

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  
  // TRUCO PRO: Esto mejora la legibilidad cuando ves la placa de lado
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