import * as THREE from 'three';

export function createWalkControls(camera, controls) {
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const keys = { forward: false, backward: false, left: false, right: false };
  
  let joystickInput = { x: 0, y: 0 };
  
  const speed = 5;

  const BOUNDS = {
    minX: -4.5, 
    maxX: 4.5,  
    minZ: -164.0,
    maxZ: 4.5   
  };

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

  function setJoystickInput(x, y) {
    joystickInput.x = x;
    joystickInput.y = y;
  }

  function update(delta) {
    if (!controls.enabled) return;

    direction.set(0, 0, 0);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    if (keys.forward) direction.add(forward);
    if (keys.backward) direction.sub(forward);
    if (keys.left) direction.sub(right);
    if (keys.right) direction.add(right);

    if (joystickInput.y !== 0) direction.add(forward.clone().multiplyScalar(joystickInput.y));
    if (joystickInput.x !== 0) direction.add(right.clone().multiplyScalar(joystickInput.x));

    if (direction.length() > 1) direction.normalize();

    if (direction.length() > 0) {
      velocity.copy(direction).multiplyScalar(speed * delta);
      
      const nextX = camera.position.x + velocity.x;
      const nextZ = camera.position.z + velocity.z;

      if (nextX >= BOUNDS.minX && nextX <= BOUNDS.maxX) {
        camera.position.x += velocity.x;
        controls.target.x += velocity.x;
      }

      if (nextZ >= BOUNDS.minZ && nextZ <= BOUNDS.maxZ) {
        camera.position.z += velocity.z;
        controls.target.z += velocity.z;
      }
    }
  }

  return { update, setJoystickInput };
}