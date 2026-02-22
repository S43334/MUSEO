import * as THREE from 'three';

function easeInOut(t) {
  return t < 0.5
    ? 2 * t * t
    : 1 - (Math.pow(-2 * t + 2, 2) / 2);
}

function resolvePaintingGroup(object) {
  let current = object;
  while (current) {
    if (current.userData?.isPainting) {
      return current;
    }

    if (current.userData?.paintingGroup) {
      return current.userData.paintingGroup;
    }

    current = current.parent;
  }

  return null;
}

export function setupInteractions({
  camera,
  controls,
  scene,
  renderer,
  onSelect,
  onDeselect
}) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  let highlightedFrame = null;
  let originalEmissive = new THREE.Color();

  let explorePosition = camera.position.clone();
  let exploreTarget = controls.target.clone();
  let exploreFov = camera.fov;

  let startPosition = camera.position.clone();
  let startTarget = controls.target.clone();
  let startFov = camera.fov;

  let endPosition = camera.position.clone();
  let endTarget = controls.target.clone();
  let endFov = camera.fov;

  let selectedPainting = null;
  let progress = 1;
  const duration = 0.7;
  let isZoomed = false;

  function getPointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    pointer.x = x * 2 - 1;
    pointer.y = -(y * 2 - 1);
  }

  function clearHighlight() {
    if (!highlightedFrame) {
      return;
    }

    highlightedFrame.material.emissive.copy(originalEmissive);
    highlightedFrame.material.emissiveIntensity = 1;
    highlightedFrame = null;
  }

  function highlightFrame(frame) {
    if (!frame || highlightedFrame === frame) {
      return;
    }

    clearHighlight();

    highlightedFrame = frame;
    originalEmissive.copy(frame.material.emissive || new THREE.Color());
    frame.material.emissive = new THREE.Color(0x232323);
    frame.material.emissiveIntensity = 1.15;
  }

  function setTransitionTargets(nextPosition, nextTarget, nextFov) {
    startPosition = camera.position.clone();
    startTarget = controls.target.clone();
    startFov = camera.fov;

    endPosition = nextPosition.clone();
    endTarget = nextTarget.clone();
    endFov = nextFov;
    progress = 0;
  }

  function focusPainting(paintingGroup, notify = true) {
    if (!paintingGroup) {
      return;
    }

    clearHighlight();

    if (!isZoomed) {
      explorePosition = camera.position.clone();
      exploreTarget = controls.target.clone();
      exploreFov = camera.fov;
    }

    selectedPainting = paintingGroup;

    const target = paintingGroup.position.clone();
    const offset = new THREE.Vector3(0, 0, 2.7);
    offset.applyQuaternion(paintingGroup.quaternion);
    const destination = target.clone().add(offset);

    setTransitionTargets(destination, target, 44);
    isZoomed = true;
    controls.enabled = false;

    if (notify && onSelect) {
      onSelect(paintingGroup.userData.artwork);
    }
  }

  function clearSelection(options = {}) {
    const animate = options.animate !== false;
    const notify = options.notify !== false;

    if (!isZoomed && !selectedPainting) {
      return;
    }

    clearHighlight();

    if (animate) {
      setTransitionTargets(explorePosition, exploreTarget, exploreFov);
    } else {
      camera.position.copy(explorePosition);
      controls.target.copy(exploreTarget);
      camera.fov = exploreFov;
      camera.updateProjectionMatrix();
      progress = 1;
    }

    isZoomed = false;
    selectedPainting = null;
    controls.enabled = true;

    if (notify && onDeselect) {
      onDeselect();
    }
  }

  function checkHover(event) {
    if (isZoomed) {
      return;
    }

    getPointer(event);
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(scene.children, true);
    const frameHit = hits.find((hit) => hit.object.userData?.isFrame);

    if (frameHit) {
      highlightFrame(frameHit.object);
    } else {
      clearHighlight();
    }
  }

  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    getPointer(event);
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(scene.children, true);
    const paintingHit = hits.find((hit) => resolvePaintingGroup(hit.object));

    if (paintingHit) {
      const paintingGroup = resolvePaintingGroup(paintingHit.object);
      focusPainting(paintingGroup, true);
      return;
    }

    if (isZoomed) {
      clearSelection({ animate: true, notify: true });
    }
  }

  renderer.domElement.addEventListener('pointermove', checkHover);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  return {
    focusPainting,
    clearSelection,
    isZoomed: () => isZoomed,
    getSelectedArtwork: () => selectedPainting?.userData?.artwork || null,
    update(delta = 0.016) {
      if (progress < 1) {
        progress += delta / duration;
        progress = Math.min(progress, 1);
        const t = easeInOut(progress);

        camera.position.lerpVectors(startPosition, endPosition, t);
        controls.target.lerpVectors(startTarget, endTarget, t);
        camera.fov = THREE.MathUtils.lerp(startFov, endFov, t);
        camera.updateProjectionMatrix();
      }
    }
  };
}
