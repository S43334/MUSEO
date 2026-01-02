import * as THREE from 'three';

export function createLights(scene) {
  // Luz ambiente suave
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  // Fila de bombillas en el techo
  // El pasillo mide 90m de largo, así que extendemos el bucle hasta -90
  // para cubrir hasta la última pared.
  for (let z = 0; z >= -90; z -= 8) {
    const bulb = new THREE.PointLight(0xffaa00, 1.5, 12);
    bulb.position.set(0, 3.8, z); // Pegadas al techo
    scene.add(bulb);
  }
}