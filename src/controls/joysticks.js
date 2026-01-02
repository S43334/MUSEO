// Este archivo maneja la librería nipple.js
export function createJoystick(walkControls) {
  const zone = document.getElementById('joystick-zone');

  // Configuración del joystick
  const manager = nipplejs.create({
    zone: zone,
    mode: 'static', // Fijo en una posición
    position: { left: '15%', bottom: '15%' }, // Esquina inferior izquierda
    color: 'white',
    size: 100
  });

  // Cuando movemos el joystick
  manager.on('move', (evt, data) => {
    if (data && data.vector) {
      // data.vector.y es arriba(1)/abajo(-1)
      // data.vector.x es derecha(1)/izquierda(-1)
      walkControls.setJoystickInput(data.vector.x, data.vector.y);
    }
  });

  // Cuando soltamos el joystick
  manager.on('end', () => {
    walkControls.setJoystickInput(0, 0);
  });
}