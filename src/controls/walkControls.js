import * as THREE from 'three';

export function createWalkControls(camera, controls) {
  const currentVelocity = new THREE.Vector3(); 
  const inputDirection = new THREE.Vector3();
  const keys = { forward: false, backward: false, left: false, right: false };
  
  let joystickInput = { x: 0, y: 0 };
  
  const maxSpeed = 10.0;
  const acceleration = 60.0; 
  const friction = 10.0;     

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

    inputDirection.set(0, 0, 0);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    if (keys.forward) inputDirection.add(forward);
    if (keys.backward) inputDirection.sub(forward);
    if (keys.left) inputDirection.sub(right);
    if (keys.right) inputDirection.add(right);

    if (joystickInput.y !== 0) inputDirection.add(forward.clone().multiplyScalar(joystickInput.y));
    if (joystickInput.x !== 0) inputDirection.add(right.clone().multiplyScalar(joystickInput.x));

    if (inputDirection.length() > 1) inputDirection.normalize();

    if (inputDirection.lengthSq() > 0) {
      currentVelocity.add(inputDirection.multiplyScalar(acceleration * delta));
    } else {
      const damping = currentVelocity.clone().multiplyScalar(friction * delta);
      if (damping.lengthSq() > currentVelocity.lengthSq()) {
        currentVelocity.set(0, 0, 0);
      } else {
        currentVelocity.sub(damping);
      }
    }

    if (currentVelocity.length() > maxSpeed) {
      currentVelocity.setLength(maxSpeed);
    }

    if (currentVelocity.lengthSq() > 0.001) {
      const moveX = currentVelocity.x * delta;
      const moveZ = currentVelocity.z * delta;

      const nextX = camera.position.x + moveX;
      const nextZ = camera.position.z + moveZ;

      if (nextX >= BOUNDS.minX && nextX <= BOUNDS.maxX) {
        camera.position.x += moveX;
        controls.target.x += moveX;
      } else {
        currentVelocity.x = 0;
      }

      if (nextZ >= BOUNDS.minZ && nextZ <= BOUNDS.maxZ) {
        camera.position.z += moveZ;
        controls.target.z += moveZ;
      } else {
        currentVelocity.z = 0;
      }
    }
  }

  return { update, setJoystickInput };
}