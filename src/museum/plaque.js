import * as THREE from 'three';

export function createPlaque({ title, author }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const fontSize = 80;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = '#111';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  function getLines(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  const lines = getLines(ctx, title, 900);
  
  let yPos = 180 - ((lines.length - 1) * (fontSize * 0.5));

  lines.forEach((line) => {
    ctx.fillText(line, canvas.width / 2, yPos);
    yPos += fontSize + 10;
  });

  ctx.fillStyle = '#444';
  ctx.font = '50px Arial';
  ctx.fillText(author, canvas.width / 2, 400); 

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