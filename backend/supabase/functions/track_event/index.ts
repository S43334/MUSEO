import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase.ts';

type TrackBody = {
  eventName?: string;
  payload?: Record<string, unknown>;
  sessionId?: string | null;
  clientAt?: string;
};

async function ensureSession(supabase: ReturnType<typeof createServiceClient>, body: TrackBody) {
  if (body.sessionId) {
    const sessionId = String(body.sessionId);
    const { data: existing } = await supabase
      .from('visitor_sessions')
      .select('id')
      .eq('id', sessionId)
      .maybeSingle();

    if (existing?.id) {
      return existing.id;
    }
  }

  const payload = body.payload || {};
  const { data, error } = await supabase
    .from('visitor_sessions')
    .insert({
      source: String(payload.source || 'unknown'),
      device_class: String(payload.deviceClass || payload.device_class || 'unknown')
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = (await req.json()) as TrackBody;
    const eventName = body.eventName?.trim();

    if (!eventName) {
      return jsonResponse({ error: 'eventName is required' }, 400);
    }

    const supabase = createServiceClient();
    const sessionId = await ensureSession(supabase, body);

    const payload = {
      ...(body.payload || {}),
      clientAt: body.clientAt || null
    };

    const { error: eventError } = await supabase.from('event_log').insert({
      session_id: sessionId,
      event_name: eventName,
      payload
    });

    if (eventError) {
      throw new Error(eventError.message);
    }

    if (eventName === 'session_end') {
      await supabase
        .from('visitor_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', sessionId);
    }

    return jsonResponse({ ok: true, sessionId });
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : 'Unexpected error'
    }, 500);
  }
});
