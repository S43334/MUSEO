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
import { loadMuseumContentWithPrivate } from './services/contentRepository.js';
import {
  fetchPrivateCatalog,
  isBackendConfigured,
  trackEvent
} from './services/backendClient.js';
import { LAYOUT_CONFIG, buildMuseumLayout } from './museum/layout.js';

const manager = new THREE.LoadingManager();
const PRIVATE_ROOM_SLUG = 'mielito';
const PRIVATE_CACHE_KEY = 'museo.privateCatalog.v1';
const PRIVATE_FETCH_TIMEOUT_MS = 9000;

const roomMenu = document.getElementById('room-menu');
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
const artworkNav = document.getElementById('artwork-nav');
const prevNavBtn = document.getElementById('nav-prev');
const nextNavBtn = document.getElementById('nav-next');
const privateRoomModal = document.getElementById('private-room-modal');
const privateRoomPasswordInput = document.getElementById('private-room-password');
const privateRoomError = document.getElementById('private-room-error');
const privateRoomCancelBtn = document.getElementById('private-room-cancel');
const privateRoomSubmitBtn = document.getElementById('private-room-submit');

manager.onError = function onError(url) {
  console.error(`Error cargando: ${url}`);
};

function readPrivateCatalogCache() {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return null;
  }

  const raw = window.sessionStorage.getItem(PRIVATE_CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    const expiresAtRaw = parsed?.expires_at;
    const expiresAtMs = Date.parse(String(expiresAtRaw || ''));
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
      window.sessionStorage.removeItem(PRIVATE_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    window.sessionStorage.removeItem(PRIVATE_CACHE_KEY);
    return null;
  }
}

function savePrivateCatalogCache(payload) {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return;
  }
  window.sessionStorage.setItem(PRIVATE_CACHE_KEY, JSON.stringify(payload));
}

function clearPrivateCatalogCache() {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return;
  }
  window.sessionStorage.removeItem(PRIVATE_CACHE_KEY);
}

function setPrivateModalVisible(isVisible) {
  if (!privateRoomModal) {
    return;
  }

  if (isVisible) {
    privateRoomModal.removeAttribute('hidden');
  } else {
    privateRoomModal.setAttribute('hidden', '');
  }
}

function setPrivateModalError(message = '') {
  if (!privateRoomError) {
    return;
  }
  privateRoomError.textContent = message || '';
}

function setPrivateModalLoading(isLoading) {
  if (privateRoomSubmitBtn) {
    privateRoomSubmitBtn.disabled = Boolean(isLoading);
    privateRoomSubmitBtn.textContent = isLoading ? 'Verificando...' : 'Desbloquear';
  }
  if (privateRoomCancelBtn) {
    privateRoomCancelBtn.disabled = Boolean(isLoading);
  }
  if (privateRoomPasswordInput) {
    privateRoomPasswordInput.disabled = Boolean(isLoading);
  }
}

function updateToggleLabel(toggleButton, hidden) {
  if (!toggleButton) {
    return;
  }
  toggleButton.innerText = hidden ? 'Mostrar ficha' : 'Ocultar ficha';
}

function renderArtworkPanelContent(artwork) {
  if (!artwork) {
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
}

function showArtworkPanel(artwork) {
  if (!artworkPanel || !artwork) {
    return;
  }

  renderArtworkPanelContent(artwork);

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

function setArtworkNavVisible(isVisible) {
  if (!artworkNav) {
    return;
  }
  artworkNav.classList.toggle('visible', Boolean(isVisible));
}

function summarizeRoomLabel(room) {
  const label = String(room?.title || room?.id || '').trim();
  if (!label) {
    return 'Sala';
  }

  const truncated = label.length > 28
    ? `${label.slice(0, 28).trim()}...`
    : label;
  return truncated;
}

function renderRoomMenu({
  rooms = [],
  isPrivateUnlocked = false,
  onJumpRoom,
  onUnlockPrivate,
  onLockPrivate,
  backendAvailable = false
}) {
  if (!roomMenu) {
    return [];
  }

  roomMenu.innerHTML = '';
  const buttons = [];

  const publicRooms = rooms.filter((room) => !room.isPrivateRoom);
  const privateRoom = rooms.find((room) => room.isPrivateRoom || room.id === PRIVATE_ROOM_SLUG) || null;

  publicRooms.forEach((room, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'room-btn';
    button.dataset.roomId = room.id;
    button.textContent = `${index + 1}. ${summarizeRoomLabel(room)}`;
    button.addEventListener('click', () => onJumpRoom?.(room.id));
    roomMenu.appendChild(button);
    buttons.push(button);
  });

  const privateButton = document.createElement('button');
  privateButton.type = 'button';
  privateButton.className = 'room-btn locked';
  privateButton.dataset.roomId = privateRoom?.id || PRIVATE_ROOM_SLUG;
  privateButton.textContent = `${publicRooms.length + 1}. ${privateRoom?.title || 'Secreto'}${isPrivateUnlocked ? '' : ' 🔒'}`;

  if (!backendAvailable && !isPrivateUnlocked) {
    privateButton.disabled = true;
    privateButton.title = 'Sala privada no disponible sin backend';
  } else if (isPrivateUnlocked && privateRoom) {
    privateButton.classList.remove('locked');
    privateButton.addEventListener('click', () => onJumpRoom?.(privateRoom.id));
  } else {
    privateButton.addEventListener('click', () => onUnlockPrivate?.());
  }

  roomMenu.appendChild(privateButton);
  buttons.push(privateButton);

  if (isPrivateUnlocked) {
    const lockButton = document.createElement('button');
    lockButton.type = 'button';
    lockButton.className = 'room-btn secondary';
    lockButton.textContent = 'Bloquear sala';
    lockButton.addEventListener('click', () => onLockPrivate?.());
    roomMenu.appendChild(lockButton);
  }

  return buttons;
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

function updatePerfOverlay(panel, qualityState, renderer, focusedTextureSource = '-') {
  if (!panel || !qualityState) {
    return;
  }

  const pixelRatio = renderer?.getPixelRatio ? renderer.getPixelRatio() : 0;

  panel.innerText = [
    `nivel: ${qualityState.level}`,
    `fps~: ${qualityState.averageFps.toFixed(1)}`,
    `ms~: ${qualityState.averageMs.toFixed(2)}`,
    `pr: ${pixelRatio.toFixed(2)}`,
    `tex: ${focusedTextureSource}`,
    `muestras: ${qualityState.history.length}`
  ].join('\n');
}

async function bootstrap() {
  const deviceProfile = detectDeviceProfile(window);
  const scene = createScene();
  const camera = createCamera();
  const renderer = createRenderer({ deviceProfile });
  setupResize(camera, renderer);

  const privateCachePayload = readPrivateCatalogCache();
  const content = await loadMuseumContentWithPrivate({
    preferBackend: true,
    backendTimeoutMs: 6000,
    privatePayload: privateCachePayload
  });
  const rooms = content.rooms;
  const artworks = content.artworks;
  const backendAvailable = isBackendConfigured();
  const privateRoom = rooms.find((room) => room.isPrivateRoom || room.id === PRIVATE_ROOM_SLUG) || null;
  let privateUnlocked = Boolean(privateRoom && privateCachePayload);

  const layout = buildMuseumLayout(rooms, artworks, LAYOUT_CONFIG);
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

  const textureLoader = new THREE.TextureLoader(manager);
  const woodTexture = textureLoader.load('textures/wood.webp', (loadedTexture) => {
    loadedTexture.colorSpace = THREE.SRGBColorSpace;
    loadedTexture.anisotropy = maxAnisotropy;
  });

  createRoom(scene, woodTexture, layout);
  const lightsController = createLights(scene, layout, { quality: deviceProfile.initialQuality });

  const paintingItems = loadPaintings(scene, {
    placements: layout.placements,
    manager,
    woodTexture,
    maxAnisotropy
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

  const publicRoomOrder = rooms.filter((room) => !room.isPrivateRoom).slice(0, 4);
  let roomMenuButtons = [];
  let activeArtworkIndex = -1;
  let panelHiddenWhileFocused = false;
  let interactionsController = null;

  function getFocusedTextureSource() {
    if (activeArtworkIndex < 0) {
      return '-';
    }

    return paintingItems[activeArtworkIndex]?.group?.userData?.textureState?.current || '-';
  }

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

  function shiftArtworkFocus(step) {
    if (paintingItems.length === 0 || activeArtworkIndex < 0) {
      return;
    }
    const targetIndex = (activeArtworkIndex + step + paintingItems.length) % paintingItems.length;
    focusArtworkByIndex(targetIndex);
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

  function closePrivateRoomModal() {
    setPrivateModalVisible(false);
    setPrivateModalError('');
    setPrivateModalLoading(false);
    if (privateRoomPasswordInput) {
      privateRoomPasswordInput.value = '';
    }
  }

  async function unlockPrivateRoom() {
    if (!backendAvailable) {
      setPrivateModalError('Backend no disponible para desbloquear esta sala.');
      return;
    }

    const password = privateRoomPasswordInput?.value?.trim() || '';
    if (!password) {
      setPrivateModalError('Ingresa una contraseña.');
      return;
    }

    setPrivateModalError('');
    setPrivateModalLoading(true);

    try {
      const payload = await fetchPrivateCatalog(password, { timeoutMs: PRIVATE_FETCH_TIMEOUT_MS });
      const expiresAt = Date.parse(String(payload?.expires_at || ''));
      if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        throw new Error('Respuesta inválida del catálogo privado');
      }

      savePrivateCatalogCache(payload);
      await trackEvent('private_room_unlock', {
        source: content.source,
        success: true
      });
      window.location.reload();
    } catch (error) {
      console.warn('[private-room] unlock failed', error);
      setPrivateModalLoading(false);
      setPrivateModalError('No se pudo desbloquear la sala. Verifica la contraseña.');
      trackEvent('private_room_unlock', {
        source: content.source,
        success: false
      });
    }
  }

  function lockPrivateRoom() {
    clearPrivateCatalogCache();
    privateUnlocked = false;
    trackEvent('private_room_lock', {
      source: content.source
    });
    window.location.reload();
  }

  function openPrivateRoomModal() {
    setPrivateModalVisible(true);
    setPrivateModalError('');
    setPrivateModalLoading(false);
    if (privateRoomPasswordInput) {
      privateRoomPasswordInput.value = '';
      privateRoomPasswordInput.focus();
    }
  }

  function rerenderRoomMenu() {
    roomMenuButtons = renderRoomMenu({
      rooms,
      isPrivateUnlocked: privateUnlocked,
      backendAvailable,
      onJumpRoom: jumpToRoom,
      onUnlockPrivate: openPrivateRoomModal,
      onLockPrivate: lockPrivateRoom
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
      if (!btn.dataset.roomId) {
        continue;
      }
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
      const selectedItem = activeArtworkIndex >= 0 ? paintingItems[activeArtworkIndex] : null;

      if (deviceProfile.isDesktopLike && selectedItem?.ensureOriginalTexture) {
        selectedItem.ensureOriginalTexture().catch((error) => {
          console.warn('[paintings] fallback a textura web por error en original', error);
        });
      }

      renderArtworkPanelContent(artwork);
      if (panelHiddenWhileFocused) {
        hideArtworkPanel();
        setRestorePanelVisible(true);
      } else {
        showArtworkPanel(artwork);
      }
      setArtworkNavVisible(true);

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
      setArtworkNavVisible(false);
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
    prevPanelBtn.addEventListener('click', () => shiftArtworkFocus(-1));
  }

  if (nextPanelBtn) {
    nextPanelBtn.addEventListener('click', () => shiftArtworkFocus(1));
  }

  if (prevNavBtn) {
    prevNavBtn.addEventListener('click', () => shiftArtworkFocus(-1));
  }

  if (nextNavBtn) {
    nextNavBtn.addEventListener('click', () => shiftArtworkFocus(1));
  }

  rerenderRoomMenu();

  if (privateRoomCancelBtn) {
    privateRoomCancelBtn.addEventListener('click', closePrivateRoomModal);
  }

  if (privateRoomSubmitBtn) {
    privateRoomSubmitBtn.addEventListener('click', () => {
      unlockPrivateRoom();
    });
  }

  if (privateRoomModal) {
    privateRoomModal.addEventListener('click', (event) => {
      if (event.target === privateRoomModal) {
        closePrivateRoomModal();
      }
    });
  }

  if (privateRoomPasswordInput) {
    privateRoomPasswordInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        unlockPrivateRoom();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        closePrivateRoomModal();
      }
    });
  }

  window.addEventListener('keydown', (event) => {
    if (event.repeat) {
      return;
    }

    const targetTag = event.target?.tagName;
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
      return;
    }

    if (event.code === 'Digit1' && publicRoomOrder[0]) jumpToRoom(publicRoomOrder[0].id);
    if (event.code === 'Digit2' && publicRoomOrder[1]) jumpToRoom(publicRoomOrder[1].id);
    if (event.code === 'Digit3' && publicRoomOrder[2]) jumpToRoom(publicRoomOrder[2].id);
    if (event.code === 'Digit4' && publicRoomOrder[3]) jumpToRoom(publicRoomOrder[3].id);
    if (event.code === 'Digit5') {
      if (privateUnlocked && privateRoom) {
        jumpToRoom(privateRoom.id);
      } else if (backendAvailable) {
        openPrivateRoomModal();
      }
    }
    if (event.code === 'Escape' && !privateRoomModal?.hasAttribute('hidden')) {
      closePrivateRoomModal();
    }
  });

  updateToggleLabel(togglePanelBtn, panelHiddenWhileFocused);
  setRestorePanelVisible(false);
  setArtworkNavVisible(false);

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
    if (orbitControls.enabled) {
      orbitControls.update();
    }
    highlightNearestRoomButton();
    renderer.render(scene, camera);

    updatePerfOverlay(perfPanel, qualityState, renderer, getFocusedTextureSource());
  }

  animate();
}

bootstrap().catch((error) => {
  console.error('No fue posible iniciar el museo', error);
});
