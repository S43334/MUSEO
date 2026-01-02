import * as THREE from 'three';

export function createLights(scene) {
  // 1. Luz Ambiente: La mantenemos moderada (0.5)
  // Si la subimos mucho, "lava" el color naranja. Queremos contraste.
  const ambient = new THREE.AmbientLight(0xffffff, 0.5); 
  scene.add(ambient);

  // CONFIGURACIÓN DE DOBLE FILA
  // El pasillo mide 10m de ancho (paredes en -5 y 5).
  // Ponemos las luces en -3 y 3 para que estén cerca de los cuadros.
  const lightHeight = 5.5; // Un poco más bajas para que la luz pegue fuerte en los cuadros
  const rowOffset = 3.0;   
  const spacing = 8;       // Cada 8 metros (más seguidas = más luz continua)

  for (let z = 0; z >= -90; z -= spacing) {
    
    // --- PARAMETROS DE "CALIDEZ" ---
    // Color: 0xffaa00 (Naranja Ámbar profundo)
    // Intensidad: 2.5 (Alta potencia para que resalte)
    // Distancia: 18 (Alcance suficiente para tocar el suelo)
    
    // Fila Izquierda
    const leftBulb = new THREE.PointLight(0xffaa00, 2.5, 18);
    leftBulb.position.set(-rowOffset, lightHeight, z);
    scene.add(leftBulb);

    // Fila Derecha
    const rightBulb = new THREE.PointLight(0xffaa00, 2.5, 18);
    rightBulb.position.set(rowOffset, lightHeight, z);
    scene.add(rightBulb);

    // --- EFECTO VISUAL DE "BOMBILLA" ---
    // Creamos una esfera brillante en el mismo lugar de la luz.
    // Esto hace que se vea el foco físico brillando.
    const bulbGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc88 }); // Núcleo casi blanco/naranja
    
    const leftMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
    leftMesh.position.copy(leftBulb.position);
    scene.add(leftMesh);

    const rightMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
    rightMesh.position.copy(rightBulb.position);
    scene.add(rightMesh);
  }
}