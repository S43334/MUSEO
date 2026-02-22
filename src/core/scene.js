import * as THREE from 'three';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 24, 190);
  return scene;
}

export function createRenderer(options = {}) {
  const deviceProfile = options.deviceProfile || {};
  const isDesktopLike = Boolean(deviceProfile.isDesktopLike);
  const memoryGb = Number(deviceProfile.memoryGb || 4);
  const cpuCores = Number(deviceProfile.cpuCores || 4);
  const dpr = window.devicePixelRatio || 1;
  const ultraLowMobile = !isDesktopLike && (memoryGb <= 1 || cpuCores <= 2);
  const initialPixelRatioLimit = isDesktopLike ? 1.5 : (ultraLowMobile ? 0.95 : 1.15);
  const useAntialias = ultraLowMobile ? (dpr <= 1.2) : true;

  const renderer = new THREE.WebGLRenderer({
    antialias: useAntialias,
    powerPreference: 'high-performance'
  });

  if (!renderer.userData) {
    renderer.userData = {};
  }
  renderer.userData.pixelRatioLimit = initialPixelRatioLimit;

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, initialPixelRatioLimit));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export function setupResize(camera, renderer) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    const limit = renderer.userData?.pixelRatioLimit ?? 1.0;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, limit));
  });
}
