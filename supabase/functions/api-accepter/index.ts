// @ts-nocheck
// Supabase Edge Function: API Accepter
// Deploy with: supabase functions deploy api-accepter
// Required env: API_ACCEPTER_SHARED_SECRET

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const expectedSecret = Deno.env.get('API_ACCEPTER_SHARED_SECRET');
    const providedSecret = req.headers.get('x-api-secret');

    if (expectedSecret && providedSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const organization_id = body.organization_id;
    const source_system = body.source_system || body.sourceSystem || 'external-system';
    const event_type = body.event_type || body.eventType || 'external.event';
    const payload = body.payload || body;

    if (!organization_id) {
      return new Response(JSON.stringify({ error: 'organization_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data, error } = await supabase
      .from('api_accepter_events')
      .insert({
        organization_id,
        source_system,
        event_type,
        status: 'received',
        payload,
        response: { accepted: true, received_at: new Date().toISOString() },
      })
      .select('*')
      .single();

    if (error) throw error;

    await supabase.from('integration_runs').insert({
      organization_id,
      integration_name: source_system,
      event_name: event_type,
      status: 'success',
      payload,
      response: { accepted_event_id: data.id },
    });

    return new Response(JSON.stringify({ accepted: true, id: data.id }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ accepted: false, error: String(error?.message || error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
