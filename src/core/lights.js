import * as THREE from 'three';

export function createLights(scene) {
  // Luz ambiente suave
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  // Spot tipo museo
  const spot = new THREE.SpotLight(0xffffff, 1.2);
  spot.position.set(0, 3, 1);

  spot.angle = Math.PI / 8;
  spot.penumbra = 0.4;
  spot.decay = 2;
  spot.distance = 6;

  // target del foco
  spot.target.position.set(0, 1.6, -4.9);

  scene.add(spot);
  scene.add(spot.target);
}
