import * as THREE from 'three';

function toVecXZ(value) {
  return new THREE.Vector3(value.x, 0, value.z);
}

export function createLights(scene, layout) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.22);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x879bc5, 0x06080f, 0.2);
  scene.add(hemi);

  const lobbyFill = new THREE.PointLight(0xffd6a8, 0.62, 26, 2.1);
  lobbyFill.position.set(0, 6.1, 0);
  scene.add(lobbyFill);

  for (const wing of layout.wings) {
    const axis = toVecXZ(wing.axis);
    const entranceLight = new THREE.PointLight(new THREE.Color(wing.color), 0.24, 12, 2.2);
    entranceLight.position.copy(axis.clone().multiplyScalar((layout.config.lobbySize / 2) + 1.2));
    entranceLight.position.y = 5.2;
    scene.add(entranceLight);
  }
}