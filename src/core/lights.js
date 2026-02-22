import * as THREE from 'three';

function toVecXZ(value) {
  return new THREE.Vector3(value.x, 0, value.z);
}

const QUALITY_LIGHT_PRESETS = {
  high: {
    ambient: 0.46,
    hemi: 0.42,
    lobby: 1.05,
    wing: 0.52,
    artwork: 1.05
  },
  balanced: {
    ambient: 0.34,
    hemi: 0.31,
    lobby: 0.78,
    wing: 0.34,
    artwork: 0.7
  },
  low: {
    ambient: 0.2,
    hemi: 0.2,
    lobby: 0.46,
    wing: 0.16,
    artwork: 0
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

  const artworkLights = [];
  const artworkLightTargets = [];
  for (const placement of layout.placements) {
    const inwardNormal = toVecXZ(placement.inwardNormal).normalize();
    const artworkPos = new THREE.Vector3(
      placement.position.x,
      placement.position.y,
      placement.position.z
    );

    const target = new THREE.Object3D();
    target.position.copy(artworkPos).add(inwardNormal.clone().multiplyScalar(-0.06));
    target.position.y += 0.1;
    scene.add(target);
    artworkLightTargets.push(target);

    const spotlight = new THREE.SpotLight(0xfff2db, 0.8, 5.8, 0.5, 0.46, 1.25);
    spotlight.castShadow = false;
    spotlight.target = target;
    spotlight.position.copy(artworkPos).add(inwardNormal.clone().multiplyScalar(0.45));
    spotlight.position.y += 1.65;
    scene.add(spotlight);
    artworkLights.push(spotlight);
  }

  function setQuality(level = 'balanced') {
    const preset = QUALITY_LIGHT_PRESETS[level] || QUALITY_LIGHT_PRESETS.balanced;

    ambient.intensity = preset.ambient;
    hemi.intensity = preset.hemi;
    lobbyFill.intensity = preset.lobby;

    for (const wingLight of wingLights) {
      wingLight.intensity = preset.wing;
    }

    const artworkIntensity = Math.max(0, preset.artwork ?? 0);
    for (const artworkLight of artworkLights) {
      artworkLight.intensity = artworkIntensity;
      artworkLight.visible = artworkIntensity > 0;
    }
  }

  function dispose() {
    scene.remove(ambient);
    scene.remove(hemi);
    scene.remove(lobbyFill);
    for (const wingLight of wingLights) {
      scene.remove(wingLight);
    }
    for (const artworkLight of artworkLights) {
      scene.remove(artworkLight);
    }
    for (const target of artworkLightTargets) {
      scene.remove(target);
    }
  }

  setQuality(options.quality || 'balanced');

  return {
    setQuality,
    dispose
  };
}
