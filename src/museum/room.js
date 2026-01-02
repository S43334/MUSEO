import * as THREE from 'three';

export function createRoom(scene) {
  const room = new THREE.Group();

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });

  // Suelo
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    floorMat
  );
  floor.rotation.x = -Math.PI / 2;
  room.add(floor);

  // Pared trasera
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 3),
    wallMat
  );
  backWall.position.set(0, 1.5, -5);
  room.add(backWall);

  scene.add(room);
}
