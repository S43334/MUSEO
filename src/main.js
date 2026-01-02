import { createScene, createRenderer, setupResize } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { createLights } from './core/lights.js';
import { createRoom } from './museum/room.js';
import { loadPaintings } from './museum/paintings.js';
import { createControls } from './controls/controls.js';
import { setupInteractions } from './controls/interactions.js';
import { createWalkControls } from './controls/walkControls.js';

const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();

createLights(scene);
createRoom(scene);      // Crea el pasillo
loadPaintings(scene);   // Cuelga los cuadros

const orbitControls = createControls(camera, renderer.domElement);
const walkControls = createWalkControls(camera, orbitControls);

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