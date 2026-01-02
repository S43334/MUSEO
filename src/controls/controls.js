import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createControls(camera, dom) {
  const controls = new OrbitControls(camera, dom);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2;
  controls.target.set(0, 1.6, 0);
  controls.update();
  return controls;
}
