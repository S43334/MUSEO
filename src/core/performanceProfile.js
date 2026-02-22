const QUALITY_ORDER = ['low', 'balanced', 'high'];

function clampQuality(level) {
  if (!QUALITY_ORDER.includes(level)) {
    return 'balanced';
  }
  return level;
}

export function detectDeviceProfile(win = window) {
  const nav = win.navigator || {};
  const coarsePointer = typeof win.matchMedia === 'function'
    ? win.matchMedia('(pointer: coarse)').matches
    : false;
  const hasFinePointer = typeof win.matchMedia === 'function'
    ? (win.matchMedia('(pointer: fine)').matches || win.matchMedia('(any-pointer: fine)').matches)
    : false;
  const canHover = typeof win.matchMedia === 'function'
    ? (win.matchMedia('(hover: hover)').matches || win.matchMedia('(any-hover: hover)').matches)
    : false;

  const isTouch = Boolean(
    nav.maxTouchPoints > 0 ||
    coarsePointer ||
    'ontouchstart' in win
  );

  const width = win.innerWidth || 0;
  const dpr = win.devicePixelRatio || 1;
  const memoryGb = nav.deviceMemory || 4;
  const cpuCores = nav.hardwareConcurrency || 4;
  const isDesktopLike = width >= 900 && hasFinePointer && canHover;

  let initialQuality = 'low';
  if (isDesktopLike) {
    initialQuality = 'high';
  } else if (!isTouch && width >= 760 && memoryGb >= 4 && cpuCores >= 4) {
    initialQuality = 'balanced';
  }

  return {
    deviceClass: isDesktopLike ? 'desktop' : 'mobile',
    isTouch,
    isDesktopLike,
    hasFinePointer,
    canHover,
    width,
    dpr,
    memoryGb,
    cpuCores,
    initialQuality
  };
}

export function createAdaptiveQualityState(initialProfile = 'balanced') {
  const isDesktopLikeProfile = typeof initialProfile === 'object'
    ? Boolean(initialProfile?.isDesktopLike)
    : initialProfile === 'high';
  const initialQuality = typeof initialProfile === 'string'
    ? initialProfile
    : (initialProfile?.initialQuality || 'balanced');

  const minLevel = isDesktopLikeProfile ? 'balanced' : 'low';
  const maxLevel = isDesktopLikeProfile ? 'high' : 'balanced';

  let safeInitial = clampQuality(initialQuality);
  if (QUALITY_ORDER.indexOf(safeInitial) < QUALITY_ORDER.indexOf(minLevel)) {
    safeInitial = minLevel;
  }
  if (QUALITY_ORDER.indexOf(safeInitial) > QUALITY_ORDER.indexOf(maxLevel)) {
    safeInitial = maxLevel;
  }

  return {
    level: safeInitial,
    history: [],
    averageMs: 0,
    averageFps: 0,
    windowSize: isDesktopLikeProfile ? 120 : 90,
    minSamples: isDesktopLikeProfile ? 60 : 45,
    evaluateEveryFrames: isDesktopLikeProfile ? 36 : 30,
    frameSinceEval: 0,
    highFpsThresholdMs: isDesktopLikeProfile ? 14 : 15,
    lowFpsThresholdMs: isDesktopLikeProfile ? 26 : 23,
    cooldownMs: isDesktopLikeProfile ? 4200 : 3000,
    lastChangeAt: 0,
    minLevel,
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
    return desktopLike ? 1.5 : 1.2;
  }
  if (level === 'balanced') {
    return desktopLike ? 1.22 : 1.08;
  }
  return desktopLike ? 1.0 : 0.95;
}

function levelFog(level) {
  if (level === 'high') {
    return { near: 24, far: 190 };
  }
  if (level === 'balanced') {
    return { near: 22, far: 172 };
  }
  return { near: 18, far: 135 };
}

export function applyQualityLevel(context, level, deviceProfile) {
  const safeLevel = clampQuality(level);
  const { renderer, scene, lightsController, interactionsController } = context;

  if (renderer) {
    const limit = levelPixelRatioLimit(safeLevel, deviceProfile);
    if (!renderer.userData) {
      renderer.userData = {};
    }
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
