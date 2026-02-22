import { ARTWORKS, ROOMS } from './data.js';

export const LAYOUT_CONFIG = {
  width: 10,
  height: 7,
  entranceZ: 8,
  entrancePadding: 8,
  exitPadding: 8,
  roomPadding: 4,
  roomGap: 6,
  slotSpacing: 4,
  slotsPerSide: 5,
  sideOffset: 4.9,
  paintingY: 1.8
};

export function getRoomDepth(config = LAYOUT_CONFIG) {
  return (config.roomPadding * 2) + ((config.slotsPerSide - 1) * config.slotSpacing);
}

function normalizeRoom(room) {
  return {
    ...room,
    themeIds: room.themeIds && room.themeIds.length > 0 ? room.themeIds : [room.id],
    capacity: room.capacity || LAYOUT_CONFIG.slotsPerSide * 2
  };
}

export function buildRoomSequence(
  rooms = ROOMS,
  artworks = ARTWORKS,
  config = LAYOUT_CONFIG
) {
  const normalizedRooms = rooms.map(normalizeRoom);
  const roomDepth = getRoomDepth(config);
  const firstStartZ = normalizedRooms[0]?.startZ ?? config.entranceZ;

  const expandedRooms = [];
  let currentStartZ = firstStartZ;

  for (const room of normalizedRooms) {
    const matchingArtworks = artworks.filter((artwork) => room.themeIds.includes(artwork.themeId));
    const requiredBlocks = Math.max(1, Math.ceil(matchingArtworks.length / room.capacity));

    for (let blockIndex = 0; blockIndex < requiredBlocks; blockIndex += 1) {
      const blockId = blockIndex === 0 ? room.id : `${room.id}-${blockIndex + 1}`;
      const frontZ = currentStartZ;
      const backZ = frontZ - roomDepth;

      expandedRooms.push({
        ...room,
        id: blockId,
        sourceRoomId: room.id,
        blockIndex,
        isOverflow: blockIndex > 0,
        frontZ,
        backZ,
        centerZ: (frontZ + backZ) / 2,
        startZ: frontZ
      });

      currentStartZ -= roomDepth + config.roomGap;
    }
  }

  const lastBackZ = expandedRooms.length > 0
    ? expandedRooms[expandedRooms.length - 1].backZ
    : firstStartZ - roomDepth;

  return {
    rooms: expandedRooms,
    bounds: {
      minX: -4.8,
      maxX: 4.8,
      minZ: lastBackZ - config.exitPadding,
      maxZ: firstStartZ + config.entrancePadding
    }
  };
}

export function buildRoomSlots(rooms, config = LAYOUT_CONFIG) {
  const slots = [];
  let globalOrder = 0;

  for (const room of rooms) {
    let row = 0;
    let localOrder = 0;

    while (localOrder < room.capacity) {
      const z = room.startZ - config.roomPadding - (row * config.slotSpacing);
      const leftSlot = {
        roomId: room.id,
        sourceRoomId: room.sourceRoomId || room.id,
        side: 'left',
        x: -config.sideOffset,
        y: config.paintingY,
        z,
        rotationY: Math.PI / 2,
        localOrder,
        order: globalOrder
      };
      slots.push(leftSlot);
      localOrder += 1;
      globalOrder += 1;

      if (localOrder < room.capacity) {
        const rightSlot = {
          roomId: room.id,
          sourceRoomId: room.sourceRoomId || room.id,
          side: 'right',
          x: config.sideOffset,
          y: config.paintingY,
          z,
          rotationY: -Math.PI / 2,
          localOrder,
          order: globalOrder
        };
        slots.push(rightSlot);
        localOrder += 1;
        globalOrder += 1;
      }

      row += 1;
    }
  }

  return slots;
}

export function placeArtworksByTheme(artworks, rooms, slots) {
  const queueBySourceRoom = new Map();
  const slotByRoom = new Map();
  const placements = [];

  for (const room of rooms) {
    if (queueBySourceRoom.has(room.sourceRoomId)) {
      continue;
    }

    const queue = artworks
      .filter((artwork) => room.themeIds.includes(artwork.themeId))
      .sort((a, b) => a.id - b.id);

    queueBySourceRoom.set(room.sourceRoomId, queue);
  }

  for (const slot of slots) {
    if (!slotByRoom.has(slot.roomId)) {
      slotByRoom.set(slot.roomId, []);
    }
    slotByRoom.get(slot.roomId).push(slot);
  }

  for (const room of rooms) {
    const roomSlots = (slotByRoom.get(room.id) || []).sort((a, b) => a.order - b.order);
    const queue = queueBySourceRoom.get(room.sourceRoomId) || [];

    for (const slot of roomSlots) {
      const artwork = queue.shift();
      if (!artwork) {
        continue;
      }

      placements.push({
        ...artwork,
        roomId: room.id,
        roomTitle: room.title,
        position: { x: slot.x, y: slot.y, z: slot.z },
        rotationY: slot.rotationY
      });
    }
  }

  if (placements.length < artworks.length) {
    const placedIds = new Set(placements.map((placement) => placement.id));
    const missingIds = artworks
      .filter((artwork) => !placedIds.has(artwork.id))
      .map((artwork) => artwork.id);

    if (missingIds.length > 0) {
      console.warn('Artworks sin sala asignada:', missingIds);
    }
  }

  return placements;
}
