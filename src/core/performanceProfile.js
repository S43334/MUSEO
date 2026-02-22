const QUALITY_ORDER = ['low', 'balanced', 'high'];

function clampQuality(level) {
  if (!QUALITY_ORDER.includes(level)) {
    return 'balanced';
  }
  return level;
}

export function detectDeviceProfile(win = window) {
  const nav = win.navigator || {};
  const isTouch = Boolean(
    nav.maxTouchPoints > 0 ||
    (typeof win.matchMedia === 'function' && win.matchMedia('(pointer: coarse)').matches) ||
    'ontouchstart' in win
  );

  const width = win.innerWidth || 0;
  const dpr = win.devicePixelRatio || 1;
  const memoryGb = nav.deviceMemory || 4;
  const cpuCores = nav.hardwareConcurrency || 4;
  const isDesktopLike = !isTouch && width >= 900;

  let initialQuality = 'balanced';
  if (isDesktopLike && memoryGb >= 8 && cpuCores >= 6) {
    initialQuality = 'high';
  } else if (isTouch || memoryGb <= 4) {
    initialQuality = 'low';
  }

  return {
    deviceClass: isDesktopLike ? 'desktop' : 'mobile',
    isTouch,
    isDesktopLike,
    width,
    dpr,
    memoryGb,
    cpuCores,
    initialQuality
  };
}

export function createAdaptiveQualityState(initialProfile = 'balanced') {
  const isTouchProfile = typeof initialProfile === 'object' && Boolean(initialProfile?.isTouch);
  const initialQuality = typeof initialProfile === 'string'
    ? initialProfile
    : (initialProfile?.initialQuality || 'balanced');

  const maxLevel = isTouchProfile ? 'balanced' : 'high';

  let safeInitial = clampQuality(initialQuality);
  if (QUALITY_ORDER.indexOf(safeInitial) > QUALITY_ORDER.indexOf(maxLevel)) {
    safeInitial = maxLevel;
  }

  return {
    level: safeInitial,
    history: [],
    averageMs: 0,
    averageFps: 0,
    windowSize: 90,
    minSamples: 45,
    evaluateEveryFrames: 30,
    frameSinceEval: 0,
    highFpsThresholdMs: 14,
    lowFpsThresholdMs: 22,
    cooldownMs: 2600,
    lastChangeAt: 0,
    minLevel: 'low',
    maxLevel
  };
}

function pickDowngrade(level) {
  if (level === 'high') return 'balanced';
  if (level === 'balanced') return 'low';
  return 'low';
}

function pickUpgrade(level) {
  if (level === 'low') return 'balanced';
  if (level === 'balanced') return 'high';
  return 'high';
}

export function updateAdaptiveQuality(state, frameDeltaMs, nowMs = performance.now()) {
  if (!Number.isFinite(frameDeltaMs) || frameDeltaMs <= 0) {
    return null;
  }

  state.history.push(frameDeltaMs);
  if (state.history.length > state.windowSize) {
    state.history.shift();
  }

  const sum = state.history.reduce((acc, value) => acc + value, 0);
  state.averageMs = sum / state.history.length;
  state.averageFps = state.averageMs > 0 ? (1000 / state.averageMs) : 0;

  if (state.history.length < state.minSamples) {
    return null;
  }

  state.frameSinceEval += 1;
  if (state.frameSinceEval < state.evaluateEveryFrames) {
    return null;
  }
  state.frameSinceEval = 0;

  if ((nowMs - state.lastChangeAt) < state.cooldownMs) {
    return null;
  }

  let nextLevel = null;

  if (state.averageMs > state.lowFpsThresholdMs) {
    nextLevel = pickDowngrade(state.level);
  } else if (state.averageMs < state.highFpsThresholdMs) {
    nextLevel = pickUpgrade(state.level);
  }

  if (!nextLevel || nextLevel === state.level) {
    return null;
  }

  const minIndex = Math.max(0, QUALITY_ORDER.indexOf(state.minLevel || 'low'));
  const maxIndex = Math.max(minIndex, QUALITY_ORDER.indexOf(state.maxLevel || 'high'));
  const nextIndex = Math.max(minIndex, Math.min(maxIndex, QUALITY_ORDER.indexOf(nextLevel)));
  nextLevel = QUALITY_ORDER[nextIndex];

  if (!nextLevel || nextLevel === state.level) {
    return null;
  }

  state.level = nextLevel;
  state.lastChangeAt = nowMs;
  return nextLevel;
}

function levelPixelRatioLimit(level, deviceProfile) {
  const desktopLike = Boolean(deviceProfile?.isDesktopLike);

  if (level === 'high') {
    return desktopLike ? 1.35 : 1.1;
  }
  if (level === 'balanced') {
    return desktopLike ? 1.1 : 1.0;
  }
  return 0.92;
}

function levelFog(level) {
  if (level === 'high') {
    return { near: 26, far: 165 };
  }
  if (level === 'balanced') {
    return { near: 24, far: 145 };
  }
  return { near: 20, far: 120 };
}

export function applyQualityLevel(context, level, deviceProfile) {
  const safeLevel = clampQuality(level);
  const { renderer, scene, lightsController, interactionsController } = context;

  if (renderer) {
    const limit = levelPixelRatioLimit(safeLevel, deviceProfile);
    renderer.userData.pixelRatioLimit = limit;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, limit));
  }

  if (scene?.fog) {
    const fog = levelFog(safeLevel);
    scene.fog.near = fog.near;
    scene.fog.far = fog.far;
  }

  lightsController?.setQuality?.(safeLevel);
  interactionsController?.setQuality?.(safeLevel);

  return safeLevel;
}
