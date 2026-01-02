import * as THREE from 'three';

// 1. Añadimos 'controls' (OrbitControls) como argumento
export function createWalkControls(camera, controls) {
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const keys = { forward: false, backward: false, left: false, right: false };
  const speed = 2.5;

  // ... (Tus event listeners de keydown/keyup están perfectos, déjalos igual) ...
  window.addEventListener('keydown', e => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.forward = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.backward = true;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
  });

  window.addEventListener('keyup', e => {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.forward = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.backward = false;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
  });

  function update(delta) {
    if (!controls.enabled) return; // No mover si estamos en zoom

    direction.set(0, 0, 0);

    // Obtenemos la dirección hacia donde mira la cámara (para caminar hacia allá)
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0; // Para no volar hacia arriba si miras al cielo
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    if (keys.forward) direction.add(forward);
    if (keys.backward) direction.sub(forward);
    if (keys.left) direction.sub(right);
    if (keys.right) direction.add(right);

    direction.normalize();

    if (direction.length() > 0) {
      velocity.copy(direction).multiplyScalar(speed * delta);
      
      // 2. Movemos TANTO la cámara COMO el target de los controles
      camera.position.add(velocity);
      controls.target.add(velocity); 
    }
  }

  return { update };
}