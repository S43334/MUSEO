import * as THREE from 'three';

export function createRoom(scene) {
  const group = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  // Dimensiones del pasillo
  const width = 5;
  const height = 4;
  const depth = 90;

  // Ajuste de posición: Empezamos en Z=5 para que la cámara (en Z=4) quede DENTRO.
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
  floor.position.z = -depth / 2 + zOffset; // Ajuste Z
  floor.receiveShadow = true;
  group.add(floor);

  // Techo
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = height;
  ceiling.position.z = -depth / 2 + zOffset; // Ajuste Z
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

  // --- PAREDES NUEVAS (Cierre del pasillo) ---

  // Pared Trasera (Detrás de donde inicias)
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMaterial);
  backWall.rotation.y = Math.PI; // Mirando hacia el pasillo
  backWall.position.set(0, height / 2, zOffset); // En el inicio (Z=5)
  backWall.receiveShadow = true;
  group.add(backWall);

  // Pared Frontal (Al final del pasillo)
  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMaterial);
  // Posición: Z inicial (5) - Largo (90) = -85
  frontWall.position.set(0, height / 2, zOffset - depth); 
  frontWall.receiveShadow = true;
  group.add(frontWall);

  scene.add(group);
}