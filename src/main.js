import * as THREE from 'three';
import { createScene, createRenderer, setupResize } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { createLights } from './core/lights.js';
import { createRoom } from './museum/room.js';
import { loadPaintings } from './museum/paintings.js';
import { createControls } from './controls/controls.js';
import { setupInteractions } from './controls/interactions.js';
import { createWalkControls } from './controls/walkControls.js';
import { createJoystick } from './controls/joysticks.js';
import {
  detectDeviceProfile,
  createAdaptiveQualityState,
  updateAdaptiveQuality,
  applyQualityLevel
} from './core/performanceProfile.js';
import { loadMuseumContent } from './services/contentRepository.js';
import { trackEvent } from './services/backendClient.js';
import { LAYOUT_CONFIG, buildMuseumLayout } from './museum/layout.js';

const manager = new THREE.LoadingManager();

const roomMenuButtons = Array.from(document.querySelectorAll('[data-room-id]'));
const artworkPanel = document.getElementById('artwork-panel');
const panelTitle = document.getElementById('panel-title');
const panelAuthor = document.getElementById('panel-author');
const panelSection = document.getElementById('panel-section');
const panelTechnique = document.getElementById('panel-technique');
const panelYear = document.getElementById('panel-year');
const panelDescription = document.getElementById('panel-description');
const closePanelBtn = document.getElementById('panel-close');
const prevPanelBtn = document.getElementById('panel-prev');
const nextPanelBtn = document.getElementById('panel-next');
const togglePanelBtn = document.getElementById('panel-toggle-visibility');
const restorePanelBtn = document.getElementById('panel-restore');

manager.onError = function onError(url) {
  console.error(`Error cargando: ${url}`);
};

function updateToggleLabel(toggleButton, hidden) {
  if (!toggleButton) {
    return;
  }
  toggleButton.innerText = hidden ? 'Mostrar ficha' : 'Ocultar ficha';
}

function showArtworkPanel(artwork) {
  if (!artworkPanel || !artwork) {
    return;
  }

  if (panelTitle) {
    panelTitle.innerText = artwork.title || 'Sin t\u00edtulo';
  }
  if (panelAuthor) {
    panelAuthor.innerText = `Artista: ${artwork.author || 'Artista'}`;
  }
  if (panelSection) {
    panelSection.innerText = `Secci\u00f3n: ${artwork.roomTitle || 'Colecci\u00f3n principal'}`;
  }
  if (panelTechnique) {
    panelTechnique.innerText = `T\u00e9cnica: ${artwork.technique || 'No especificada'}`;
  }
  if (panelYear) {
    panelYear.innerText = `A\u00f1o: ${artwork.year || 'Sin fecha'}`;
  }
  if (panelDescription) {
    panelDescription.innerText = artwork.description || 'Sin descripci\u00f3n adicional.';
  }

  artworkPanel.classList.add('visible');
}

function hideArtworkPanel() {
  if (artworkPanel) {
    artworkPanel.classList.remove('visible');
  }
}

function setRestorePanelVisible(isVisible) {
  if (!restorePanelBtn) {
    return;
  }
  restorePanelBtn.classList.toggle('visible', Boolean(isVisible));
}

function createPerfOverlay(enabled) {
  if (!enabled) {
    return null;
  }

  const panel = document.createElement('div');
  panel.style.position = 'absolute';
  panel.style.right = '12px';
  panel.style.top = '12px';
  panel.style.zIndex = '60';
  panel.style.fontFamily = 'Consolas, monospace';
  panel.style.fontSize = '12px';
  panel.style.lineHeight = '1.35';
  panel.style.padding = '8px 10px';
  panel.style.borderRadius = '8px';
  panel.style.background = 'rgba(0,0,0,0.65)';
  panel.style.color = '#d7e6ff';
  panel.style.border = '1px solid rgba(255,255,255,0.2)';
  panel.style.pointerEvents = 'none';
  panel.innerText = 'perf=1';
  document.body.appendChild(panel);
  return panel;
}

function updatePerfOverlay(panel, qualityState) {
  if (!panel || !qualityState) {
    return;
  }

  panel.innerText = [
    `nivel: ${qualityState.level}`,
    `fps~: ${qualityState.averageFps.toFixed(1)}`,
    `ms~: ${qualityState.averageMs.toFixed(2)}`,
    `muestras: ${qualityState.history.length}`
  ].join('\n');
}

async function bootstrap() {
  const deviceProfile = detectDeviceProfile(window);
  const scene = createScene();
  const camera = createCamera();
  const renderer = createRenderer({ deviceProfile });
  setupResize(camera, renderer);

  const content = await loadMuseumContent({ preferBackend: true });
  const rooms = content.rooms;
  const artworks = content.artworks;

  const layout = buildMuseumLayout(rooms, artworks, LAYOUT_CONFIG);

  const textureLoader = new THREE.TextureLoader(manager);
  const woodTexture = textureLoader.load('textures/wood.webp');
  woodTexture.colorSpace = THREE.SRGBColorSpace;
  woodTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  createRoom(scene, woodTexture, layout);
  const lightsController = createLights(scene, layout, { quality: deviceProfile.initialQuality });

  const paintingItems = loadPaintings(scene, {
    placements: layout.placements,
    manager,
    woodTexture
  });
  const interactiveObjects = paintingItems.map((item) => item.group);

  const orbitControls = createControls(camera, renderer.domElement);
  const walkControls = createWalkControls(camera, orbitControls, {
    bounds: layout.bounds,
    walkableZones: layout.walkableZones,
    playerRadius: layout.config.playerRadius
  });
  createJoystick(walkControls);

  const roomWaypointMap = new Map(Object.entries(layout.waypoints));
  walkControls.teleportTo(
    layout.spawn.position.x,
    layout.spawn.position.z,
    layout.spawn.target.x,
    layout.spawn.target.z
  );

  const roomOrder = rooms.slice(0, 4);
  let activeArtworkIndex = -1;
  let panelHiddenWhileFocused = false;
  let interactionsController = null;

  function resetPanelHiddenState() {
    panelHiddenWhileFocused = false;
    interactionsController?.setPanelVisibility(true);
    updateToggleLabel(togglePanelBtn, panelHiddenWhileFocused);
    setRestorePanelVisible(false);
  }

  function focusArtworkByIndex(index) {
    if (!interactionsController || index < 0 || index >= paintingItems.length) {
      return;
    }

    interactionsController.focusPainting(paintingItems[index].group, true);
  }

  function jumpToRoom(roomId) {
    const waypoint = roomWaypointMap.get(roomId);
    if (!waypoint) {
      return;
    }

    if (interactionsController?.isFocused()) {
      interactionsController.clearSelection({ animate: false, notify: true });
    }

    walkControls.teleportTo(
      waypoint.position.x,
      waypoint.position.z,
      waypoint.target.x,
      waypoint.target.z
    );

    trackEvent('room_jump', {
      roomId,
      source: content.source
    });
  }

  function highlightNearestRoomButton() {
    if (roomMenuButtons.length === 0) {
      return;
    }

    let activeRoomId = null;
    let shortestDistance = Number.POSITIVE_INFINITY;

    for (const [roomId, waypoint] of roomWaypointMap.entries()) {
      const dx = camera.position.x - waypoint.position.x;
      const dz = camera.position.z - waypoint.position.z;
      const distance = Math.sqrt((dx * dx) + (dz * dz));
      if (distance < shortestDistance) {
        shortestDistance = distance;
        activeRoomId = roomId;
      }
    }

    for (const btn of roomMenuButtons) {
      btn.classList.toggle('active', btn.dataset.roomId === activeRoomId);
    }
  }

  interactionsController = setupInteractions({
    camera,
    controls: orbitControls,
    scene,
    renderer,
    interactiveObjects,
    onSelect(artwork) {
      activeArtworkIndex = paintingItems.findIndex((item) => item.artwork.id === artwork.id);
      if (panelHiddenWhileFocused) {
        resetPanelHiddenState();
      }
      showArtworkPanel(artwork);

      trackEvent('artwork_focus', {
        artworkId: artwork.id,
        roomId: artwork.roomId || artwork.themeId || null,
        source: content.source
      });
    },
    onDeselect() {
      activeArtworkIndex = -1;
      hideArtworkPanel();
      resetPanelHiddenState();
    }
  });

  if (closePanelBtn) {
    closePanelBtn.addEventListener('click', () => {
      interactionsController?.clearSelection({ animate: true, notify: true });
    });
  }

  if (togglePanelBtn) {
    togglePanelBtn.addEventListener('click', () => {
      if (!interactionsController?.isFocused()) {
        return;
      }

      panelHiddenWhileFocused = !panelHiddenWhileFocused;
      interactionsController.setPanelVisibility(!panelHiddenWhileFocused);
      updateToggleLabel(togglePanelBtn, panelHiddenWhileFocused);

      trackEvent('panel_toggle', {
        hidden: panelHiddenWhileFocused,
        source: content.source
      });

      if (panelHiddenWhileFocused) {
        hideArtworkPanel();
        setRestorePanelVisible(true);
        return;
      }

      const selectedArtwork = interactionsController.getSelectedArtwork();
      if (selectedArtwork) {
        showArtworkPanel(selectedArtwork);
        setRestorePanelVisible(false);
      }
    });
  }

  if (restorePanelBtn) {
    restorePanelBtn.addEventListener('click', () => {
      if (!interactionsController?.isFocused()) {
        setRestorePanelVisible(false);
        return;
      }

      panelHiddenWhileFocused = false;
      interactionsController.setPanelVisibility(true);
      updateToggleLabel(togglePanelBtn, panelHiddenWhileFocused);

      const selectedArtwork = interactionsController.getSelectedArtwork();
      if (selectedArtwork) {
        showArtworkPanel(selectedArtwork);
      }
      setRestorePanelVisible(false);

      trackEvent('panel_toggle', {
        hidden: false,
        source: content.source
      });
    });
  }

  if (prevPanelBtn) {
    prevPanelBtn.addEventListener('click', () => {
      if (paintingItems.length === 0 || activeArtworkIndex < 0) {
        return;
      }
      const prevIndex = (activeArtworkIndex - 1 + paintingItems.length) % paintingItems.length;
      focusArtworkByIndex(prevIndex);
    });
  }

  if (nextPanelBtn) {
    nextPanelBtn.addEventListener('click', () => {
      if (paintingItems.length === 0 || activeArtworkIndex < 0) {
        return;
      }
      const nextIndex = (activeArtworkIndex + 1) % paintingItems.length;
      focusArtworkByIndex(nextIndex);
    });
  }

  for (const btn of roomMenuButtons) {
    btn.addEventListener('click', () => jumpToRoom(btn.dataset.roomId));
  }

  window.addEventListener('keydown', (event) => {
    if (event.repeat) {
      return;
    }

    const targetTag = event.target?.tagName;
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
      return;
    }

    if (event.code === 'Digit1' && roomOrder[0]) jumpToRoom(roomOrder[0].id);
    if (event.code === 'Digit2' && roomOrder[1]) jumpToRoom(roomOrder[1].id);
    if (event.code === 'Digit3' && roomOrder[2]) jumpToRoom(roomOrder[2].id);
    if (event.code === 'Digit4' && roomOrder[3]) jumpToRoom(roomOrder[3].id);
  });

  updateToggleLabel(togglePanelBtn, panelHiddenWhileFocused);
  setRestorePanelVisible(false);

  const qualityState = createAdaptiveQualityState(deviceProfile);
  applyQualityLevel({
    renderer,
    scene,
    lightsController,
    interactionsController
  }, qualityState.level, deviceProfile);

  const perfEnabled = new URLSearchParams(window.location.search).get('perf') === '1';
  const perfPanel = createPerfOverlay(perfEnabled);

  const sessionStartAt = performance.now();
  trackEvent('session_start', {
    source: content.source,
    deviceClass: deviceProfile.deviceClass
  });

  window.addEventListener('beforeunload', () => {
    const durationMs = Math.max(0, Math.round(performance.now() - sessionStartAt));
    trackEvent('session_end', {
      durationMs,
      source: content.source
    });
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const deltaMs = delta * 1000;

    const nextQuality = updateAdaptiveQuality(qualityState, deltaMs, performance.now());
    if (nextQuality) {
      applyQualityLevel({
        renderer,
        scene,
        lightsController,
        interactionsController
      }, nextQuality, deviceProfile);

      trackEvent('quality_change', {
        level: nextQuality,
        avgMs: Number(qualityState.averageMs.toFixed(2))
      });
    }

    walkControls.update(delta);
    interactionsController.update(delta);
    orbitControls.update();
    highlightNearestRoomButton();
    renderer.render(scene, camera);

    updatePerfOverlay(perfPanel, qualityState);
  }

  animate();
}

bootstrap().catch((error) => {
  console.error('No fue posible iniciar el museo', error);
});
