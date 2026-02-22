import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createControls(camera, dom) {
  const controls = new OrbitControls(camera, dom);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minDistance = 0.08;
  controls.maxDistance = 0.08;
  controls.minPolarAngle = Math.PI * 0.2;
  controls.maxPolarAngle = Math.PI * 0.92;
  controls.target.set(0, 1.6, 0.72);
  controls.update();
  return controls;
}
