import nipplejs from 'nipplejs';

export function createJoystick(walkControls) {
  const zone = document.getElementById('joystick-zone');
  
  if (!zone) {
    return;
  }

  const manager = nipplejs.create({
    zone: zone,
    mode: 'static', 
    position: { left: '50%', top: '50%' }, 
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
  
  return manager;
}