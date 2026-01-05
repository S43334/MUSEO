import * as THREE from 'three';

export function createLights(scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.6); 
  scene.add(ambient);

  const lightHeight = 6.8; 
  const rowOffset = 3.0;   
  const spacing = 8;       

  for (let z = 0; z >= -90; z -= spacing) {
    
    const leftBulb = new THREE.PointLight(0xffaa00, 3.5, 25);
    leftBulb.position.set(-rowOffset, lightHeight, z);
    scene.add(leftBulb);

    const rightBulb = new THREE.PointLight(0xffaa00, 3.5, 25);
    rightBulb.position.set(rowOffset, lightHeight, z);
    scene.add(rightBulb);

    const bulbGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffddaa });
    
    const leftMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
    leftMesh.position.copy(leftBulb.position);
    scene.add(leftMesh);

    const rightMesh = new THREE.Mesh(bulbGeometry, bulbMaterial);
    rightMesh.position.copy(rightBulb.position);
    scene.add(rightMesh);
  }
}