import * as THREE from 'three';

const FOCUS_FOV = 45;
const FOCUS_MIN_DISTANCE = 2.45;
const FOCUS_MAX_DISTANCE = 5.45;
const FOCUS_TARGET_Y_OFFSET = 0.1;
const QUALITY_SPOT_INTENSITY = {
  high: 1.5,
  balanced: 1.05,
  low: 0
};

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

function getFocusDistance(camera, paintingGroup) {
  const baseDistance = paintingGroup.userData?.artwork?.focusDistance ?? FOCUS_MIN_DISTANCE;
  const frameSize = paintingGroup.userData?.frameSize || {};
  const frameHeight = Number(frameSize.height) || 2.15;
  const frameWidth = Number(frameSize.width) || 1.65;
  const vFov = THREE.MathUtils.degToRad(FOCUS_FOV);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);

  const fitByHeight = ((frameHeight * 0.5) * 1.05) / Math.tan(vFov / 2);
  const fitByWidth = ((frameWidth * 0.5) * 1.1) / Math.tan(hFov / 2);

  const calculated = Math.max(baseDistance, fitByHeight + 0.28, fitByWidth + 0.38);
  return THREE.MathUtils.clamp(calculated, FOCUS_MIN_DISTANCE, FOCUS_MAX_DISTANCE);
}

export function setupInteractions({
  camera,
  controls,
  scene,
  renderer,
  interactiveObjects = [],
  onSelect,
  onDeselect
}) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const raycastRoots = interactiveObjects.length > 0 ? interactiveObjects : scene.children;

  const focusSpotTarget = new THREE.Object3D();
  const focusSpot = new THREE.SpotLight(0xf2f5ff, 1.35, 14, 0.48, 0.38, 1.1);
  focusSpot.castShadow = false;
  focusSpot.visible = false;
  focusSpot.target = focusSpotTarget;
  scene.add(focusSpotTarget);
  scene.add(focusSpot);

  let highlightedFrame = null;
  let originalEmissive = new THREE.Color();

  let explorePosition = camera.position.clone();
  let exploreTarget = controls.target.clone();
  let exploreFov = camera.fov;

  let startPosition = camera.position.clone();
  let startTarget = controls.target.clone();
  let startFov = camera.fov;

  let endPosition = camera.position.clone();
  let endTarget = camera.position.clone();
  let endFov = camera.fov;

  let selectedPainting = null;
  let progress = 1;
  const duration = 0.74;
  let isZoomed = false;
  let panelVisible = true;
  let qualityLevel = 'balanced';

  function getPointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    pointer.x = (x * 2) - 1;
    pointer.y = -((y * 2) - 1);
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
    frame.material.emissive = new THREE.Color(0x242424);
    frame.material.emissiveIntensity = 1.2;
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

  function hideFocusSpot() {
    focusSpot.visible = false;
  }

  function updateFocusSpot(target, inwardNormal) {
    if (qualityLevel === 'low') {
      focusSpot.visible = false;
      return;
    }

    focusSpot.intensity = QUALITY_SPOT_INTENSITY[qualityLevel] || QUALITY_SPOT_INTENSITY.balanced;
    focusSpotTarget.position.copy(target);
    focusSpot.position.copy(target).add(inwardNormal.clone().multiplyScalar(2.05));
    focusSpot.position.y = target.y + 3.15;
    focusSpot.visible = true;
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

    const artwork = paintingGroup.userData?.artwork || {};
    const frameSize = paintingGroup.userData?.frameSize || {};
    const frameHeight = Number(frameSize.height) || 2.15;
    const target = paintingGroup.position.clone();
    target.y += FOCUS_TARGET_Y_OFFSET + Math.min(0.16, frameHeight * 0.04);

    const focusDistance = getFocusDistance(camera, paintingGroup);
    const inwardNormal = artwork.inwardNormal
      ? new THREE.Vector3(artwork.inwardNormal.x, 0, artwork.inwardNormal.z).normalize()
      : new THREE.Vector3(0, 0, 1).applyQuaternion(paintingGroup.quaternion).normalize();

    const offset = inwardNormal.multiplyScalar(focusDistance);
    const destination = target.clone().add(offset);
    destination.y = Math.max(1.58, target.y + (frameHeight * 0.06));

    setTransitionTargets(destination, target, FOCUS_FOV);
    updateFocusSpot(target, inwardNormal);
    isZoomed = true;
    controls.enabled = false;

    if (notify && onSelect) {
      onSelect(paintingGroup.userData.artwork, { panelVisible });
    }
  }

  function clearSelection(options = {}) {
    const animate = options.animate !== false;
    const notify = options.notify !== false;

    if (!isZoomed && !selectedPainting) {
      return;
    }

    clearHighlight();
    hideFocusSpot();

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

    const hits = raycaster.intersectObjects(raycastRoots, true);
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

    const hits = raycaster.intersectObjects(raycastRoots, true);
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
    setQuality(level = 'balanced') {
      qualityLevel = level;
      if (qualityLevel === 'low') {
        hideFocusSpot();
      } else {
        focusSpot.intensity = QUALITY_SPOT_INTENSITY[qualityLevel] || QUALITY_SPOT_INTENSITY.balanced;
      }
    },
    setPanelVisibility(isVisible) {
      panelVisible = Boolean(isVisible);
    },
    isFocused: () => isZoomed,
    isZoomed: () => isZoomed,
    getSelectedArtwork: () => selectedPainting?.userData?.artwork || null,
    getSelectedPaintingGroup: () => selectedPainting,
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

      if (!controls.enabled) {
        camera.lookAt(controls.target);
      }
    }
  };
}
