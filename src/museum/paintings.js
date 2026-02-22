import * as THREE from 'three';
import { createFramedPainting, updateFramedPaintingAspect } from './frame.js';
import { createPlaque } from './plaque.js';

function applyTextureQuality(texture, maxAnisotropy = 0) {
  texture.colorSpace = THREE.SRGBColorSpace;
  if (maxAnisotropy > 0) {
    texture.anisotropy = maxAnisotropy;
  }
}

function resolvePaintingSurface(group) {
  let paintingSurface = null;
  group.traverse((child) => {
    if (paintingSurface || !child.userData?.isPaintingSurface) {
      return;
    }
    paintingSurface = child;
  });
  return paintingSurface;
}

function loadTextureAsync(loader, url, maxAnisotropy = 0) {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        applyTextureQuality(texture, maxAnisotropy);
        resolve(texture);
      },
      undefined,
      reject
    );
  });
}

function resolveArtworkAspect(artwork) {
  const directAspect = Number(artwork.imageAspect);
  if (Number.isFinite(directAspect) && directAspect > 0) {
    return directAspect;
  }

  const width = Number(artwork.imageWidth);
  const height = Number(artwork.imageHeight);
  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
    return width / height;
  }

  return null;
}

export function loadPaintings(scene, { placements, manager, woodTexture, maxAnisotropy = 0 }) {
  const loader = new THREE.TextureLoader(manager);
  const instances = [];

  placements.forEach((artwork, index) => {
    const initialUrl = artwork.imageWebUrl || artwork.image;
    const initialAspect = resolveArtworkAspect(artwork);
    let paintingGroup = null;
    let plaque = null;

    const texture = loader.load(
      initialUrl,
      () => {
        applyTextureQuality(texture, maxAnisotropy);

        if (initialAspect || !paintingGroup || !texture.image) {
          return;
        }

        const width = Number(texture.image.width);
        const height = Number(texture.image.height);
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
          return;
        }

        const fallbackAspect = width / height;
        const updated = updateFramedPaintingAspect(paintingGroup, fallbackAspect);
        if (!updated) {
          return;
        }

        artwork.imageAspect = fallbackAspect;
        artwork.imageWidth = width;
        artwork.imageHeight = height;

        if (plaque) {
          const frameHeight = paintingGroup.userData?.frameSize?.height || 2.15;
          plaque.position.y = -(frameHeight / 2) - 0.33;
        }
      }
    );
    applyTextureQuality(texture, maxAnisotropy);

    paintingGroup = createFramedPainting({
      texture,
      woodTexture,
      aspect: initialAspect
    });
    const paintingSurface = resolvePaintingSurface(paintingGroup);

    const textureState = {
      current: artwork.imageOriginalUrl && initialUrl === artwork.imageOriginalUrl ? 'original' : 'web',
      webUrl: artwork.imageWebUrl || initialUrl || null,
      originalUrl: artwork.imageOriginalUrl || null,
      originalLoaded: Boolean(artwork.imageOriginalUrl && initialUrl === artwork.imageOriginalUrl),
      originalLoading: false
    };

    let originalTexture = textureState.originalLoaded ? texture : null;
    let originalTexturePromise = null;

    function swapToTexture(nextTexture, nextSource) {
      if (!paintingSurface?.material) {
        return false;
      }

      if (paintingSurface.material.map !== nextTexture) {
        paintingSurface.material.map = nextTexture;
        paintingSurface.material.needsUpdate = true;
      }

      textureState.current = nextSource;
      return true;
    }

    function ensureOriginalTexture() {
      if (!textureState.originalUrl) {
        return Promise.resolve(false);
      }

      if (textureState.current === 'original' && originalTexture) {
        return Promise.resolve(true);
      }

      if (textureState.originalLoaded && originalTexture) {
        return Promise.resolve(swapToTexture(originalTexture, 'original'));
      }

      if (originalTexturePromise) {
        return originalTexturePromise;
      }

      textureState.originalLoading = true;

      originalTexturePromise = loadTextureAsync(loader, textureState.originalUrl, maxAnisotropy)
        .then((loadedTexture) => {
          originalTexture = loadedTexture;
          textureState.originalLoaded = true;
          textureState.originalLoading = false;
          originalTexturePromise = null;
          return swapToTexture(loadedTexture, 'original');
        })
        .catch((error) => {
          console.warn(`[paintings] no se pudo cargar original: ${textureState.originalUrl}`, error);
          textureState.originalLoading = false;
          originalTexturePromise = null;
          return false;
        });

      return originalTexturePromise;
    }

    if (artwork.title) {
      plaque = createPlaque({
        title: artwork.title,
        author: artwork.author || 'Artista'
      });

      const frameHeight = paintingGroup.userData?.frameSize?.height || 2.15;
      plaque.position.y = -(frameHeight / 2) - 0.33;
      plaque.position.z = 0.06;
      plaque.rotation.x = -Math.PI / 12;
      paintingGroup.add(plaque);
    }

    paintingGroup.position.set(artwork.position.x, artwork.position.y, artwork.position.z);
    if (typeof artwork.rotationY === 'number') {
      paintingGroup.rotation.y = artwork.rotationY;
    }

    paintingGroup.userData.artwork = artwork;
    paintingGroup.userData.placementIndex = index;
    paintingGroup.userData.textureState = textureState;
    paintingGroup.userData.ensureOriginalTexture = ensureOriginalTexture;

    scene.add(paintingGroup);
    instances.push({
      artwork,
      group: paintingGroup,
      ensureOriginalTexture,
      textureState
    });
  });

  return instances;
}
