import * as THREE from 'three';

function toVecXZ(value) {
  return new THREE.Vector3(value.x, 0, value.z);
}

export function createLights(scene, layout) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.34);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x8ca5d0, 0x05070d, 0.3);
  scene.add(hemi);

  const lobbyFill = new THREE.PointLight(0xffd9aa, 1.2, 36, 2.1);
  lobbyFill.position.set(0, 6.2, 0);
  scene.add(lobbyFill);

  for (const wing of layout.wings) {
    const axis = toVecXZ(wing.axis);
    const entranceLight = new THREE.PointLight(new THREE.Color(wing.color), 0.52, 16, 2.2);
    entranceLight.position.copy(axis.clone().multiplyScalar((layout.config.lobbySize / 2) + 1.5));
    entranceLight.position.y = 5.8;
    scene.add(entranceLight);
  }

  for (const placement of layout.placements) {
    const paintingPos = new THREE.Vector3(
      placement.position.x,
      placement.position.y,
      placement.position.z
    );
    const inward = toVecXZ(placement.inwardNormal);

    const spot = new THREE.SpotLight(0xffffff, 1.35, 10, 0.52, 0.45, 1.2);
    spot.position.copy(paintingPos).add(inward.clone().multiplyScalar(1.2));
    spot.position.y = 5.1;
    spot.target.position.set(paintingPos.x, paintingPos.y + 0.2, paintingPos.z);
    spot.castShadow = false;
    scene.add(spot);
    scene.add(spot.target);
  }
}
