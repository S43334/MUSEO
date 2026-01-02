import * as THREE from 'three';

export function createRoom(scene) {
  const group = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  // Dimensiones
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
  const floorMaterial = new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.8 });

  // 2. PAREDES (Ej. Hormigón/Concreto)
  // ¡Asegúrate de tener un archivo 'wall.jpg' en tu carpeta textures!
  // Si no tienes imagen, usa: const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
  const wallTex = textureLoader.load('textures/wall.jpg', (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 15); // Ajusta según tu imagen
      tex.colorSpace = THREE.SRGBColorSpace;
  }, undefined, () => {
      console.warn("Falta textures/wall.jpg, usando color gris");
  });
  
  const wallMaterial = new THREE.MeshStandardMaterial({ 
      map: wallTex.image ? wallTex : null, 
      color: wallTex.image ? 0xffffff : 0x808080, // Gris si falla la carga
      roughness: 0.9 
  });

  // 3. TECHO (Ej. Yeso/Plaster)
  const ceilingTex = textureLoader.load('textures/ceiling.jpg', (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 30);
      tex.colorSpace = THREE.SRGBColorSpace;
  }, undefined, () => {
       console.warn("Falta textures/ceiling.jpg");
  });

  const ceilingMaterial = new THREE.MeshStandardMaterial({ 
      map: ceilingTex.image ? ceilingTex : null,
      color: ceilingTex.image ? 0xffffff : 0xdddddd,
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