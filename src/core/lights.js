import * as THREE from 'three';

export function createLights(scene) {
  // CAMBIO 1: Subimos la intensidad de 0.4 a 0.7
  // Esto compensa que las paredes oscuras reflejan menos luz.
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  // Fila de bombillas en el techo
  for (let z = 0; z >= -90; z -= 8) {
    // CAMBIO 2: Aumentamos la distancia de 12 a 15 para que la luz bañe mejor las paredes
    const bulb = new THREE.PointLight(0xffaa00, 1.5, 15);
    bulb.position.set(0, 3.8, z); 
    scene.add(bulb);
  }
}