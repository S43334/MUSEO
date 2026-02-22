import { ARTWORKS, ROOMS, SECTION_DEFINITIONS } from './data.js';

const WING_DIRECTION_ORDER = ['front', 'left', 'right', 'back'];
const WING_VECTORS = {
  front: { x: 0, z: -1 },
  left: { x: -1, z: 0 },
  right: { x: 1, z: 0 },
  back: { x: 0, z: 1 }
};
const PUBLIC_ROOM_BY_WING = {
  front: 'retratos',
  left: 'fantasia',
  right: 'pop',
  back: 'tradicion'
};
const PRIVATE_ROOM_SLUG = 'mielito';
const PRIVATE_CHAMBER_DEFAULT_CENTER = Object.freeze({ x: 46, z: 0 });
const PRIVATE_CHAMBER_WIDTH = 10.8;
const PRIVATE_CHAMBER_MIN_LENGTH = 16;
const PRIVATE_CHAMBER_SPACING = 2.35;
const PRIVATE_CHAMBER_BASE_LENGTH = 4;
const PRIVATE_CHAMBER_CLEARANCE = 12;

export const LAYOUT_CONFIG = {
  height: 7,
  lobbySize: 16,
  wingWidth: 8.8,
  wingPadding: 3.4,
  nicheLength: 4.7,
  sectionGap: 0,
  paintingY: 1.8,
  paintingInset: 0.24,
  playerRadius: 0.35,
  wallPadding: 0.24
};

function isPrivateRoom(room) {
  if (!room) {
    return false;
  }

  if (room.isPrivateRoom) {
    return true;
  }

  const id = String(room.id || '').trim();
  const slug = String(room.slug || '').trim();
  return id === PRIVATE_ROOM_SLUG || slug === PRIVATE_ROOM_SLUG;
}

function compareByArtworkOrder(a, b) {
  const bySort = (a.sortOrder ?? a.sort_order ?? 0) - (b.sortOrder ?? b.sort_order ?? 0);
  if (bySort !== 0) {
    return bySort;
  }
  return (a.id ?? 0) - (b.id ?? 0);
}

export function getPortalHalf(config = LAYOUT_CONFIG, wingWidth = config.wingWidth) {
  const lobbyHalf = config.lobbySize / 2;
  const wingHalf = wingWidth / 2;
  const portalHalf = Math.min(
    wingHalf - (config.wallPadding * 0.5),
    lobbyHalf - 0.9
  );

  return Math.max(wingHalf * 0.68, portalHalf);
}

export function getCorridorHalf(config = LAYOUT_CONFIG, wingWidth = config.wingWidth) {
  const portalHalf = getPortalHalf(config, wingWidth);
  const halfWingLimit = (wingWidth / 2) - config.playerRadius - 0.02;

  return Math.max(
    0.6,
    Math.min(halfWingLimit, portalHalf - config.playerRadius - 0.04)
  );
}

function vecLength(value) {
  return Math.sqrt((value.x * value.x) + (value.z * value.z));
}

function normalizeVec(value) {
  const length = vecLength(value);
  if (length === 0) {
    return { x: 0, z: 0 };
  }
  return { x: value.x / length, z: value.z / length };
}

function buildRightVector(axis) {
  return normalizeVec({ x: -axis.z, z: axis.x });
}

function computeWingExtents(wings) {
  if (!Array.isArray(wings) || wings.length === 0) {
    return {
      minX: 0,
      maxX: 0,
      minZ: 0,
      maxZ: 0
    };
  }

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (const wing of wings) {
    const halfWidth = wing.width / 2;
    const halfLength = wing.length / 2;
    const xExtent = Math.abs(wing.axis.x * halfLength) + Math.abs(wing.right.x * halfWidth);
    const zExtent = Math.abs(wing.axis.z * halfLength) + Math.abs(wing.right.z * halfWidth);

    minX = Math.min(minX, wing.center.x - xExtent);
    maxX = Math.max(maxX, wing.center.x + xExtent);
    minZ = Math.min(minZ, wing.center.z - zExtent);
    maxZ = Math.max(maxZ, wing.center.z + zExtent);
  }

  return { minX, maxX, minZ, maxZ };
}

function resolvePrivateChamberCenter(wings, width) {
  const extents = computeWingExtents(wings);
  const halfWidth = width / 2;
  const minSafeCenterX = extents.maxX + halfWidth + PRIVATE_CHAMBER_CLEARANCE;

  return {
    x: Math.max(PRIVATE_CHAMBER_DEFAULT_CENTER.x, minSafeCenterX),
    z: PRIVATE_CHAMBER_DEFAULT_CENTER.z
  };
}

function buildWingDefinitions(rooms, artworks, config) {
  const publicRooms = rooms
    .filter((room) => !isPrivateRoom(room))
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const usedRoomIds = new Set();

  return WING_DIRECTION_ORDER
    .map((directionId) => {
      const axis = WING_VECTORS[directionId];

      let room = publicRooms.find(
        (entry) => entry.id === PUBLIC_ROOM_BY_WING[directionId] && !usedRoomIds.has(entry.id)
      );

      if (!room) {
        room = publicRooms.find((entry) => !usedRoomIds.has(entry.id)) || null;
      }

      if (!room) {
        return null;
      }

      usedRoomIds.add(room.id);

      const wingArtworks = artworks
        .filter((artwork) => artwork.themeId === room.id && !artwork.isPrivateRoom)
        .slice()
        .sort(compareByArtworkOrder);

      const length =
        (config.wingPadding * 2) +
        (wingArtworks.length * config.nicheLength);

      const lobbyHalf = config.lobbySize / 2;
      const centerOffset = lobbyHalf + (length / 2);
      const right = buildRightVector(axis);

      return {
        id: room.id,
        roomTitle: room.title,
        color: room.color,
        directionId,
        axis,
        right,
        width: config.wingWidth,
        length,
        center: {
          x: axis.x * centerOffset,
          z: axis.z * centerOffset
        },
        artworks: wingArtworks,
        isPrivateRoom: false
      };
    })
    .filter(Boolean);
}

function buildPrivateChamber(rooms, artworks, wings, config) {
  const room = rooms.find((entry) => isPrivateRoom(entry));
  if (!room) {
    return null;
  }

  const chamberArtworks = artworks
    .filter((artwork) => artwork.themeId === room.id || artwork.isPrivateRoom)
    .slice()
    .sort(compareByArtworkOrder);

  const length = Math.max(
    PRIVATE_CHAMBER_MIN_LENGTH,
    PRIVATE_CHAMBER_BASE_LENGTH + (chamberArtworks.length * PRIVATE_CHAMBER_SPACING)
  );
  const center = resolvePrivateChamberCenter(wings, PRIVATE_CHAMBER_WIDTH);

  return {
    id: room.id,
    roomTitle: room.title,
    color: room.color,
    directionId: 'private',
    axis: { x: 0, z: -1 },
    right: { x: 1, z: 0 },
    width: PRIVATE_CHAMBER_WIDTH,
    length,
    center,
    artworks: chamberArtworks,
    spacing: PRIVATE_CHAMBER_SPACING,
    isPrivateRoom: true
  };
}

export function buildPaintingNiches(wing, config = LAYOUT_CONFIG) {
  const halfWidth = wing.width / 2;
  const lobbyHalf = config.lobbySize / 2;

  return wing.artworks.map((artwork, index) => {
    const side = index % 2 === 0 ? 'left' : 'right';
    const sideSign = side === 'left' ? -1 : 1;
    const distanceFromLobby = config.wingPadding + ((index + 0.5) * config.nicheLength);

    const nicheCenter = {
      x: wing.axis.x * (lobbyHalf + distanceFromLobby),
      z: wing.axis.z * (lobbyHalf + distanceFromLobby)
    };

    const inwardNormal = {
      x: wing.right.x * -sideSign,
      z: wing.right.z * -sideSign
    };

    const paintingOffset = (halfWidth - config.paintingInset) * sideSign;
    const paintingPosition = {
      x: nicheCenter.x + (wing.right.x * paintingOffset),
      y: config.paintingY,
      z: nicheCenter.z + (wing.right.z * paintingOffset)
    };

    const rotationY = Math.atan2(inwardNormal.x, inwardNormal.z);

    return {
      artwork,
      wingId: wing.id,
      side,
      nicheIndex: index,
      sectionId: artwork.sectionId,
      sectionTitle: artwork.sectionTitle,
      sectionColor: artwork.sectionColor,
      isSectionStart: false,
      nicheCenter,
      inwardNormal,
      rotationY,
      position: paintingPosition
    };
  });
}

function buildPrivatePaintingNiches(privateChamber, config = LAYOUT_CONFIG) {
  const halfWidth = privateChamber.width / 2;
  const halfLength = privateChamber.length / 2;
  const entryPadding = 2;

  return privateChamber.artworks.map((artwork, index) => {
    const side = index % 2 === 0 ? 'left' : 'right';
    const sideSign = side === 'left' ? -1 : 1;
    const distanceFromEntry = entryPadding + ((index + 0.5) * PRIVATE_CHAMBER_SPACING);

    const nicheCenter = {
      x: privateChamber.center.x,
      z: privateChamber.center.z + halfLength - distanceFromEntry
    };

    const inwardNormal = {
      x: -sideSign,
      z: 0
    };

    const paintingOffset = (halfWidth - config.paintingInset) * sideSign;
    const paintingPosition = {
      x: nicheCenter.x + paintingOffset,
      y: config.paintingY,
      z: nicheCenter.z
    };

    const rotationY = Math.atan2(inwardNormal.x, inwardNormal.z);

    return {
      artwork,
      wingId: privateChamber.id,
      side,
      nicheIndex: index,
      sectionId: artwork.sectionId,
      sectionTitle: artwork.sectionTitle,
      sectionColor: artwork.sectionColor,
      isSectionStart: false,
      nicheCenter,
      inwardNormal,
      rotationY,
      position: paintingPosition
    };
  });
}

export function buildWalkableZones(layout, config = LAYOUT_CONFIG) {
  const halfLobby = config.lobbySize / 2;
  const overlap = 1.2;

  const zones = [
    {
      id: 'lobby',
      minX: -halfLobby + config.playerRadius,
      maxX: halfLobby - config.playerRadius,
      minZ: -halfLobby + config.playerRadius,
      maxZ: halfLobby - config.playerRadius
    }
  ];

  for (const wing of layout.wings) {
    const corridorHalf = getCorridorHalf(config, wing.width);
    const startDistance = halfLobby - overlap;
    const endDistance = halfLobby + wing.length;

    if (wing.directionId === 'front') {
      zones.push({
        id: wing.id,
        minX: -corridorHalf,
        maxX: corridorHalf,
        minZ: -endDistance,
        maxZ: -startDistance
      });
    }

    if (wing.directionId === 'back') {
      zones.push({
        id: wing.id,
        minX: -corridorHalf,
        maxX: corridorHalf,
        minZ: startDistance,
        maxZ: endDistance
      });
    }

    if (wing.directionId === 'left') {
      zones.push({
        id: wing.id,
        minX: -endDistance,
        maxX: -startDistance,
        minZ: -corridorHalf,
        maxZ: corridorHalf
      });
    }

    if (wing.directionId === 'right') {
      zones.push({
        id: wing.id,
        minX: startDistance,
        maxX: endDistance,
        minZ: -corridorHalf,
        maxZ: corridorHalf
      });
    }
  }

  if (layout.privateChamber) {
    const chamber = layout.privateChamber;
    const halfWidth = chamber.width / 2;
    const halfLength = chamber.length / 2;

    zones.push({
      id: chamber.id,
      minX: chamber.center.x - halfWidth + config.playerRadius,
      maxX: chamber.center.x + halfWidth - config.playerRadius,
      minZ: chamber.center.z - halfLength + config.playerRadius,
      maxZ: chamber.center.z + halfLength - config.playerRadius
    });
  }

  return zones;
}

function buildBounds(layout, config = LAYOUT_CONFIG) {
  const halfLobby = config.lobbySize / 2;
  let minX = -halfLobby;
  let maxX = halfLobby;
  let minZ = -halfLobby;
  let maxZ = halfLobby;

  for (const wing of layout.wings) {
    const halfWidth = wing.width / 2;
    const halfLength = wing.length / 2;
    const xExtent = Math.abs(wing.axis.x * halfLength) + Math.abs(wing.right.x * halfWidth);
    const zExtent = Math.abs(wing.axis.z * halfLength) + Math.abs(wing.right.z * halfWidth);

    minX = Math.min(minX, wing.center.x - xExtent);
    maxX = Math.max(maxX, wing.center.x + xExtent);
    minZ = Math.min(minZ, wing.center.z - zExtent);
    maxZ = Math.max(maxZ, wing.center.z + zExtent);
  }

  if (layout.privateChamber) {
    const chamber = layout.privateChamber;
    const halfWidth = chamber.width / 2;
    const halfLength = chamber.length / 2;
    minX = Math.min(minX, chamber.center.x - halfWidth);
    maxX = Math.max(maxX, chamber.center.x + halfWidth);
    minZ = Math.min(minZ, chamber.center.z - halfLength);
    maxZ = Math.max(maxZ, chamber.center.z + halfLength);
  }

  return {
    minX: minX - 2,
    maxX: maxX + 2,
    minZ: minZ - 2,
    maxZ: maxZ + 2
  };
}

function buildWaypoints(wings, privateChamber, config = LAYOUT_CONFIG) {
  const lobbyHalf = config.lobbySize / 2;
  const map = {};

  for (const wing of wings) {
    const waypointDistance = lobbyHalf + config.wingPadding + (config.nicheLength * 0.75);
    const targetDistance = waypointDistance + 3;

    map[wing.id] = {
      roomId: wing.id,
      position: {
        x: wing.axis.x * waypointDistance,
        z: wing.axis.z * waypointDistance
      },
      target: {
        x: wing.axis.x * targetDistance,
        z: wing.axis.z * targetDistance
      }
    };
  }

  if (privateChamber) {
    const entryZ = privateChamber.center.z + (privateChamber.length / 2) - 2.6;
    map[privateChamber.id] = {
      roomId: privateChamber.id,
      position: {
        x: privateChamber.center.x,
        z: entryZ
      },
      target: {
        x: privateChamber.center.x,
        z: entryZ - 4
      }
    };
  }

  return map;
}

export function buildMuseumLayout(
  rooms = ROOMS,
  artworks = ARTWORKS,
  config = LAYOUT_CONFIG
) {
  const wings = buildWingDefinitions(rooms, artworks, config);
  const privateChamber = buildPrivateChamber(rooms, artworks, wings, config);
  const zones = {
    lobby: {
      center: { x: 0, z: 0 },
      size: config.lobbySize
    },
    wings,
    privateChamber
  };

  const placements = [];

  for (const wing of wings) {
    const niches = buildPaintingNiches(wing, config);
    wing.niches = niches;

    for (const niche of niches) {
      const sectionMeta = SECTION_DEFINITIONS[niche.sectionId] || {};
      placements.push({
        ...niche.artwork,
        roomId: wing.id,
        roomTitle: wing.roomTitle,
        wingId: wing.id,
        wingTitle: wing.roomTitle,
        wingColor: wing.color,
        side: niche.side,
        nicheIndex: niche.nicheIndex,
        sectionId: niche.sectionId,
        sectionTitle: niche.sectionTitle || sectionMeta.title || 'Secci\u00f3n',
        sectionColor: niche.sectionColor || sectionMeta.color || wing.color,
        isSectionStart: false,
        nicheCenter: niche.nicheCenter,
        inwardNormal: niche.inwardNormal,
        axis: wing.axis,
        right: wing.right,
        nicheLength: config.nicheLength,
        wingWidth: wing.width,
        focusDistance: 5.6,
        position: niche.position,
        rotationY: niche.rotationY,
        isPrivateRoom: false
      });
    }
  }

  if (privateChamber) {
    const niches = buildPrivatePaintingNiches(privateChamber, config);
    privateChamber.niches = niches;

    for (const niche of niches) {
      const sectionMeta = SECTION_DEFINITIONS[niche.sectionId] || {};
      placements.push({
        ...niche.artwork,
        roomId: privateChamber.id,
        roomTitle: privateChamber.roomTitle,
        wingId: privateChamber.id,
        wingTitle: privateChamber.roomTitle,
        wingColor: privateChamber.color,
        side: niche.side,
        nicheIndex: niche.nicheIndex,
        sectionId: niche.sectionId,
        sectionTitle: niche.sectionTitle || sectionMeta.title || 'Colecci\u00f3n privada',
        sectionColor: niche.sectionColor || sectionMeta.color || privateChamber.color,
        isSectionStart: false,
        nicheCenter: niche.nicheCenter,
        inwardNormal: niche.inwardNormal,
        axis: privateChamber.axis,
        right: privateChamber.right,
        nicheLength: PRIVATE_CHAMBER_SPACING,
        wingWidth: privateChamber.width,
        focusDistance: 4.8,
        position: niche.position,
        rotationY: niche.rotationY,
        isPrivateRoom: true
      });
    }
  }

  const layout = {
    config,
    zones,
    wings,
    privateChamber,
    placements
  };

  layout.walkableZones = buildWalkableZones(layout, config);
  layout.bounds = buildBounds(layout, config);
  layout.waypoints = buildWaypoints(wings, privateChamber, config);
  layout.spawn = {
    position: { x: -4.6, z: 6.8 },
    target: { x: 2, z: 2 }
  };

  return layout;
}
