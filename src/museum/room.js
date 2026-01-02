import * as THREE from 'three';

export function createRoom(scene) {
  const group = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  // Dimensiones del pasillo
  const width = 5;
  const height = 4;
  const depth = 90;

  // --- MATERIALES ---
  
  // 1. SUELO (Madera)
  const woodTexture = textureLoader.load('textures/wood.webp');
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(4, 30);
  woodTexture.colorSpace = THREE.SRGBColorSpace;
  
  const floorMaterial = new THREE.MeshStandardMaterial({ 
    map: woodTexture, 
    roughness: 0.8 
  });

  // 2. PAREDES
  // CAMBIO: Ahora carga la imagen 'gris.jpg' desde la carpeta 'textures/walls/'
  const wallTex = textureLoader.load('textures/walls/gris.jpg');
  wallTex.wrapS = THREE.RepeatWrapping;
  wallTex.wrapT = THREE.RepeatWrapping;
  
  // Ajusta la repetición si la textura se ve muy estirada o muy pequeña
  wallTex.repeat.set(4, 15); 
  wallTex.colorSpace = THREE.SRGBColorSpace;
  
  const wallMaterial = new THREE.MeshStandardMaterial({ 
      map: wallTex,       
      color: 0xffffff,    // Base blanca para que se vea el color real de la imagen
      roughness: 0.9 
  });

  // 3. TECHO
  const ceilingTex = textureLoader.load('textures/ceiling.jpg');
  ceilingTex.wrapS = THREE.RepeatWrapping;
  ceilingTex.wrapT = THREE.RepeatWrapping;
  ceilingTex.repeat.set(4, 30);
  ceilingTex.colorSpace = THREE.SRGBColorSpace;

  const ceilingMaterial = new THREE.MeshStandardMaterial({ 
      map: ceilingTex,
      color: 0xffffff,
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