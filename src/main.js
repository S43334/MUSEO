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
import { ARTWORKS, ROOMS } from './museum/data.js';
import { LAYOUT_CONFIG, buildMuseumLayout } from './museum/layout.js';

const manager = new THREE.LoadingManager();

const loadingBar = document.getElementById('loading-bar');
const loadingText = document.getElementById('loading-text');
const startBtn = document.getElementById('start-btn');
const loadingContainer = document.getElementById('loading-container');

const roomMenuButtons = Array.from(document.querySelectorAll('[data-room-id]'));
const artworkPanel = document.getElementById('artwork-panel');
const panelTitle = document.getElementById('panel-title');
const panelAuthor = document.getElementById('panel-author');
const panelTechnique = document.getElementById('panel-technique');
const panelYear = document.getElementById('panel-year');
const panelDescription = document.getElementById('panel-description');
const closePanelBtn = document.getElementById('panel-close');
const prevPanelBtn = document.getElementById('panel-prev');
const nextPanelBtn = document.getElementById('panel-next');
const togglePanelBtn = document.getElementById('panel-toggle-visibility');

manager.onProgress = function onProgress(url, itemsLoaded, itemsTotal) {
  if (itemsTotal > 0 && loadingBar) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    loadingBar.style.width = `${progress}%`;
  }
};

manager.onLoad = function onLoad() {
  if (loadingText) {
    loadingText.innerText = '¡LISTO PARA ENTRAR!';
  }
  if (loadingContainer) {
    loadingContainer.style.display = 'none';
  }
  if (startBtn) {
    startBtn.style.display = 'inline-block';
  }
};

manager.onError = function onError(url) {
  console.error(`Error cargando: ${url}`);
  if (loadingText) {
    loadingText.innerText = 'CARGA COMPLETADA (CON AVISOS)';
  }
  if (loadingContainer) {
    loadingContainer.style.display = 'none';
  }
  if (startBtn) {
    startBtn.style.display = 'inline-block';
  }
};

const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();
setupResize(camera, renderer);

const layout = buildMuseumLayout(ROOMS, ARTWORKS, LAYOUT_CONFIG);

const textureLoader = new THREE.TextureLoader(manager);
const woodTexture = textureLoader.load('textures/wood.webp');
woodTexture.colorSpace = THREE.SRGBColorSpace;
woodTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

createRoom(scene, woodTexture, layout);
createLights(scene, layout);

const paintingItems = loadPaintings(scene, {
  placements: layout.placements,
  manager,
  woodTexture
});

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

let activeArtworkIndex = -1;
let panelHiddenWhileFocused = false;
let interactionsController = null;

function updateToggleLabel() {
  if (!togglePanelBtn) {
    return;
  }
  togglePanelBtn.innerText = panelHiddenWhileFocused ? 'Mostrar ficha' : 'Ocultar ficha';
}

function showArtworkPanel(artwork) {
  if (!artworkPanel || !artwork || panelHiddenWhileFocused) {
    return;
  }

  if (panelTitle) {
    panelTitle.innerText = artwork.title || 'Sin título';
  }
  if (panelAuthor) {
    panelAuthor.innerText = `Artista: ${artwork.author || 'Artista'}`;
  }
  if (panelTechnique) {
    panelTechnique.innerText = `Técnica: ${artwork.technique || 'No especificada'}`;
  }
  if (panelYear) {
    panelYear.innerText = `Año: ${artwork.year || 'Sin fecha'}`;
  }
  if (panelDescription) {
    panelDescription.innerText = artwork.description || 'Sin descripción adicional.';
  }

  artworkPanel.classList.add('visible');
}

function hideArtworkPanel() {
  if (artworkPanel) {
    artworkPanel.classList.remove('visible');
  }
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
  onSelect(artwork) {
    activeArtworkIndex = paintingItems.findIndex((item) => item.artwork.id === artwork.id);
    if (panelHiddenWhileFocused) {
      hideArtworkPanel();
    } else {
      showArtworkPanel(artwork);
    }
  },
  onDeselect() {
    activeArtworkIndex = -1;
    hideArtworkPanel();
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
    updateToggleLabel();

    if (panelHiddenWhileFocused) {
      hideArtworkPanel();
      return;
    }

    const selectedArtwork = interactionsController.getSelectedArtwork();
    if (selectedArtwork) {
      showArtworkPanel(selectedArtwork);
    }
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

  if (event.code === 'Digit1' && ROOMS[0]) jumpToRoom(ROOMS[0].id);
  if (event.code === 'Digit2' && ROOMS[1]) jumpToRoom(ROOMS[1].id);
  if (event.code === 'Digit3' && ROOMS[2]) jumpToRoom(ROOMS[2].id);
  if (event.code === 'Digit4' && ROOMS[3]) jumpToRoom(ROOMS[3].id);
});

updateToggleLabel();

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  walkControls.update(delta);
  interactionsController.update(delta);
  orbitControls.update();
  highlightNearestRoomButton();
  renderer.render(scene, camera);
}

animate();
