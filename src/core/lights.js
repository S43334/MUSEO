import * as THREE from 'three';

export function createLights(scene) {
  // 1. Luz Ambiente
  // La subimos un poco (0.6) para que las sombras no sean tan oscuras.
  const ambient = new THREE.AmbientLight(0xffffff, 0.6); 
  scene.add(ambient);

  // CONFIGURACIÓN DE DOBLE FILA (Para techo de 7m)
  const lightHeight = 6.8; // Pegadas al techo
  const rowOffset = 3.0;   // Separación del centro
  const spacing = 8;       // Distancia entre luces

  for (let z = 0; z >= -90; z -= spacing) {
    
    // --- ILUMINACIÓN POTENTE ---
    // Intensidad: 3.5 (Antes 2.5) -> Mucho más brillo y calidez.
    // Distancia: 25 (Antes 20) -> Para asegurar que bañe todo el suelo.
    
    // Fila Izquierda
    const leftBulb = new THREE.PointLight(0xffaa00, 3.5, 25);
    leftBulb.position.set(-rowOffset, lightHeight, z);
    scene.add(leftBulb);

    // Fila Derecha
    const rightBulb = new THREE.PointLight(0xffaa00, 3.5, 25);
    rightBulb.position.set(rowOffset, lightHeight, z);
    scene.add(rightBulb);

    // --- ESFERAS VISUALES ---
    // Hacemos que la bombilla brille casi blanca por la intensidad
    const bulbGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffddaa });
    
    const leftMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
    leftMesh.position.copy(leftBulb.position);
    scene.add(leftMesh);

    const rightMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
    rightMesh.position.copy(rightBulb.position);
    scene.add(rightMesh);
  }
}