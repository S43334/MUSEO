import * as THREE from 'three';

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    220
  );
  camera.position.set(0, 1.6, 8);
  return camera;
}
