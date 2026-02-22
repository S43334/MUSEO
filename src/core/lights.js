import * as THREE from 'three';

function toVecXZ(value) {
  return new THREE.Vector3(value.x, 0, value.z);
}

const QUALITY_LIGHT_PRESETS = {
  high: {
    ambient: 0.46,
    hemi: 0.42,
    lobby: 1.05,
    wing: 0.52
  },
  balanced: {
    ambient: 0.34,
    hemi: 0.31,
    lobby: 0.78,
    wing: 0.34
  },
  low: {
    ambient: 0.2,
    hemi: 0.2,
    lobby: 0.46,
    wing: 0.16
  }
};

export function createLights(scene, layout, options = {}) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.26);
  const hemi = new THREE.HemisphereLight(0x879bc5, 0x06080f, 0.24);
  const lobbyFill = new THREE.PointLight(0xffd6a8, 0.58, 24, 2.1);

  scene.add(ambient);
  scene.add(hemi);

  lobbyFill.position.set(0, 6.1, 0);
  scene.add(lobbyFill);

  const wingLights = [];
  for (const wing of layout.wings) {
    const axis = toVecXZ(wing.axis);
    const entranceLight = new THREE.PointLight(new THREE.Color(wing.color), 0.24, 11, 2.2);
    entranceLight.position.copy(axis.clone().multiplyScalar((layout.config.lobbySize / 2) + 1.2));
    entranceLight.position.y = 5.2;
    scene.add(entranceLight);
    wingLights.push(entranceLight);
  }

  function setQuality(level = 'balanced') {
    const preset = QUALITY_LIGHT_PRESETS[level] || QUALITY_LIGHT_PRESETS.balanced;

    ambient.intensity = preset.ambient;
    hemi.intensity = preset.hemi;
    lobbyFill.intensity = preset.lobby;

    for (const wingLight of wingLights) {
      wingLight.intensity = preset.wing;
    }
  }

  function dispose() {
    scene.remove(ambient);
    scene.remove(hemi);
    scene.remove(lobbyFill);
    for (const wingLight of wingLights) {
      scene.remove(wingLight);
    }
  }

  setQuality(options.quality || 'balanced');

  return {
    setQuality,
    dispose
  };
}
