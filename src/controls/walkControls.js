import * as THREE from 'three';

export function createWalkControls(camera, controls) {
  const currentVelocity = new THREE.Vector3(); 
  const inputDirection = new THREE.Vector3();
  const keys = { forward: false, backward: false, left: false, right: false };
  
  let joystickInput = { x: 0, y: 0 };
  
  const maxSpeed = 8.0;          
  const joystickSmoothing = 5.0; 
  const keyboardResponse = 25.0; 

  const BOUNDS = {
    minX: -4.8, 
    maxX: 4.8,  
    minZ: -168.0,
    maxZ: 10.0 
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

    const safeDelta = Math.min(delta, 0.1);

    inputDirection.set(0, 0, 0);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    let isKeyboardMoving = false;
    if (keys.forward) { inputDirection.add(forward); isKeyboardMoving = true; }
    if (keys.backward) { inputDirection.sub(forward); isKeyboardMoving = true; }
    if (keys.left) { inputDirection.sub(right); isKeyboardMoving = true; }
    if (keys.right) { inputDirection.add(right); isKeyboardMoving = true; }

    if (isKeyboardMoving) {
      if (inputDirection.lengthSq() > 0) inputDirection.normalize();
      const targetVel = inputDirection.multiplyScalar(maxSpeed);
      currentVelocity.lerp(targetVel, keyboardResponse * safeDelta);
    } 
    else if (joystickInput.x !== 0 || joystickInput.y !== 0) {
      const joyMove = new THREE.Vector3(0,0,0);
      joyMove.add(forward.clone().multiplyScalar(joystickInput.y)); 
      joyMove.add(right.clone().multiplyScalar(joystickInput.x));   
      
      const targetVel = joyMove.multiplyScalar(maxSpeed);
      currentVelocity.lerp(targetVel, joystickSmoothing * safeDelta);
    } 
    else {
      currentVelocity.lerp(new THREE.Vector3(0, 0, 0), 10.0 * safeDelta);
    }

    if (currentVelocity.lengthSq() > 0.001) {
      const moveX = currentVelocity.x * safeDelta;
      const moveZ = currentVelocity.z * safeDelta;

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