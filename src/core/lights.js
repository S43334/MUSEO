import * as THREE from 'three';

export function createLights(scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.6); 
  scene.add(ambient);

  const lightHeight = 6.8; 
  const rowOffset = 3.0;   
  const spacing = 8;       
  const startZ = 0;
  const endZ = -165;

  const countPerSide = Math.floor(Math.abs(endZ - startZ) / spacing) + 1;
  const totalBulbs = countPerSide * 2;

  const bulbGeometry = new THREE.SphereGeometry(0.15, 8, 8);
  const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffddaa });
  const bulbInstanced = new THREE.InstancedMesh(bulbGeometry, bulbMaterial, totalBulbs);
  
  const dummy = new THREE.Object3D();
  let instanceIndex = 0;

  for (let z = startZ; z >= endZ; z -= spacing) {
    
    const leftLight = new THREE.PointLight(0xffaa00, 3.5, 20);
    leftLight.position.set(-rowOffset, lightHeight, z);
    leftLight.castShadow = false;
    scene.add(leftLight);

    const rightLight = new THREE.PointLight(0xffaa00, 3.5, 20);
    rightLight.position.set(rowOffset, lightHeight, z);
    rightLight.castShadow = false; 
    scene.add(rightLight);

    dummy.position.set(-rowOffset, lightHeight, z);
    dummy.updateMatrix();
    bulbInstanced.setMatrixAt(instanceIndex++, dummy.matrix);

    dummy.position.set(rowOffset, lightHeight, z);
    dummy.updateMatrix();
    bulbInstanced.setMatrixAt(instanceIndex++, dummy.matrix);
  }

  scene.add(bulbInstanced);
}