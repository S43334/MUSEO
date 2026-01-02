import { createScene, createRenderer, setupResize } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { createLights } from './core/lights.js';
import { createRoom } from './museum/room.js';
import { loadPaintings } from './museum/paintings.js';
import { createControls } from './controls/controls.js';
import { setupInteractions } from './controls/interactions.js';
import { createWalkControls } from './controls/walkControls.js';
// Importamos el nuevo joystick
import { createJoystick } from './controls/joystick.js';

const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();

createLights(scene);
createRoom(scene);      
loadPaintings(scene);   

const orbitControls = createControls(camera, renderer.domElement);
const walkControls = createWalkControls(camera, orbitControls);

// Iniciamos el joystick pasándole los controles de movimiento
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