import * as THREE from 'three';

export function createWalkControls(camera) {
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();

  const keys = {
    forward: false,
    backward: false,
    left: false,
    right: false
  };

  const speed = 2.2; // metros por segundo
  const eyeHeight = 1.6;

  camera.position.y = eyeHeight;

  // ⌨️ Desktop
  window.addEventListener('keydown', e => {
    if (e.code === 'KeyW') keys.forward = true;
    if (e.code === 'KeyS') keys.backward = true;
    if (e.code === 'KeyA') keys.left = true;
    if (e.code === 'KeyD') keys.right = true;
  });

  window.addEventListener('keyup', e => {
    if (e.code === 'KeyW') keys.forward = false;
    if (e.code === 'KeyS') keys.backward = false;
    if (e.code === 'KeyA') keys.left = false;
    if (e.code === 'KeyD') keys.right = false;
  });

  function update(delta) {
    direction.set(0, 0, 0);

    if (keys.forward) direction.z -= 1;
    if (keys.backward) direction.z += 1;
    if (keys.left) direction.x -= 1;
    if (keys.right) direction.x += 1;

    direction.normalize();

    if (direction.length() > 0) {
      velocity.copy(direction).multiplyScalar(speed * delta);
      velocity.applyQuaternion(camera.quaternion);
      camera.position.add(velocity);
      camera.position.y = eyeHeight;
    }
  }

  return { update };
}
