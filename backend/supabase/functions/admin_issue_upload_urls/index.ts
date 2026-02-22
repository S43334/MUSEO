import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAdminFromRequest } from '../_shared/admin.ts';

type UploadRequest = {
  artworkId?: string;
  originalExt?: string;
  webExt?: string;
  thumbExt?: string;
};

const BUCKETS = {
  original: 'artworks-original',
  web: 'artworks-web',
  thumb: 'artworks-thumb'
};

function safeExt(value: unknown, fallback: string) {
  const text = String(value || fallback).toLowerCase().replace('.', '');
  if (!text.match(/^[a-z0-9]{2,5}$/)) {
    return fallback;
  }
  return text;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { service } = await requireAdminFromRequest(req);
    const body = (await req.json()) as UploadRequest;

    if (!body.artworkId) {
      return jsonResponse({ error: 'artworkId is required' }, 400);
    }

    const timestamp = Date.now();
    const nonce = crypto.randomUUID();

    const extensions = {
      original: safeExt(body.originalExt, 'jpg'),
      web: safeExt(body.webExt, 'webp'),
      thumb: safeExt(body.thumbExt, 'webp')
    };

    const paths = {
      original: `${body.artworkId}/${timestamp}-${nonce}.original.${extensions.original}`,
      web: `${body.artworkId}/${timestamp}-${nonce}.web.${extensions.web}`,
      thumb: `${body.artworkId}/${timestamp}-${nonce}.thumb.${extensions.thumb}`
    };

    const signed: Record<string, unknown> = {};

    for (const [kind, bucket] of Object.entries(BUCKETS)) {
      const path = paths[kind as keyof typeof paths];
      const { data, error } = await service.storage.from(bucket).createSignedUploadUrl(path);

      if (error) {
        throw new Error(error.message);
      }

      signed[kind] = {
        bucket,
        path,
        signedUrl: data?.signedUrl,
        token: data?.token
      };
    }

    return jsonResponse({ ok: true, signed });
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : 'Unexpected error'
    }, 500);
  }
});