import * as THREE from 'three';
import { getCorridorHalf, getPortalHalf } from './layout.js';

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
  ctx.fillText('Colecci\u00f3n Isabella', canvas.width / 2, 188);

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
  const corridorHalf = getCorridorHalf(config, wing.width);
  const clearWidth = Math.min(wing.width - 0.6, (corridorHalf * 2) + 0.18);
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
  const right = toVecXZ(wing.right);
  const center = toVecXZ(wing.center);
  const accentColor = new THREE.Color(wing.color);

  const floorAccent = new THREE.Mesh(
    new THREE.PlaneGeometry(wing.width - 0.2, wing.length - 0.2),
    new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.84,
      metalness: 0.05,
      transparent: true,
      opacity: 0.08
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

  const cableMaterial = new THREE.MeshStandardMaterial({
    color: 0x8f7748,
    roughness: 0.44,
    metalness: 0.46
  });
  const cableTopY = config.height - 0.12;
  const cableBottomY = sign.position.y + 0.52;
  const cableLength = Math.max(0.18, cableTopY - cableBottomY);
  const cableGeometry = new THREE.CylinderGeometry(0.01, 0.01, cableLength, 8);
  const cableOffset = 1.86;
  for (const side of [-1, 1]) {
    const cable = new THREE.Mesh(cableGeometry, cableMaterial);
    cable.position.copy(sign.position).add(right.clone().multiplyScalar(cableOffset * side));
    cable.position.y = cableBottomY + (cableLength / 2);
    group.add(cable);
  }
}

function addPrivateChamberEnvelope(group, chamber, config, wallMaterial) {
  const center = toVecXZ(chamber.center);
  const halfWidth = chamber.width / 2;
  const halfLength = chamber.length / 2;
  const wallHeight = config.height;

  const sideWallGeometry = new THREE.PlaneGeometry(chamber.length, wallHeight);
  const frontBackGeometry = new THREE.PlaneGeometry(chamber.width, wallHeight);

  const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
  leftWall.position.copy(center).add(new THREE.Vector3(-halfWidth, wallHeight / 2, 0));
  leftWall.rotation.y = Math.PI / 2;
  group.add(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
  rightWall.position.copy(center).add(new THREE.Vector3(halfWidth, wallHeight / 2, 0));
  rightWall.rotation.y = -Math.PI / 2;
  group.add(rightWall);

  const entryWall = new THREE.Mesh(frontBackGeometry, wallMaterial);
  entryWall.position.copy(center).add(new THREE.Vector3(0, wallHeight / 2, halfLength));
  entryWall.rotation.y = Math.PI;
  group.add(entryWall);

  const backWall = new THREE.Mesh(frontBackGeometry, wallMaterial);
  backWall.position.copy(center).add(new THREE.Vector3(0, wallHeight / 2, -halfLength));
  group.add(backWall);

  const chamberFloorAccent = new THREE.Mesh(
    new THREE.PlaneGeometry(chamber.width - 0.4, chamber.length - 0.4),
    new THREE.MeshStandardMaterial({
      color: 0xdbb16a,
      roughness: 0.72,
      metalness: 0.08,
      transparent: true,
      opacity: 0.08
    })
  );
  chamberFloorAccent.rotation.x = -Math.PI / 2;
  chamberFloorAccent.position.copy(center);
  chamberFloorAccent.position.y = 0.015;
  group.add(chamberFloorAccent);

  const sign = createRoomSign(chamber.roomTitle || 'Secreto');
  sign.position.copy(center).add(new THREE.Vector3(0, wallHeight - 1.02, halfLength - 0.08));
  sign.rotation.y = Math.PI;
  group.add(sign);
}

function addLobbyCornerWalls(group, config, wings, wallMaterial) {
  const lobbyHalf = config.lobbySize / 2;
  const maxWingWidth = wings.reduce((acc, wing) => Math.max(acc, wing.width), 0);
  const portalHalf = getPortalHalf(config, maxWingWidth);
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

function createLobbyEmblemTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  const half = canvas.width / 2;
  const radial = ctx.createRadialGradient(half, half, 40, half, half, half);
  radial.addColorStop(0, 'rgba(252, 215, 140, 0.9)');
  radial.addColorStop(0.45, 'rgba(191, 138, 63, 0.35)');
  radial.addColorStop(1, 'rgba(18, 24, 40, 0.04)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.translate(half, half);
  ctx.strokeStyle = 'rgba(35, 17, 6, 0.65)';
  ctx.lineWidth = 5;
  for (let index = 0; index < 24; index += 1) {
    ctx.rotate((Math.PI * 2) / 24);
    ctx.beginPath();
    ctx.moveTo(72, 0);
    ctx.lineTo(430, 0);
    ctx.stroke();
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(half, half);
  const rings = [140, 245, 345, 430];
  for (const radius of rings) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(246, 211, 147, 0.75)';
    ctx.lineWidth = radius > 360 ? 8 : 5;
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(33, 15, 6, 0.82)';
  ctx.beginPath();
  ctx.arc(0, 0, 84, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function addLobbyShowpiece(group, config, zones) {
  const lobbySize = zones?.lobby?.size || config.lobbySize;
  const lobbyRadius = lobbySize / 2;

  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x3f3427,
    roughness: 0.68,
    metalness: 0.1
  });
  const polishedStoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x5b4a36,
    roughness: 0.38,
    metalness: 0.18
  });
  const brassMaterial = new THREE.MeshStandardMaterial({
    color: 0xd2a256,
    roughness: 0.28,
    metalness: 0.56,
    emissive: 0x241103,
    emissiveIntensity: 0.22
  });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xb5d6ff,
    roughness: 0.06,
    metalness: 0.08,
    transmission: 0.82,
    transparent: true,
    opacity: 0.7,
    ior: 1.2,
    thickness: 0.4
  });

  const emblemTexture = createLobbyEmblemTexture();
  const emblemMaterial = new THREE.MeshStandardMaterial({
    color: 0xc89e5a,
    map: emblemTexture || null,
    roughness: 0.46,
    metalness: 0.22,
    transparent: true,
    opacity: 0.84
  });
  const emblem = new THREE.Mesh(
    new THREE.CircleGeometry(lobbyRadius - 1.34, 80),
    emblemMaterial
  );
  emblem.rotation.x = -Math.PI / 2;
  emblem.position.y = 0.027;
  group.add(emblem);

  const borderRing = new THREE.Mesh(
    new THREE.TorusGeometry(lobbyRadius - 1.18, 0.06, 16, 96),
    brassMaterial
  );
  borderRing.rotation.x = Math.PI / 2;
  borderRing.position.y = 0.052;
  group.add(borderRing);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.15, 0.04, 12, 84),
    brassMaterial
  );
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = 0.056;
  group.add(innerRing);

  for (let index = 0; index < 12; index += 1) {
    const ray = new THREE.Mesh(
      new THREE.BoxGeometry(lobbyRadius - 2.45, 0.022, 0.08),
      brassMaterial
    );
    const angle = (index / 12) * Math.PI * 2;
    ray.position.set(
      Math.cos(angle) * ((lobbyRadius - 2.45) / 2),
      0.043,
      Math.sin(angle) * ((lobbyRadius - 2.45) / 2)
    );
    ray.rotation.y = angle;
    group.add(ray);
  }

  const dais = new THREE.Mesh(
    new THREE.CylinderGeometry(1.82, 1.96, 0.24, 44),
    stoneMaterial
  );
  dais.position.y = 0.12;
  group.add(dais);

  const daisLip = new THREE.Mesh(
    new THREE.TorusGeometry(1.9, 0.055, 14, 72),
    brassMaterial
  );
  daisLip.rotation.x = Math.PI / 2;
  daisLip.position.y = 0.235;
  group.add(daisLip);

  const pedestalBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.96, 1.06, 0.42, 30),
    polishedStoneMaterial
  );
  pedestalBase.position.y = 0.43;
  group.add(pedestalBase);

  const pedestalBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.58, 1.18, 30),
    stoneMaterial
  );
  pedestalBody.position.y = 1.2;
  group.add(pedestalBody);

  const pedestalCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.74, 0.12, 30),
    polishedStoneMaterial
  );
  pedestalCap.position.y = 1.84;
  group.add(pedestalCap);

  const sculpture = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.42, 1),
    glassMaterial
  );
  sculpture.position.y = 2.27;
  sculpture.rotation.set(0.48, 0.22, 0.36);
  group.add(sculpture);

  const haloOuter = new THREE.Mesh(
    new THREE.TorusGeometry(0.84, 0.03, 12, 58),
    brassMaterial
  );
  haloOuter.position.y = 2.29;
  haloOuter.rotation.x = Math.PI / 2;
  group.add(haloOuter);

  const haloTilted = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.024, 12, 54),
    brassMaterial
  );
  haloTilted.position.y = 2.22;
  haloTilted.rotation.set(Math.PI / 3.5, Math.PI / 5, 0);
  group.add(haloTilted);

  const haloSupportGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.44, 8);
  for (let index = 0; index < 3; index += 1) {
    const angle = (index / 3) * Math.PI * 2;
    const support = new THREE.Mesh(haloSupportGeometry, brassMaterial);
    support.position.set(
      Math.cos(angle) * 0.34,
      2.07,
      Math.sin(angle) * 0.34
    );
    group.add(support);
  }

  const canopyDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(2.25, 2.42, 0.1, 48),
    polishedStoneMaterial
  );
  canopyDisc.position.y = config.height - 0.06;
  group.add(canopyDisc);

  const canopyRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.32, 0.05, 12, 88),
    brassMaterial
  );
  canopyRing.rotation.x = Math.PI / 2;
  canopyRing.position.y = config.height - 0.12;
  group.add(canopyRing);

  const chandelierStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 1.08, 12),
    brassMaterial
  );
  chandelierStem.position.y = config.height - 0.62;
  group.add(chandelierStem);

  const chandelierMainRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.045, 12, 78),
    brassMaterial
  );
  chandelierMainRing.rotation.x = Math.PI / 2;
  chandelierMainRing.position.y = config.height - 1.21;
  group.add(chandelierMainRing);

  const chandelierInnerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.58, 0.03, 12, 62),
    brassMaterial
  );
  chandelierInnerRing.rotation.x = Math.PI / 2;
  chandelierInnerRing.position.y = config.height - 1.38;
  group.add(chandelierInnerRing);

  const pendantMaterial = new THREE.MeshStandardMaterial({
    color: 0xffdea9,
    roughness: 0.18,
    metalness: 0.3,
    emissive: 0xa06419,
    emissiveIntensity: 0.26
  });

  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2;
    const radius = index % 2 === 0 ? 0.92 : 0.58;
    const pendant = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 12),
      pendantMaterial
    );
    pendant.position.set(
      Math.cos(angle) * radius,
      config.height - 1.31 - ((index % 3) * 0.06),
      Math.sin(angle) * radius
    );
    group.add(pendant);
  }
}

function addPaintingNiches(group, placements, wings, config) {
  const wingMap = new Map(wings.map((wing) => [wing.id, wing]));
  const dividerMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d2d4a,
    roughness: 0.58,
    metalness: 0.16
  });
  const nicheBackMaterial = new THREE.MeshStandardMaterial({
    color: 0x132846,
    roughness: 0.62,
    metalness: 0.08
  });
  const nicheInsetMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d1f3a,
    roughness: 0.56,
    metalness: 0.06
  });
  const trimMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a5478,
    roughness: 0.38,
    metalness: 0.32
  });
  const brassMaterial = new THREE.MeshStandardMaterial({
    color: 0xc69141,
    roughness: 0.42,
    metalness: 0.58,
    emissive: 0x2a1705,
    emissiveIntensity: 0.2
  });
  const lampLensMaterial = new THREE.MeshStandardMaterial({
    color: 0xf3d5a4,
    roughness: 0.18,
    metalness: 0.08,
    emissive: 0xae6f22,
    emissiveIntensity: 0.28,
    side: THREE.DoubleSide
  });

  const dividerGeometry = new THREE.BoxGeometry(0.13, config.height - 0.5, 0.14);
  const backPanelGeometry = new THREE.BoxGeometry(2.34, 3.0, 0.08);
  const insetPanelGeometry = new THREE.BoxGeometry(1.96, 2.58, 0.04);
  const sideTrimGeometry = new THREE.BoxGeometry(0.1, 2.58, 0.06);
  const crownGeometry = new THREE.BoxGeometry(2.28, 0.13, 0.1);
  const baseTrimGeometry = new THREE.BoxGeometry(2.2, 0.08, 0.08);
  const lampMountGeometry = new THREE.BoxGeometry(0.22, 0.1, 0.06);
  const lampArmGeometry = new THREE.BoxGeometry(0.04, 0.18, 0.04);
  const lampHeadGeometry = new THREE.BoxGeometry(0.38, 0.08, 0.12);
  const lampCapGeometry = new THREE.ConeGeometry(0.1, 0.18, 14, 1, true);
  const lampLensGeometry = new THREE.CircleGeometry(0.082, 14);
  const accentPinGeometry = new THREE.SphereGeometry(0.026, 10, 10);

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
    const nicheWidth = placement.nicheLength * 0.72;
    const yaw = yawFromNormal(inwardNormal);
    const wallAnchor = nicheCenter.clone().add(wallOffset);

    const edgeOffset = (placement.nicheLength / 2) - 0.12;

    for (const edgeSign of [-1, 1]) {
      const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
      divider.position
        .copy(wallAnchor)
        .add(axis.clone().multiplyScalar(edgeSign * edgeOffset))
        .add(inwardNormal.clone().multiplyScalar(0.08));
      divider.position.y = (config.height - 0.5) / 2;
      divider.rotation.y = yaw;
      group.add(divider);
    }

    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(nicheWidth, 0.1, 0.12),
      dividerMaterial
    );
    canopy.position.copy(wallAnchor).add(inwardNormal.clone().multiplyScalar(0.08));
    canopy.position.y = 3.46;
    canopy.rotation.y = yaw;
    group.add(canopy);

    const backPanel = new THREE.Mesh(backPanelGeometry, nicheBackMaterial);
    backPanel.position.copy(wallAnchor).add(inwardNormal.clone().multiplyScalar(0.045));
    backPanel.position.y = 1.95;
    backPanel.rotation.y = yaw;
    group.add(backPanel);

    const insetPanel = new THREE.Mesh(insetPanelGeometry, nicheInsetMaterial);
    insetPanel.position.copy(wallAnchor).add(inwardNormal.clone().multiplyScalar(0.082));
    insetPanel.position.y = 1.95;
    insetPanel.rotation.y = yaw;
    group.add(insetPanel);

    for (const trimSign of [-1, 1]) {
      const sideTrim = new THREE.Mesh(sideTrimGeometry, trimMaterial);
      sideTrim.position
        .copy(wallAnchor)
        .add(axis.clone().multiplyScalar(trimSign * 0.98))
        .add(inwardNormal.clone().multiplyScalar(0.09));
      sideTrim.position.y = 1.95;
      sideTrim.rotation.y = yaw;
      group.add(sideTrim);

      const accentPin = new THREE.Mesh(accentPinGeometry, brassMaterial);
      accentPin.position
        .copy(wallAnchor)
        .add(axis.clone().multiplyScalar(trimSign * 0.87))
        .add(inwardNormal.clone().multiplyScalar(0.11));
      accentPin.position.y = 2.98;
      group.add(accentPin);
    }

    const crown = new THREE.Mesh(crownGeometry, trimMaterial);
    crown.position.copy(wallAnchor).add(inwardNormal.clone().multiplyScalar(0.092));
    crown.position.y = 3.12;
    crown.rotation.y = yaw;
    group.add(crown);

    const baseTrim = new THREE.Mesh(baseTrimGeometry, trimMaterial);
    baseTrim.position.copy(wallAnchor).add(inwardNormal.clone().multiplyScalar(0.088));
    baseTrim.position.y = 0.72;
    baseTrim.rotation.y = yaw;
    group.add(baseTrim);

    const lampMount = new THREE.Mesh(lampMountGeometry, brassMaterial);
    lampMount.position.copy(wallAnchor).add(inwardNormal.clone().multiplyScalar(0.1));
    lampMount.position.y = 3.33;
    lampMount.rotation.y = yaw;
    group.add(lampMount);

    const lampArm = new THREE.Mesh(lampArmGeometry, brassMaterial);
    lampArm.position.copy(wallAnchor).add(inwardNormal.clone().multiplyScalar(0.16));
    lampArm.position.y = 3.2;
    lampArm.rotation.y = yaw;
    group.add(lampArm);

    const lampHead = new THREE.Mesh(lampHeadGeometry, brassMaterial);
    lampHead.position.copy(wallAnchor).add(inwardNormal.clone().multiplyScalar(0.23));
    lampHead.position.y = 3.08;
    lampHead.rotation.y = yaw;
    lampHead.rotation.x = -0.12;
    group.add(lampHead);

    const lampCap = new THREE.Mesh(lampCapGeometry, brassMaterial);
    lampCap.position.copy(wallAnchor).add(inwardNormal.clone().multiplyScalar(0.22));
    lampCap.position.y = 2.99;
    const lampAimDirection = inwardNormal
      .clone()
      .multiplyScalar(-0.56)
      .add(new THREE.Vector3(0, -0.84, 0))
      .normalize();
    lampCap.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, -1, 0),
      lampAimDirection
    );
    group.add(lampCap);

    const lampLens = new THREE.Mesh(lampLensGeometry, lampLensMaterial);
    lampLens.position
      .copy(lampCap.position)
      .add(lampAimDirection.clone().multiplyScalar(0.092));
    lampLens.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      lampAimDirection
    );
    group.add(lampLens);
  }
}

export function createRoom(scene, woodTexture, layout) {
  const {
    config,
    bounds,
    zones,
    wings,
    privateChamber,
    placements
  } = layout;
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
  if (woodTexture.image) {
    floorTexture.needsUpdate = true;
  } else {
    woodTexture.addEventListener('update', () => {
      floorTexture.needsUpdate = true;
    });
  }

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
      roughness: 0.68,
      metalness: 0.08,
      transparent: true,
      opacity: 0.1
    })
  );
  lobbyAccent.rotation.x = -Math.PI / 2;
  lobbyAccent.position.set(0, 0.02, 0);
  group.add(lobbyAccent);

  const lobbyFrame = new THREE.Mesh(
    new THREE.RingGeometry((zones.lobby.size / 2) - 0.5, (zones.lobby.size / 2) - 0.15, 4),
    new THREE.MeshStandardMaterial({
      color: 0xf4b241,
      roughness: 0.56,
      metalness: 0.12,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide
    })
  );
  lobbyFrame.rotation.x = -Math.PI / 2;
  lobbyFrame.rotation.z = Math.PI / 4;
  lobbyFrame.position.set(0, 0.03, 0);
  group.add(lobbyFrame);

  addLobbyShowpiece(group, config, zones);
  addLobbyCornerWalls(group, config, wings, wallMaterial);

  for (const wing of wings) {
    addWingEnvelope(group, wing, config, wallMaterial);
    addWingAccents(group, wing, config);
    addPortalFrame(group, wing, config, frameMaterial);
  }

  if (privateChamber) {
    addPrivateChamberEnvelope(group, privateChamber, config, wallMaterial);
  }

  const displayAreas = privateChamber ? [...wings, privateChamber] : wings;
  addPaintingNiches(group, placements, displayAreas, config);

  scene.add(group);
}
