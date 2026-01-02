import * as THREE from 'three';

export function createWalkControls(camera, controls) {
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const keys = { forward: false, backward: false, left: false, right: false };
  
  // Variable para almacenar la entrada del joystick (x, y entre -1 y 1)
  let joystickInput = { x: 0, y: 0 };
  
  const speed = 2.5;

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

  // Función pública para recibir datos del joystick desde fuera
  function setJoystickInput(x, y) {
    joystickInput.x = x;
    joystickInput.y = y;
  }

  function update(delta) {
    if (!controls.enabled) return;

    direction.set(0, 0, 0);

    // Vectores de dirección de la cámara
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    // 1. Sumamos entrada de TECLADO
    if (keys.forward) direction.add(forward);
    if (keys.backward) direction.sub(forward);
    if (keys.left) direction.sub(right);
    if (keys.right) direction.add(right);

    // 2. Sumamos entrada de JOYSTICK
    // joystickInput.y positivo es "arriba" (forward)
    if (joystickInput.y !== 0) {
      const moveForward = forward.clone().multiplyScalar(joystickInput.y);
      direction.add(moveForward);
    }
    // joystickInput.x positivo es "derecha"
    if (joystickInput.x !== 0) {
      const moveRight = right.clone().multiplyScalar(joystickInput.x);
      direction.add(moveRight);
    }

    // Normalizamos solo si la longitud es mayor a 1 (para no acelerar en diagonales)
    // pero permitimos caminar lento con el joystick si se empuja poco.
    if (direction.length() > 1) {
      direction.normalize();
    }

    if (direction.length() > 0) {
      velocity.copy(direction).multiplyScalar(speed * delta);
      camera.position.add(velocity);
      controls.target.add(velocity); 
    }
  }

  return { update, setJoystickInput };
}