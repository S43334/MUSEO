import { issueUploadUrls, upsertMedia } from './content.js';

function extensionFromFile(file) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ext || 'jpg';
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function loadImageElement(file) {
  const src = await fileToDataUrl(file);
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  await img.decode();
  return img;
}

function canvasBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('No fue posible generar blob')); return;
      }
      resolve(blob);
    }, type, quality);
  });
}

async function createDerivativeBlob(file, maxSize, quality = 0.86) {
  const img = await loadImageElement(file);
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await canvasBlob(canvas, 'image/webp', quality);
  return { blob, width, height };
}

async function uploadBlobToSignedUrl(signedUrl, blob, contentType) {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType
    },
    body: blob
  });

  if (!response.ok) {
    throw new Error(`Upload falló (${response.status})`);
  }
}

export async function uploadArtworkDerivatives(artworkId, originalFile) {
  if (!artworkId) {
    throw new Error('artworkId es requerido');
  }

  if (!originalFile) {
    throw new Error('Selecciona un archivo');
  }

  const ext = extensionFromFile(originalFile);
  const signedPayload = await issueUploadUrls(artworkId, { originalExt: ext });
  const signed = signedPayload.signed;

  const web = await createDerivativeBlob(originalFile, 1600, 0.88);
  const thumb = await createDerivativeBlob(originalFile, 420, 0.82);

  await uploadBlobToSignedUrl(signed.original.signedUrl, originalFile, originalFile.type || 'image/jpeg');
  await uploadBlobToSignedUrl(signed.web.signedUrl, web.blob, 'image/webp');
  await uploadBlobToSignedUrl(signed.thumb.signedUrl, thumb.blob, 'image/webp');

  const mediaRows = [
    {
      artwork_id: artworkId,
      kind: 'original',
      storage_path: signed.original.path,
      width: null,
      height: null,
      bytes: originalFile.size,
      mime_type: originalFile.type || 'image/jpeg'
    },
    {
      artwork_id: artworkId,
      kind: 'web',
      storage_path: signed.web.path,
      width: web.width,
      height: web.height,
      bytes: web.blob.size,
      mime_type: 'image/webp'
    },
    {
      artwork_id: artworkId,
      kind: 'thumb',
      storage_path: signed.thumb.path,
      width: thumb.width,
      height: thumb.height,
      bytes: thumb.blob.size,
      mime_type: 'image/webp'
    }
  ];

  await upsertMedia(mediaRows);

  return {
    ok: true,
    mediaRows
  };
}