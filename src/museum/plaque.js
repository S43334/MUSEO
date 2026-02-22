import * as THREE from 'three';

const sharedPlaqueFaceGeo = new THREE.PlaneGeometry(1.16, 0.36);
const sharedPlaqueBaseGeo = new THREE.BoxGeometry(1.24, 0.44, 0.04);
const sharedPinGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.01, 12);

function truncateToWidth(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }

  const ellipsis = '...';
  let clipped = text;
  while (clipped.length > 1 && ctx.measureText(`${clipped}${ellipsis}`).width > maxWidth) {
    clipped = clipped.slice(0, -1);
  }

  return `${clipped}${ellipsis}`;
}

function getLines(ctx, text, maxWidth, maxLines = 2) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return ['Sin titulo'];
  }

  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${currentLine} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    lines.push(currentLine);
    currentLine = words[i];

    if (lines.length === maxLines - 1) {
      break;
    }
  }

  lines.push(currentLine);

  if (lines.length > maxLines) {
    lines.length = maxLines;
  }

  const lastIndex = lines.length - 1;
  lines[lastIndex] = truncateToWidth(ctx, lines[lastIndex], maxWidth);
  return lines;
}

export function createPlaque({ title, author }) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 256;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new THREE.Group();
  }

  const margin = 22;
  const contentX = margin;
  const contentY = margin;
  const contentWidth = canvas.width - (margin * 2);
  const contentHeight = canvas.height - (margin * 2);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#efe3ca');
  gradient.addColorStop(0.45, '#e7d9bc');
  gradient.addColorStop(1, '#d7c5a2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(contentX, contentY, contentWidth, 26);

  ctx.strokeStyle = '#5f4a2f';
  ctx.lineWidth = 4;
  ctx.strokeRect(contentX, contentY, contentWidth, contentHeight);

  ctx.strokeStyle = '#b7945f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(contentX + 9, contentY + 9, contentWidth - 18, contentHeight - 18);

  const titleFontSize = 52;
  ctx.font = `700 ${titleFontSize}px Georgia, "Times New Roman", serif`;
  ctx.fillStyle = '#2b2012';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = getLines(ctx, title || 'Sin titulo', contentWidth - 74, 2);
  let yPos = 94 - ((lines.length - 1) * (titleFontSize * 0.44));

  lines.forEach((line) => {
    ctx.fillText(line, canvas.width / 2, yPos);
    yPos += titleFontSize + 6;
  });

  ctx.strokeStyle = '#9a7a4a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(contentX + 80, 170);
  ctx.lineTo(canvas.width - (contentX + 80), 170);
  ctx.stroke();

  ctx.fillStyle = '#5a4730';
  ctx.font = '600 28px "Trebuchet MS", "Segoe UI", Arial, sans-serif';
  const safeAuthor = truncateToWidth(ctx, author || 'Artista', contentWidth - 96);
  ctx.fillText(safeAuthor, canvas.width / 2, 204);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 6;

  const faceMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.58,
    metalness: 0.06
  });
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d2e1f,
    roughness: 0.46,
    metalness: 0.34,
    emissive: 0x0d0703,
    emissiveIntensity: 0.18
  });
  const pinMaterial = new THREE.MeshStandardMaterial({
    color: 0xb0894e,
    roughness: 0.34,
    metalness: 0.66
  });

  const plaqueGroup = new THREE.Group();

  const base = new THREE.Mesh(sharedPlaqueBaseGeo, baseMaterial);
  plaqueGroup.add(base);

  const face = new THREE.Mesh(sharedPlaqueFaceGeo, faceMaterial);
  face.position.z = 0.0215;
  plaqueGroup.add(face);

  const pinPositions = [
    [-0.53, 0.145],
    [0.53, 0.145],
    [-0.53, -0.145],
    [0.53, -0.145]
  ];

  for (const [x, y] of pinPositions) {
    const pin = new THREE.Mesh(sharedPinGeo, pinMaterial);
    pin.position.set(x, y, 0.022);
    pin.rotation.x = Math.PI / 2;
    plaqueGroup.add(pin);
  }

  return plaqueGroup;
}
