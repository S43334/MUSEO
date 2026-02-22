import * as THREE from 'three';

const FRAME_DEPTH = 0.1;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function computeFrameSizing(aspect) {
  const numericAspect = Number(aspect);
  const ratio = clamp(
    Number.isFinite(numericAspect) && numericAspect > 0 ? numericAspect : 0.75,
    0.56,
    1.78
  );

  const frameHeight = clamp(Math.sqrt(3.4 / ratio), 1.55, 2.22);
  const frameWidth = clamp(frameHeight * ratio, 1.10, 2.65);
  const paintingHeight = Math.max(0.5, frameHeight - 0.14);
  const paintingWidth = Math.max(0.5, frameWidth - 0.16);

  return {
    ratio,
    frameHeight,
    frameWidth,
    paintingHeight,
    paintingWidth
  };
}

function applyFrameSizing(group, sizing) {
  const refs = group?.userData?.frameRefs;
  if (!refs?.painting || !refs?.frame) {
    return false;
  }

  const nextPaintingGeometry = new THREE.PlaneGeometry(
    sizing.paintingWidth,
    sizing.paintingHeight
  );
  const nextFrameGeometry = new THREE.BoxGeometry(
    sizing.frameWidth,
    sizing.frameHeight,
    FRAME_DEPTH
  );

  if (refs.painting.geometry) {
    refs.painting.geometry.dispose();
  }
  if (refs.frame.geometry) {
    refs.frame.geometry.dispose();
  }

  refs.painting.geometry = nextPaintingGeometry;
  refs.frame.geometry = nextFrameGeometry;
  refs.painting.position.z = 0.01;
  refs.frame.position.z = -FRAME_DEPTH / 2 + 0.005;

  group.userData.frameSize = {
    width: sizing.frameWidth,
    height: sizing.frameHeight,
    paintingWidth: sizing.paintingWidth,
    paintingHeight: sizing.paintingHeight
  };
  group.userData.frameAspect = sizing.ratio;

  return true;
}

export function updateFramedPaintingAspect(group, aspect) {
  const sizing = computeFrameSizing(aspect);
  return applyFrameSizing(group, sizing);
}

export function createFramedPainting({ texture, woodTexture, aspect }) {
  const group = new THREE.Group();
  group.userData.isPainting = true;

  const paintingMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.4,
    side: THREE.DoubleSide
  });

  const painting = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), paintingMaterial);
  painting.userData.isPaintingSurface = true;
  painting.userData.paintingGroup = group;
  group.add(painting);

  const frameMaterial = new THREE.MeshStandardMaterial({
    map: woodTexture,
    roughness: 0.8,
    metalness: 0.1
  });

  const frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, FRAME_DEPTH), frameMaterial);
  frame.userData.isFrame = true;
  frame.userData.paintingGroup = group;
  group.add(frame);

  group.userData.frameRefs = {
    painting,
    frame
  };

  applyFrameSizing(group, computeFrameSizing(aspect));
  return group;
}
