import * as THREE from 'three';

export function createRoom(scene, woodTexture) {
  const group = new THREE.Group();

  const width = 10;
  const height = 7;
  const depth = 170;
  const zOffset = 5; 

  const floorTexture = woodTexture.clone();
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(width / 1.5, depth / 3);
  floorTexture.colorSpace = THREE.SRGBColorSpace;
  floorTexture.needsUpdate = true; 

  const floorMaterial = new THREE.MeshStandardMaterial({ 
    map: floorTexture, 
    roughness: 0.8,
    metalness: 0.1
  });

  const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x001133,
      roughness: 0.7
  });

  const ceilingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x000000,    
      roughness: 1.0
  });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -depth / 2 + zOffset;
  floor.receiveShadow = true;
  group.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = height;
  ceiling.position.z = -depth / 2 + zOffset;
  group.add(ceiling);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMaterial);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-width / 2, height / 2, -depth / 2 + zOffset);
  leftWall.receiveShadow = true;
  group.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMaterial);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(width / 2, height / 2, -depth / 2 + zOffset);
  rightWall.receiveShadow = true;
  group.add(rightWall);

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMaterial);
  backWall.rotation.y = Math.PI;
  backWall.position.set(0, height / 2, zOffset);
  backWall.receiveShadow = true;
  group.add(backWall);

  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMaterial);
  frontWall.position.set(0, height / 2, zOffset - depth); 
  frontWall.receiveShadow = true;
  group.add(frontWall);

  scene.add(group);
}