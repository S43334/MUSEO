import * as THREE from 'three';

export function createRoom(scene) {
  const group = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  // CAMBIOS:
  const width = 10;   // Ancho del pasillo (mantenemos los 10m)
  const height = 7;   // NUEVO: Techo mucho más alto (antes 4)
  const depth = 90;   // Largo

  const zOffset = 5; 

  // --- MATERIALES ---
  
  // 1. SUELO
  const woodTexture = textureLoader.load('textures/wood.webp');
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(width / 1.5, depth / 3);
  woodTexture.colorSpace = THREE.SRGBColorSpace;
  
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    map: woodTexture, 
    roughness: 0.8,
    metalness: 0.1
  });

  // 2. PAREDES (Azul Medianoche)
  const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x001133,
      roughness: 0.7,
      side: THREE.DoubleSide 
  });

  // 3. TECHO (Negro Mate)
  const ceilingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x000000,    
      roughness: 1.0,
      side: THREE.DoubleSide
  });

  // --- GEOMETRÍAS ---

  // Suelo
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -depth / 2 + zOffset;
  floor.receiveShadow = true;
  group.add(floor);

  // Techo
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = height;
  ceiling.position.z = -depth / 2 + zOffset;
  group.add(ceiling);

  // Pared Izquierda
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMaterial);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-width / 2, height / 2, -depth / 2 + zOffset);
  leftWall.receiveShadow = true;
  group.add(leftWall);

  // Pared Derecha
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMaterial);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(width / 2, height / 2, -depth / 2 + zOffset);
  rightWall.receiveShadow = true;
  group.add(rightWall);

  // Pared Trasera
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMaterial);
  backWall.rotation.y = Math.PI;
  backWall.position.set(0, height / 2, zOffset);
  backWall.receiveShadow = true;
  group.add(backWall);

  // Pared Frontal
  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMaterial);
  frontWall.position.set(0, height / 2, zOffset - depth); 
  frontWall.receiveShadow = true;
  group.add(frontWall);

  scene.add(group);
}