import * as THREE from 'three';

const sharedPlaqueGeo = new THREE.PlaneGeometry(1.2, 0.4);

export function createPlaque({ title, author }) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const fontSize = 40;
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

  const lines = getLines(ctx, title, 450);
  
  let yPos = 90 - ((lines.length - 1) * (fontSize * 0.5));

  lines.forEach((line) => {
    ctx.fillText(line, canvas.width / 2, yPos);
    yPos += fontSize + 5;
  });

  ctx.fillStyle = '#444';
  ctx.font = '25px Arial';
  ctx.fillText(author, canvas.width / 2, 200); 

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.4,
    metalness: 0.1
  });

  const mesh = new THREE.Mesh(sharedPlaqueGeo, material);

  return mesh;
}