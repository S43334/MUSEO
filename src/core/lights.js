import * as THREE from 'three';

function toVecXZ(value) {
  return new THREE.Vector3(value.x, 0, value.z);
}

const QUALITY_LIGHT_PRESETS = {
  high: {
    ambient: 0.46,
    hemi: 0.42,
    lobby: 1.05,
    lobbyCore: 0.56,
    lobbyRim: 0.34,
    wing: 0.52,
    artwork: 1.05
  },
  balanced: {
    ambient: 0.34,
    hemi: 0.31,
    lobby: 0.78,
    lobbyCore: 0.38,
    lobbyRim: 0.22,
    wing: 0.34,
    artwork: 0.7
  },
  low: {
    ambient: 0.2,
    hemi: 0.2,
    lobby: 0.46,
    lobbyCore: 0.18,
    lobbyRim: 0.1,
    wing: 0.16,
    artwork: 0
  }
};

export function createLights(scene, layout, options = {}) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.26);
  const hemi = new THREE.HemisphereLight(0x879bc5, 0x06080f, 0.24);
  const lobbyFill = new THREE.PointLight(0xffd6a8, 0.58, 24, 2.1);
  const lobbyCore = new THREE.PointLight(0xffc987, 0.34, 9, 1.95);
  const lobbyTop = new THREE.PointLight(0xfff0cf, 0.3, 12, 1.8);

  scene.add(ambient);
  scene.add(hemi);

  lobbyFill.position.set(0, 6.1, 0);
  lobbyCore.position.set(0, 2.35, 0);
  lobbyTop.position.set(0, 5.15, 0);
  scene.add(lobbyFill);
  scene.add(lobbyCore);
  scene.add(lobbyTop);

  const lobbyRimLights = [];
  const rimRadius = Math.max(3.8, (layout?.config?.lobbySize || 16) / 2.8);
  for (let index = 0; index < 4; index += 1) {
    const angle = (index / 4) * Math.PI * 2;
    const rim = new THREE.PointLight(0xffbd76, 0.18, 7.4, 1.9);
    rim.position.set(
      Math.cos(angle) * rimRadius,
      1.95,
      Math.sin(angle) * rimRadius
    );
    scene.add(rim);
    lobbyRimLights.push(rim);
  }

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
    lobbyCore.intensity = preset.lobbyCore;
    lobbyTop.intensity = Math.max(0.1, preset.lobbyCore * 0.86);

    for (const wingLight of wingLights) {
      wingLight.intensity = preset.wing;
    }
    for (const rim of lobbyRimLights) {
      rim.intensity = preset.lobbyRim;
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
    scene.remove(lobbyCore);
    scene.remove(lobbyTop);
    for (const rim of lobbyRimLights) {
      scene.remove(rim);
    }
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
