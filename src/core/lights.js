import * as THREE from 'three';

export function createLights(scene) {
  // Luz ambiente base (necesaria por las paredes oscuras)
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  // Configuración del patrón "X"
  const roomHeight = 7;
  const bulbY = roomHeight - 0.5; // Pegadas al techo nuevo
  
  // Distancia del centro a las esquinas de la X (ancho de la X)
  const xSpread = 3.5; // Qué tan separadas están hacia las paredes
  const zSpread = 3.5; // Qué tan separadas están hacia adelante/atrás
  
  // Función auxiliar para crear bombillas
  function createBulb(x, y, z) {
    const bulb = new THREE.PointLight(0xffaa00, 1.0, 18); // Intensidad 1.0, Alcance 18m
    bulb.position.set(x, y, z);
    scene.add(bulb);
    
    // (Opcional) Una pequeña esfera brillante para ver de dónde sale la luz
    /*
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    );
    sphere.position.set(x, y, z);
    scene.add(sphere);
    */
  }

  // Bucle principal: Recorremos el pasillo y ponemos grupos de 5 luces
  // Paso de 16m para que no se saturen
  for (let centerZ = 0; centerZ >= -85; centerZ -= 16) {
    
    // 1. Centro de la X
    createBulb(0, bulbY, centerZ);

    // 2. Esquina Superior Izquierda
    createBulb(-xSpread, bulbY, centerZ - zSpread);

    // 3. Esquina Superior Derecha
    createBulb(xSpread, bulbY, centerZ - zSpread);

    // 4. Esquina Inferior Izquierda
    createBulb(-xSpread, bulbY, centerZ + zSpread);

    // 5. Esquina Inferior Derecha
    createBulb(xSpread, bulbY, centerZ + zSpread);
  }
}