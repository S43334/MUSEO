import { createScene, createRenderer, setupResize } from './core/scene.js';
import { createCamera } from './core/camera.js';
import { createLights } from './core/lights.js';
import { createRoom } from './museum/room.js';
import { loadPaintings } from './museum/paintings.js';
import { createControls } from './controls/controls.js';
import { setupInteractions } from './controls/interactions.js';
import { createWalkControls } from './controls/walkControls.js';

// 1️⃣ Escena, cámara y renderer
const scene = createScene();
const camera = createCamera();
const renderer = createRenderer();

// 2️⃣ Contenido del museo
createLights(scene);
createRoom(scene);
loadPaintings(scene);

// 3️⃣ Controles base (rotación cámara)
const orbitControls = createControls(camera, renderer.domElement);

// 4️⃣ Modo caminar
const walkControls = createWalkControls(camera);

// 5️⃣ Interacciones (highlight + zoom cinematográfico)
const updateInteractionCamera = setupInteractions({
  camera,
  controls: orbitControls,
  scene,
  renderer
});

// 6️⃣ Resize
setupResize(camera, renderer);

// 7️⃣ Loop principal
let lastTime = performance.now();

function animate(time) {
  requestAnimationFrame(animate);

  const delta = (time - lastTime) / 1000;
  lastTime = time;

  // 🚶 Movimiento tipo museo
  walkControls.update(delta);

  // 🎬 Zoom / Highlight
  updateInteractionCamera(delta);

  // 🎥 Rotación cámara
  orbitControls.update();

  renderer.render(scene, camera);
}

animate();
