import * as THREE from 'three';

function toVecXZ(value) {
  return new THREE.Vector3(value.x, 0, value.z);
}

function yawFromNormal(normal) {
  return Math.atan2(normal.x, normal.z);
}

function createRoomSign(title) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(8, 12, 18, 0.94)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

  ctx.fillStyle = '#f4f4f4';
  ctx.font = 'bold 64px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, canvas.width / 2, 112);

  ctx.fillStyle = '#d3d3d3';
  ctx.font = '32px Arial';
  ctx.fillText('Colección Isabella', canvas.width / 2, 188);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return new THREE.Mesh(
    new THREE.PlaneGeometry(4.8, 1.2),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  );
}

function addPortalFrame(group, wing, config, material) {
  const axis = toVecXZ(wing.axis);
  const right = toVecXZ(wing.right);
  const entranceCenter = axis.clone().multiplyScalar((config.lobbySize / 2) + 0.2);
  const clearWidth = wing.width - 1.2;
  const columnHeight = config.height - 0.2;

  const columnGeometry = new THREE.BoxGeometry(0.22, columnHeight, 0.24);
  const beamGeometry = new THREE.BoxGeometry(clearWidth, 0.22, 0.26);

  const leftColumn = new THREE.Mesh(columnGeometry, material);
  leftColumn.position.copy(entranceCenter).add(right.clone().multiplyScalar(-(clearWidth / 2)));
  leftColumn.position.y = columnHeight / 2;
  group.add(leftColumn);

  const rightColumn = new THREE.Mesh(columnGeometry, material);
  rightColumn.position.copy(entranceCenter).add(right.clone().multiplyScalar(clearWidth / 2));
  rightColumn.position.y = columnHeight / 2;
  group.add(rightColumn);

  const topBeam = new THREE.Mesh(beamGeometry, material);
  topBeam.position.copy(entranceCenter);
  topBeam.position.y = config.height - 0.22;
  topBeam.rotation.y = yawFromNormal(right);
  group.add(topBeam);
}

function addWingEnvelope(group, wing, config, wallMaterial) {
  const axis = toVecXZ(wing.axis);
  const right = toVecXZ(wing.right);
  const center = toVecXZ(wing.center);
  const halfWidth = wing.width / 2;
  const halfLength = wing.length / 2;
  const wallHeight = config.height;

  const sideWallGeometry = new THREE.PlaneGeometry(wing.length, wallHeight);

  const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
  leftWall.position.copy(center).add(right.clone().multiplyScalar(-halfWidth));
  leftWall.position.y = wallHeight / 2;
  leftWall.rotation.y = yawFromNormal(right);
  group.add(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
  rightWall.position.copy(center).add(right.clone().multiplyScalar(halfWidth));
  rightWall.position.y = wallHeight / 2;
  rightWall.rotation.y = yawFromNormal(right.clone().multiplyScalar(-1));
  group.add(rightWall);

  const endWall = new THREE.Mesh(new THREE.PlaneGeometry(wing.width, wallHeight), wallMaterial);
  endWall.position.copy(center).add(axis.clone().multiplyScalar(halfLength));
  endWall.position.y = wallHeight / 2;
  endWall.rotation.y = yawFromNormal(axis.clone().multiplyScalar(-1));
  group.add(endWall);
}

function addWingAccents(group, wing, config) {
  const axis = toVecXZ(wing.axis);
  const center = toVecXZ(wing.center);
  const accentColor = new THREE.Color(wing.color);

  const floorAccent = new THREE.Mesh(
    new THREE.PlaneGeometry(wing.width - 0.2, wing.length - 0.2),
    new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.8,
      metalness: 0.04,
      transparent: true,
      opacity: 0.09
    })
  );
  floorAccent.rotation.x = -Math.PI / 2;
  floorAccent.position.copy(center);
  floorAccent.position.y = 0.01;
  group.add(floorAccent);

  const sign = createRoomSign(wing.roomTitle);
  sign.position.copy(axis.clone().multiplyScalar((config.lobbySize / 2) + 1.85));
  sign.position.y = config.height - 1.05;
  sign.rotation.y = yawFromNormal(axis.clone().multiplyScalar(-1));
  group.add(sign);
}

function addLobbyCornerWalls(group, config, wings, wallMaterial) {
  const lobbyHalf = config.lobbySize / 2;
  const maxWingWidth = wings.reduce((acc, wing) => Math.max(acc, wing.width), 0);
  const portalHalf = Math.min((maxWingWidth / 2) + 0.2, lobbyHalf - 0.9);
  const segmentLength = Math.max(0.5, lobbyHalf - portalHalf);
  const segmentGeo = new THREE.PlaneGeometry(segmentLength, config.height);
  const cornerGeo = new THREE.BoxGeometry(0.22, config.height, 0.22);

  const northLeft = new THREE.Mesh(segmentGeo, wallMaterial);
  northLeft.position.set(-(portalHalf + (segmentLength / 2)), config.height / 2, -lobbyHalf);
  group.add(northLeft);

  const northRight = new THREE.Mesh(segmentGeo, wallMaterial);
  northRight.position.set(portalHalf + (segmentLength / 2), config.height / 2, -lobbyHalf);
  group.add(northRight);

  const southLeft = new THREE.Mesh(segmentGeo, wallMaterial);
  southLeft.rotation.y = Math.PI;
  southLeft.position.set(-(portalHalf + (segmentLength / 2)), config.height / 2, lobbyHalf);
  group.add(southLeft);

  const southRight = new THREE.Mesh(segmentGeo, wallMaterial);
  southRight.rotation.y = Math.PI;
  southRight.position.set(portalHalf + (segmentLength / 2), config.height / 2, lobbyHalf);
  group.add(southRight);

  const westTop = new THREE.Mesh(segmentGeo, wallMaterial);
  westTop.rotation.y = Math.PI / 2;
  westTop.position.set(-lobbyHalf, config.height / 2, -(portalHalf + (segmentLength / 2)));
  group.add(westTop);

  const westBottom = new THREE.Mesh(segmentGeo, wallMaterial);
  westBottom.rotation.y = Math.PI / 2;
  westBottom.position.set(-lobbyHalf, config.height / 2, portalHalf + (segmentLength / 2));
  group.add(westBottom);

  const eastTop = new THREE.Mesh(segmentGeo, wallMaterial);
  eastTop.rotation.y = -Math.PI / 2;
  eastTop.position.set(lobbyHalf, config.height / 2, -(portalHalf + (segmentLength / 2)));
  group.add(eastTop);

  const eastBottom = new THREE.Mesh(segmentGeo, wallMaterial);
  eastBottom.rotation.y = -Math.PI / 2;
  eastBottom.position.set(lobbyHalf, config.height / 2, portalHalf + (segmentLength / 2));
  group.add(eastBottom);

  const corners = [
    { x: -lobbyHalf, z: -lobbyHalf },
    { x: lobbyHalf, z: -lobbyHalf },
    { x: -lobbyHalf, z: lobbyHalf },
    { x: lobbyHalf, z: lobbyHalf }
  ];

  for (const corner of corners) {
    const cornerPillar = new THREE.Mesh(cornerGeo, wallMaterial);
    cornerPillar.position.set(corner.x, config.height / 2, corner.z);
    group.add(cornerPillar);
  }
}

function createSectionBadge(text, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 170;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(6, 10, 18, 0.9)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.fillStyle = '#f4f4f4';
  ctx.font = 'bold 44px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 0.72),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      color: colorHex
    })
  );
}

function addPaintingNiches(group, placements, wings, config) {
  const wingMap = new Map(wings.map((wing) => [wing.id, wing]));
  const dividerMaterial = new THREE.MeshStandardMaterial({
    color: 0x131a2e,
    roughness: 0.58,
    metalness: 0.12
  });

  for (const placement of placements) {
    const wing = wingMap.get(placement.wingId);
    if (!wing) {
      continue;
    }

    const axis = toVecXZ(placement.axis);
    const right = toVecXZ(placement.right);
    const nicheCenter = toVecXZ(placement.nicheCenter);
    const sideSign = placement.side === 'left' ? -1 : 1;
    const wallOffset = right.clone().multiplyScalar(sideSign * ((wing.width / 2) - 0.03));
    const inwardNormal = right.clone().multiplyScalar(-sideSign);
    const nicheWidth = placement.nicheLength * 0.78;
    const yaw = yawFromNormal(inwardNormal);
    const sectionColor = placement.sectionColor || wing.color;

    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(nicheWidth, 3.25),
      new THREE.MeshStandardMaterial({
        color: sectionColor,
        roughness: 0.62,
        metalness: 0.08,
        transparent: true,
        opacity: 0.24
      })
    );
    panel.position.copy(nicheCenter).add(wallOffset).add(inwardNormal.clone().multiplyScalar(0.03));
    panel.position.y = 2.12;
    panel.rotation.y = yaw;
    group.add(panel);

    const dividerGeometry = new THREE.BoxGeometry(0.16, config.height - 0.25, 0.34);
    const edgeOffset = (placement.nicheLength / 2) - 0.08;
    for (const edgeSign of [-1, 1]) {
      const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
      divider.position
        .copy(nicheCenter)
        .add(axis.clone().multiplyScalar(edgeSign * edgeOffset))
        .add(wallOffset)
        .add(inwardNormal.clone().multiplyScalar(0.14));
      divider.position.y = (config.height - 0.25) / 2;
      divider.rotation.y = yaw;
      group.add(divider);
    }

    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(nicheWidth, 0.12, 0.44),
      dividerMaterial
    );
    canopy.position.copy(nicheCenter).add(wallOffset).add(inwardNormal.clone().multiplyScalar(0.2));
    canopy.position.y = 3.45;
    canopy.rotation.y = yaw;
    group.add(canopy);

    if (placement.isSectionStart) {
      const sectionLabel = createSectionBadge(placement.sectionTitle || 'Sección', sectionColor);
      const markerPos = nicheCenter.clone().add(axis.clone().multiplyScalar(-0.5));
      sectionLabel.position.set(markerPos.x, 3.0, markerPos.z);
      sectionLabel.rotation.y = yawFromNormal(axis.clone().multiplyScalar(-1));
      group.add(sectionLabel);
    }
  }
}

export function createRoom(scene, woodTexture, layout) {
  const { config, bounds, zones, wings, placements } = layout;
  const group = new THREE.Group();
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;

  const floorTexture = woodTexture.clone();
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(width / 2.2, depth / 2.2);
  floorTexture.colorSpace = THREE.SRGBColorSpace;
  floorTexture.needsUpdate = true;

  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.84,
    metalness: 0.08
  });
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0x060910,
    roughness: 1
  });
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x0e1a31,
    roughness: 0.86,
    metalness: 0.06
  });
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a395c,
    roughness: 0.5,
    metalness: 0.15
  });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(centerX, 0, centerZ);
  floor.receiveShadow = true;
  group.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(centerX, config.height, centerZ);
  group.add(ceiling);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, config.height), wallMaterial);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(bounds.minX, config.height / 2, centerZ);
  group.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, config.height), wallMaterial);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(bounds.maxX, config.height / 2, centerZ);
  group.add(rightWall);

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(width, config.height), wallMaterial);
  backWall.rotation.y = Math.PI;
  backWall.position.set(centerX, config.height / 2, bounds.maxZ);
  group.add(backWall);

  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(width, config.height), wallMaterial);
  frontWall.position.set(centerX, config.height / 2, bounds.minZ);
  group.add(frontWall);

  const lobbyAccent = new THREE.Mesh(
    new THREE.PlaneGeometry(zones.lobby.size - 1.2, zones.lobby.size - 1.2),
    new THREE.MeshStandardMaterial({
      color: 0xf4b241,
      roughness: 0.6,
      metalness: 0.08,
      transparent: true,
      opacity: 0.12
    })
  );
  lobbyAccent.rotation.x = -Math.PI / 2;
  lobbyAccent.position.set(0, 0.02, 0);
  group.add(lobbyAccent);

  const lobbyFrame = new THREE.Mesh(
    new THREE.RingGeometry((zones.lobby.size / 2) - 0.5, (zones.lobby.size / 2) - 0.15, 4),
    new THREE.MeshStandardMaterial({
      color: 0xf4b241,
      roughness: 0.52,
      metalness: 0.12,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    })
  );
  lobbyFrame.rotation.x = -Math.PI / 2;
  lobbyFrame.rotation.z = Math.PI / 4;
  lobbyFrame.position.set(0, 0.03, 0);
  group.add(lobbyFrame);

  addLobbyCornerWalls(group, config, wings, wallMaterial);

  for (const wing of wings) {
    addWingEnvelope(group, wing, config, wallMaterial);
    addWingAccents(group, wing, config);
    addPortalFrame(group, wing, config, frameMaterial);
  }

  addPaintingNiches(group, placements, wings, config);

  scene.add(group);
}
