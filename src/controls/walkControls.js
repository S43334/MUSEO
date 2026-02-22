import * as THREE from 'three';

function isInsideZone(x, z, radius, zone) {
  return (
    x - radius >= zone.minX &&
    x + radius <= zone.maxX &&
    z - radius >= zone.minZ &&
    z + radius <= zone.maxZ
  );
}

export function createWalkControls(camera, controls, navConfig = {}) {
  const velocity = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const keys = { forward: false, backward: false, left: false, right: false };
  const speed = navConfig.speed ?? 7.4;
  const playerRadius = navConfig.playerRadius ?? 0.35;
  const walkableZones = navConfig.walkableZones || [];
  const fallbackBounds = navConfig.bounds || { minX: -12, maxX: 12, minZ: -12, maxZ: 12 };

  let joystickInput = { x: 0, y: 0 };

  function isInsideBounds(x, z, radius) {
    return (
      x - radius >= fallbackBounds.minX &&
      x + radius <= fallbackBounds.maxX &&
      z - radius >= fallbackBounds.minZ &&
      z + radius <= fallbackBounds.maxZ
    );
  }

  function canMoveTo(x, z, radius = playerRadius) {
    if (walkableZones.length === 0) {
      return isInsideBounds(x, z, radius);
    }
    return walkableZones.some((zone) => isInsideZone(x, z, radius, zone));
  }

  window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyW' || event.code === 'ArrowUp') keys.forward = true;
    if (event.code === 'KeyS' || event.code === 'ArrowDown') keys.backward = true;
    if (event.code === 'KeyA' || event.code === 'ArrowLeft') keys.left = true;
    if (event.code === 'KeyD' || event.code === 'ArrowRight') keys.right = true;
  });

  window.addEventListener('keyup', (event) => {
    if (event.code === 'KeyW' || event.code === 'ArrowUp') keys.forward = false;
    if (event.code === 'KeyS' || event.code === 'ArrowDown') keys.backward = false;
    if (event.code === 'KeyA' || event.code === 'ArrowLeft') keys.left = false;
    if (event.code === 'KeyD' || event.code === 'ArrowRight') keys.right = false;
  });

  function setJoystickInput(x, y) {
    joystickInput = { x, y };
  }

  function teleportTo(x, z, targetX, targetZ) {
    camera.position.x = x;
    camera.position.z = z;
    controls.target.x = targetX;
    controls.target.z = targetZ;
    controls.update();
  }

  function update(delta) {
    if (!controls.enabled) {
      return;
    }

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

    if (joystickInput.y !== 0) {
      direction.add(forward.clone().multiplyScalar(joystickInput.y));
    }
    if (joystickInput.x !== 0) {
      direction.add(right.clone().multiplyScalar(joystickInput.x));
    }

    if (direction.lengthSq() > 1) {
      direction.normalize();
    }

    if (direction.lengthSq() === 0) {
      return;
    }

    velocity.copy(direction).multiplyScalar(speed * delta);

    const currentX = camera.position.x;
    const currentZ = camera.position.z;

    const nextX = currentX + velocity.x;
    const nextZ = currentZ + velocity.z;

    let movedX = 0;
    let movedZ = 0;

    if (canMoveTo(nextX, currentZ)) {
      movedX = velocity.x;
    }

    if (canMoveTo(currentX + movedX, nextZ)) {
      movedZ = velocity.z;
    }

    if (movedX !== 0 || movedZ !== 0) {
      camera.position.x += movedX;
      camera.position.z += movedZ;
      controls.target.x += movedX;
      controls.target.z += movedZ;
    }
  }

  return {
    update,
    setJoystickInput,
    teleportTo,
    canMoveTo
  };
}
