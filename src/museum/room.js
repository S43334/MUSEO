import * as THREE from 'three';

export function createRoom(scene) {
  const group = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  // Dimensiones del pasillo
  const width = 5;
  const height = 4;
  const depth = 90; // 90 metros de largo

  // --- MATERIALES ---
  
  // Suelo de madera
  const woodTexture = textureLoader.load('textures/wood.webp');
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  // Repetimos la textura para que cubra todo el suelo
  woodTexture.repeat.set(4, 30);
  woodTexture.colorSpace = THREE.SRGBColorSpace;
  
  const floorMaterial = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.8 });
  
  // Paredes grises (Neutro para museo)
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide });

  // --- GEOMETRÍAS ---

  // 1. Suelo
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -depth / 2 + 2; // Ajuste para empezar cerca del origen
  group.add(floor);

  // 2. Techo
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), wallMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = height;
  ceiling.position.z = -depth / 2 + 2;
  group.add(ceiling);

  // 3. Pared Izquierda
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMaterial);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-width / 2, height / 2, -depth / 2 + 2);
  group.add(leftWall);

  // 4. Pared Derecha
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMaterial);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(width / 2, height / 2, -depth / 2 + 2);
  group.add(rightWall);

  // Agregamos todo el cuarto a la escena
  scene.add(group);
}