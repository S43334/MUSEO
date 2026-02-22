import * as THREE from 'three';

function createRoomSign(title, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(6, 10, 18, 0.9)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

  ctx.fillStyle = '#f5f5f5';
  ctx.font = 'bold 64px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 10);

  ctx.fillStyle = '#cfcfcf';
  ctx.font = '30px Arial';
  ctx.fillText('Coleccion Isabella', canvas.width / 2, canvas.height / 2 + 58);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true
  });

  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.05), material);
  sign.userData.isRoomSign = true;
  sign.userData.baseColor = colorHex;
  return sign;
}

function addDivider(group, width, height, z, color) {
  const dividerMaterial = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.45,
    metalness: 0.15
  });

  const pillarGeometry = new THREE.BoxGeometry(0.2, height - 0.3, 0.2);
  const beamGeometry = new THREE.BoxGeometry(width - 0.4, 0.2, 0.2);

  const leftPillar = new THREE.Mesh(pillarGeometry, dividerMaterial);
  leftPillar.position.set(-(width / 2) + 0.14, (height - 0.3) / 2, z);
  group.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeometry, dividerMaterial);
  rightPillar.position.set((width / 2) - 0.14, (height - 0.3) / 2, z);
  group.add(rightPillar);

  const beam = new THREE.Mesh(beamGeometry, dividerMaterial);
  beam.position.set(0, height - 0.22, z);
  group.add(beam);
}

export function createRoom(scene, woodTexture, layout) {
  const { rooms, bounds, config } = layout;
  const group = new THREE.Group();

  const width = config.width;
  const height = config.height;
  const depth = bounds.maxZ - bounds.minZ;
  const centerZ = (bounds.maxZ + bounds.minZ) / 2;

  const floorTexture = woodTexture.clone();
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(width / 1.8, depth / 3.2);
  floorTexture.colorSpace = THREE.SRGBColorSpace;
  floorTexture.needsUpdate = true;

  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.82,
    metalness: 0.08
  });

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f1a2e,
    roughness: 0.82,
    metalness: 0.05
  });

  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0x080b14,
    roughness: 1.0
  });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = centerZ;
  floor.receiveShadow = true;
  group.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = height;
  ceiling.position.z = centerZ;
  group.add(ceiling);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMaterial);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-(width / 2), height / 2, centerZ);
  group.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMaterial);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(width / 2, height / 2, centerZ);
  group.add(rightWall);

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMaterial);
  backWall.rotation.y = Math.PI;
  backWall.position.set(0, height / 2, bounds.maxZ);
  group.add(backWall);

  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMaterial);
  frontWall.position.set(0, height / 2, bounds.minZ);
  group.add(frontWall);

  for (const room of rooms) {
    const segmentDepth = room.frontZ - room.backZ;
    const segmentCenterZ = (room.frontZ + room.backZ) / 2;
    const segmentColor = new THREE.Color(room.color);

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: segmentColor,
      transparent: true,
      opacity: 0.16,
      roughness: 0.7,
      metalness: 0.08
    });

    const panelHeight = height - 0.5;
    const panelGeometry = new THREE.PlaneGeometry(segmentDepth, panelHeight);

    const leftAccent = new THREE.Mesh(panelGeometry, accentMaterial);
    leftAccent.rotation.y = Math.PI / 2;
    leftAccent.position.set(-(width / 2) + 0.025, panelHeight / 2, segmentCenterZ);
    group.add(leftAccent);

    const rightAccent = new THREE.Mesh(panelGeometry, accentMaterial);
    rightAccent.rotation.y = -Math.PI / 2;
    rightAccent.position.set((width / 2) - 0.025, panelHeight / 2, segmentCenterZ);
    group.add(rightAccent);

    addDivider(group, width, height, room.frontZ - 1.2, segmentColor);

    const sign = createRoomSign(room.title, room.color);
    sign.position.set(0, height - 1.05, room.frontZ - 2);
    group.add(sign);
  }

  scene.add(group);
}
