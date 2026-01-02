import * as THREE from 'three';

export function createLights(scene) {
  // Luz general suave
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  // Bombillas cada 8 metros
  for (let z = 0; z > -35; z -= 8) {
    const bulb = new THREE.PointLight(0xffaa00, 1.2, 12);
    bulb.position.set(0, 3.5, z);
    scene.add(bulb);
  }
}