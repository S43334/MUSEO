import * as THREE from 'three';

export function createLights(scene) {
  // Luz ambiente suave
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  // Fila de bombillas en el techo
  // Empezamos en z=0 y vamos hacia atrás hasta z=-90
  for (let z = 0; z > -90; z -= 8) {
    const bulb = new THREE.PointLight(0xffaa00, 1.5, 12);
    bulb.position.set(0, 3.8, z); // Pegadas al techo
    scene.add(bulb);
  }
}