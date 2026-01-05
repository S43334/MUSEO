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

const manager = new THREE.LoadingManager();

const loadingBar = document.getElementById('loading-bar');
const loadingText = document.getElementById('loading-text');
const startBtn = document.getElementById('start-btn');
const loadingContainer = document.getElementById('loading-container');

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
  if (itemsTotal > 0) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    if (loadingBar) loadingBar.style.width = progress + '%';
  }
};

manager.onLoad = function () {
  if (loadingText) loadingText.innerText = "¡LISTO PARA ENTRAR!";
  if (loadingContainer) loadingContainer.style.display = 'none'; 
  if (startBtn) startBtn.style.display = 'inline-block'; 
};

manager.onError = function (url) {
  console.error('Error cargando: ' + url);
  if (loadingText) loadingText.innerText = "CARGA COMPLETADA (CON AVISOS)";
  if (loadingContainer) loadingContainer.style.display = 'none'; 
  if (startBtn) startBtn.style.display = 'inline-block'; 
};

const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();

const textureLoader = new THREE.TextureLoader(manager);
const woodTexture = textureLoader.load('textures/wood.webp');
woodTexture.colorSpace = THREE.SRGBColorSpace;
woodTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

createLights(scene);

createRoom(scene, woodTexture);      
loadPaintings(scene, manager, woodTexture);   

const orbitControls = createControls(camera, renderer.domElement);
const walkControls = createWalkControls(camera, orbitControls);

createJoystick(walkControls);

const updateInteractionCamera = setupInteractions({
  camera,
  controls: orbitControls,
  scene,
  renderer
});

setupResize(camera, renderer);

let lastTime = performance.now();

function animate(time) {
  requestAnimationFrame(animate);
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  walkControls.update(delta);
  updateInteractionCamera(delta);
  orbitControls.update();
  renderer.render(scene, camera);
}

animate();