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
import {
  LAYOUT_CONFIG,
  buildRoomSequence,
  buildRoomSlots,
  placeArtworksByTheme
} from './museum/layout.js';

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

manager.onProgress = function onProgress(url, itemsLoaded, itemsTotal) {
  if (itemsTotal > 0 && loadingBar) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    loadingBar.style.width = `${progress}%`;
  }
};

manager.onLoad = function onLoad() {
  if (loadingText) {
    loadingText.innerText = 'LISTO PARA ENTRAR!';
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

const layout = buildRoomSequence(ROOMS, ARTWORKS, LAYOUT_CONFIG);
const slots = buildRoomSlots(layout.rooms, LAYOUT_CONFIG);
const placements = placeArtworksByTheme(ARTWORKS, layout.rooms, slots);

const textureLoader = new THREE.TextureLoader(manager);
const woodTexture = textureLoader.load('textures/wood.webp');
woodTexture.colorSpace = THREE.SRGBColorSpace;
woodTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

createRoom(scene, woodTexture, { ...layout, config: LAYOUT_CONFIG });
createLights(scene, layout.rooms);

const paintingItems = loadPaintings(scene, {
  placements,
  manager,
  woodTexture
});

const orbitControls = createControls(camera, renderer.domElement);
const walkControls = createWalkControls(camera, orbitControls, layout.bounds);
createJoystick(walkControls);

const roomWaypointMap = new Map();
for (const template of ROOMS) {
  const roomBlock = layout.rooms.find((room) => room.sourceRoomId === template.id);
  if (roomBlock) {
    roomWaypointMap.set(template.id, roomBlock);
  }
}

let activeArtworkIndex = -1;
let interactionsController = null;

function showArtworkPanel(artwork) {
  if (!artworkPanel || !artwork) {
    return;
  }

  if (panelTitle) {
    panelTitle.innerText = artwork.title || 'Sin titulo';
  }
  if (panelAuthor) {
    panelAuthor.innerText = `Artista: ${artwork.author || 'Artista'}`;
  }
  if (panelTechnique) {
    panelTechnique.innerText = `Tecnica: ${artwork.technique || 'No especificada'}`;
  }
  if (panelYear) {
    panelYear.innerText = `Ano: ${artwork.year || 'Sin fecha'}`;
  }
  if (panelDescription) {
    panelDescription.innerText = artwork.description || 'Sin descripcion adicional.';
  }

  artworkPanel.classList.add('visible');
}

function hideArtworkPanel() {
  if (artworkPanel) {
    artworkPanel.classList.remove('visible');
  }
}

function focusArtworkByIndex(index) {
  if (!interactionsController) {
    return;
  }

  if (index < 0 || index >= paintingItems.length) {
    return;
  }

  const selected = paintingItems[index];
  interactionsController.focusPainting(selected.group, true);
}

function jumpToRoom(roomId) {
  const waypoint = roomWaypointMap.get(roomId);
  if (!waypoint) {
    return;
  }

  if (interactionsController && interactionsController.isZoomed()) {
    interactionsController.clearSelection({ animate: false, notify: true });
  }

  const viewZ = waypoint.centerZ + 8;
  camera.position.set(0, 1.6, viewZ);
  orbitControls.target.set(0, 1.6, waypoint.centerZ);
  orbitControls.update();
}

function highlightNearestRoomButton() {
  if (roomMenuButtons.length === 0) {
    return;
  }

  let activeRoomId = null;
  let shortestDistance = Number.POSITIVE_INFINITY;

  for (const [roomId, waypoint] of roomWaypointMap.entries()) {
    const distance = Math.abs(camera.position.z - waypoint.centerZ);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      activeRoomId = roomId;
    }
  }

  for (const btn of roomMenuButtons) {
    const isActive = btn.dataset.roomId === activeRoomId;
    btn.classList.toggle('active', isActive);
  }
}

interactionsController = setupInteractions({
  camera,
  controls: orbitControls,
  scene,
  renderer,
  onSelect(artwork) {
    activeArtworkIndex = paintingItems.findIndex((item) => item.artwork.id === artwork.id);
    showArtworkPanel(artwork);
  },
  onDeselect() {
    activeArtworkIndex = -1;
    hideArtworkPanel();
  }
});

if (closePanelBtn) {
  closePanelBtn.addEventListener('click', () => {
    if (!interactionsController) {
      hideArtworkPanel();
      return;
    }
    interactionsController.clearSelection({ animate: true, notify: true });
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
  btn.addEventListener('click', () => {
    jumpToRoom(btn.dataset.roomId);
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

  if (event.code === 'Digit1' && ROOMS[0]) jumpToRoom(ROOMS[0].id);
  if (event.code === 'Digit2' && ROOMS[1]) jumpToRoom(ROOMS[1].id);
  if (event.code === 'Digit3' && ROOMS[2]) jumpToRoom(ROOMS[2].id);
  if (event.code === 'Digit4' && ROOMS[3]) jumpToRoom(ROOMS[3].id);
});

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
