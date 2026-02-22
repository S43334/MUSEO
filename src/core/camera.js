import * as THREE from 'three';

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    62,
    window.innerWidth / window.innerHeight,
    0.05,
    260
  );
  camera.position.set(0, 1.6, 0.8);
  return camera;
}
