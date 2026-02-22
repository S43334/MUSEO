import * as THREE from 'three';

export function createLights(scene, rooms = []) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.42);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x8aa6d9, 0x05070d, 0.28);
  scene.add(hemi);

  for (const room of rooms) {
    const roomColor = new THREE.Color(room.color);
    const warmAccent = roomColor.clone().lerp(new THREE.Color(0xffd19a), 0.45);

    const centerFill = new THREE.PointLight(warmAccent, 1.1, 24, 2.2);
    centerFill.position.set(0, 6.4, room.centerZ);
    scene.add(centerFill);

    const leftSpot = new THREE.SpotLight(0xffffff, 1.65, 24, 0.56, 0.45, 1.4);
    leftSpot.position.set(-1.15, 6.45, room.centerZ + 1.8);
    leftSpot.target.position.set(-4.55, 2.1, room.centerZ);
    leftSpot.castShadow = false;
    scene.add(leftSpot);
    scene.add(leftSpot.target);

    const rightSpot = new THREE.SpotLight(0xffffff, 1.65, 24, 0.56, 0.45, 1.4);
    rightSpot.position.set(1.15, 6.45, room.centerZ + 1.8);
    rightSpot.target.position.set(4.55, 2.1, room.centerZ);
    rightSpot.castShadow = false;
    scene.add(rightSpot);
    scene.add(rightSpot.target);

    const roomMarker = new THREE.PointLight(roomColor, 0.35, 14, 2);
    roomMarker.position.set(0, 5.6, room.frontZ - 1.5);
    scene.add(roomMarker);
  }
}
