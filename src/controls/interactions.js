import * as THREE from 'three';

function easeInOut(t) {
  return t < 0.5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function setupInteractions({
  camera,
  controls,
  scene,
  renderer
}) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  let highlightedFrame = null;
  let originalEmissive = new THREE.Color();

  let startPosition = camera.position.clone();
  let startTarget = controls.target.clone();
  let startFov = camera.fov;

  let endPosition = null;
  let endTarget = null;
  let endFov = camera.fov;

  let progress = 1;
  const duration = 0.8;
  let isZoomed = false;

  function getPointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    pointer.x = x * 2 - 1;
    pointer.y = -(y * 2 - 1);
  }

  function highlightFrame(frame) {
    if (highlightedFrame === frame) return;

    clearHighlight();

    highlightedFrame = frame;
    originalEmissive.copy(frame.material.emissive || new THREE.Color());

    frame.material.emissive = new THREE.Color(0x222222);
    frame.material.emissiveIntensity = 1.2;
  }

  function clearHighlight() {
    if (!highlightedFrame) return;

    highlightedFrame.material.emissive.copy(originalEmissive);
    highlightedFrame.material.emissiveIntensity = 1;
    highlightedFrame = null;
  }

  function checkHover(event) {
    getPointer(event);
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(scene.children, true);
    
    // Busca objeto marcado explícitamente como frame (definido en frame.js)
    const frameHit = hits.find(h => h.object.userData.isFrame);

    if (frameHit) {
      highlightFrame(frameHit.object);
    } else {
      clearHighlight();
    }
  }

  function onPointerDown(event) {
    getPointer(event);
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(scene.children, true);

    // 1. FILTRO ESTRICTO:
    // Buscamos si clicamos un objeto que sea parte de un cuadro.
    // Verificamos si el objeto es un frame O si su padre es un grupo 'isPainting'.
    const paintingHit = hits.find(hit => {
      const isFrame = hit.object.userData.isFrame;
      const parentIsPainting = hit.object.parent && hit.object.parent.userData.isPainting;
      return isFrame || parentIsPainting;
    });

    // Si encontramos un hit válido, obtenemos el grupo padre (donde está la posición/rotación)
    const paintingGroup = paintingHit ? paintingHit.object.parent : null;

    if (paintingGroup && !isZoomed) {
      // --- ENTRAR A ZOOM ---
      startPosition = camera.position.clone();
      startTarget = controls.target.clone();
      startFov = camera.fov;

      // Objetivo: El centro del cuadro
      endTarget = paintingGroup.position.clone();

      // Posición de la cámara: Calculamos una posición "frente" al cuadro
      // Creamos un vector que apunta 2.5 metros hacia "atrás" (relativo al cuadro)
      // Ajusta 2.5 según qué tan cerca quieras estar
      const offset = new THREE.Vector3(0, 0, 2.5); 
      
      // Rotamos ese vector según la rotación del cuadro (para paredes laterales)
      offset.applyQuaternion(paintingGroup.quaternion);
      
      // Sumamos el offset rotado a la posición del cuadro
      endPosition = paintingGroup.position.clone().add(offset);

      endFov = 45; // Zoom in (FOV más pequeño)

      progress = 0;
      isZoomed = true;
      controls.enabled = false;

    } else if (isZoomed) {
      // --- SALIR DE ZOOM ---
      // Si ya estamos en zoom, cualquier click (incluso al vacío) nos saca
      endPosition = startPosition.clone();
      endTarget = startTarget.clone();
      endFov = 65; // FOV normal

      progress = 0;
      isZoomed = false;
      controls.enabled = true;
    }
    // Si NO estamos en zoom y clicamos una pared (paintingGroup es null), no pasa nada.
  }

  renderer.domElement.addEventListener('pointermove', checkHover);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  return function update(delta = 0.016) {
    if (progress < 1) {
      progress += delta / duration;
      progress = Math.min(progress, 1);

      const t = easeInOut(progress);

      camera.position.lerpVectors(startPosition, endPosition, t);
      controls.target.lerpVectors(startTarget, endTarget, t);

      camera.fov = THREE.MathUtils.lerp(startFov, endFov, t);
      camera.updateProjectionMatrix();
    }
  };
}