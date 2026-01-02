import * as THREE from 'three';

export function createRoom(scene) {
  const group = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  // Dimensiones del pasillo
  const width = 5;
  const height = 4;
  const depth = 90;

  // --- MATERIALES ---
  
  // 1. SUELO (Mantenemos la madera, ¡queda genial con luz cálida!)
  const woodTexture = textureLoader.load('textures/wood.webp');
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(4, 30);
  woodTexture.colorSpace = THREE.SRGBColorSpace;
  
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    map: woodTexture, 
    roughness: 0.8,
    metalness: 0.1
  });

  // 2. PAREDES (Color Sólido)
  const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x440000,    
      roughness: 0.6,
      side: THREE.DoubleSide 
  });

  /* OTRAS OPCIONES (Si quieres probar, cambia el valor de 'color' arriba):
     - Gris Moderno: 0x333333
     - Rojo Vino (Dramático): 0x440000
     - Blanco Galería (Clásico): 0xeeeeee
  */

  // 3. TECHO (Color Sólido)
  // Lo ponemos oscuro para que no distraiga y oculte el "fin del mundo"
  const ceilingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xeeeeee,    // Casi negro
      side: THREE.DoubleSide
  });

  // --- GEOMETRÍAS ---

  // Suelo
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -depth / 2 + 2;
  group.add(floor);

  // Techo
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = height;
  ceiling.position.z = -depth / 2 + 2;
  group.add(ceiling);

  // Pared Izquierda
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMaterial);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-width / 2, height / 2, -depth / 2 + 2);
  group.add(leftWall);

  // Pared Derecha
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMaterial);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(width / 2, height / 2, -depth / 2 + 2);
  group.add(rightWall);

  scene.add(group);
}