import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createControls(camera, dom) {
  const controls = new OrbitControls(camera, dom);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 0.75;
  controls.maxDistance = 12;
  controls.maxPolarAngle = Math.PI / 2.02;
  controls.target.set(0, 1.6, 2);
  controls.update();
  return controls;
}
