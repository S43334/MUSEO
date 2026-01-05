export function createJoystick(walkControls) {
  const zone = document.getElementById('joystick-zone');

  const manager = nipplejs.create({
    zone: zone,
    mode: 'static', 
    position: { left: '15%', bottom: '15%' }, 
    color: 'white',
    size: 100
  });

  manager.on('move', (evt, data) => {
    if (data && data.vector) {
      walkControls.setJoystickInput(data.vector.x, data.vector.y);
    }
  });

  manager.on('end', () => {
    walkControls.setJoystickInput(0, 0);
  });
}