export function createJoystick(walkControls) {
  const zone = document.getElementById('joystick-zone');
  const nav = window?.navigator || {};
  const isTouchDevice = Boolean(
    nav.maxTouchPoints > 0 ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches)
  );

  if (!zone) {
    return;
  }

  if (!isTouchDevice) {
    zone.style.display = 'none';
    return;
  }

  if (typeof nipplejs === 'undefined') {
    return;
  }

  const IDLE_HIDE_DELAY_MS = 1200;
  let hideTimeoutId = null;
  let isDragging = false;

  function clearHideTimer() {
    if (hideTimeoutId !== null) {
      window.clearTimeout(hideTimeoutId);
      hideTimeoutId = null;
    }
  }

  function showJoystick() {
    zone.classList.remove('joystick-idle');
  }

  function scheduleHideJoystick() {
    clearHideTimer();
    hideTimeoutId = window.setTimeout(() => {
      if (!isDragging) {
        zone.classList.add('joystick-idle');
      }
    }, IDLE_HIDE_DELAY_MS);
  }

  const manager = nipplejs.create({
    zone: zone,
    mode: 'static', 
    position: { left: '50%', top: '50%' }, 
    color: 'white',
    size: 100
  });

  zone.classList.add('joystick-idle');

  manager.on('start', () => {
    isDragging = true;
    clearHideTimer();
    showJoystick();
  });

  manager.on('move', (evt, data) => {
    if (data && data.vector) {
      walkControls.setJoystickInput(data.vector.x, data.vector.y);
      showJoystick();
    }
  });

  manager.on('end', () => {
    isDragging = false;
    walkControls.setJoystickInput(0, 0);
    scheduleHideJoystick();
  });

  zone.addEventListener('touchstart', showJoystick, { passive: true });
  zone.addEventListener('pointerdown', showJoystick);
  scheduleHideJoystick();
  
  return manager;
}
