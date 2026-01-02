import * as THREE from 'three';

export function createWalkControls(camera, controls) {
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const keys = { forward: false, backward: false, left: false, right: false };
  
  let joystickInput = { x: 0, y: 0 };
  
  const speed = 5;

  // --- LÍMITES DEL MUSEO (Colisiones) ---
  // El pasillo mide 10m de ancho (paredes en -5 y 5).
  // Dejamos 0.5m de margen (padding) para que la cámara no se pegue y atraviese la textura.
  const BOUNDS = {
    minX: -4.5, // Pared Izquierda
    maxX: 4.5,  // Pared Derecha
    minZ: -89.0,// Pared del Fondo (Final del pasillo)
    maxZ: 4.5   // Pared Trasera (Inicio)
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
    if (!controls.enabled) return; // Si estás en zoom, no te muevas

    direction.set(0, 0, 0);

    // Vectores de dirección
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    // Entradas
    if (keys.forward) direction.add(forward);
    if (keys.backward) direction.sub(forward);
    if (keys.left) direction.sub(right);
    if (keys.right) direction.add(right);

    if (joystickInput.y !== 0) direction.add(forward.clone().multiplyScalar(joystickInput.y));
    if (joystickInput.x !== 0) direction.add(right.clone().multiplyScalar(joystickInput.x));

    if (direction.length() > 1) direction.normalize();

    if (direction.length() > 0) {
      velocity.copy(direction).multiplyScalar(speed * delta);
      
      // --- DETECCIÓN DE COLISIONES ---
      // Calculamos dónde ESTARÍA la cámara si nos movemos
      const nextX = camera.position.x + velocity.x;
      const nextZ = camera.position.z + velocity.z;

      // 1. Verificamos Paredes Laterales (X)
      // Solo nos movemos en X si estamos DENTRO de los límites
      if (nextX >= BOUNDS.minX && nextX <= BOUNDS.maxX) {
        camera.position.x += velocity.x;
        controls.target.x += velocity.x;
      }

      // 2. Verificamos Paredes Fondo/Inicio (Z)
      // Solo nos movemos en Z si estamos DENTRO de los límites
      if (nextZ >= BOUNDS.minZ && nextZ <= BOUNDS.maxZ) {
        camera.position.z += velocity.z;
        controls.target.z += velocity.z;
      }
    }
  }

  return { update, setJoystickInput };
}