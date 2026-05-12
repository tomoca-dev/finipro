// @ts-nocheck
// Supabase Edge Function: Admin-created users only
// Deploy with: supabase functions deploy admin-create-user
// Required env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, prefer',
  'Access-Control-Allow-Methods': 'POST, PATCH, DELETE, OPTIONS',
};

const allowedRoles = new Set([
  'admin',
  'ceo',
  'accountant',
  'finance_admin',
  'manager',
  'cashier',
  'auditor',
  'operations',
  'viewer',
  'owner',
]);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (!['POST', 'DELETE', 'PATCH'].includes(req.method)) {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    console.log(`--- Start ${req.method} Request ---`);
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      console.error('Error: Missing Bearer token');
      throw new Error('Missing user authorization token.');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Initializing Supabase clients...');
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    });

    console.log('Fetching caller user info...');
    const { data: callerData, error: callerError } = await userClient.auth.getUser();
    if (callerError || !callerData?.user) {
      console.error('Caller auth error:', callerError);
      throw new Error(`Invalid caller session: ${callerError?.message || 'No user found'}`);
    }
    const callerId = callerData.user.id;

    // Check if caller is Platform Admin
    const { data: adminProfile, error: profileError } = await adminClient
      .from('profiles')
      .select('is_platform_admin, disabled')
      .eq('id', callerId)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new Error(`Could not find your admin profile. Please run the SQL bootstrap script.`);
    }

    const isPlatformAdmin = Boolean(adminProfile?.is_platform_admin && !adminProfile?.disabled);
    console.log(`Caller is platform admin: ${isPlatformAdmin}`);

    // DELETE METHOD: Delete user from Auth and DB
    if (req.method === 'DELETE') {
      if (!isPlatformAdmin) throw new Error('Only platform admins can delete users.');
      
      const { target_user_id } = await req.json();
      if (!target_user_id) throw new Error('target_user_id is required.');
      if (target_user_id === callerId) throw new Error('You cannot delete yourself.');

      console.log(`Deleting user: ${target_user_id}`);
      
      // Delete from Auth
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(target_user_id);
      if (deleteAuthError) console.error('Auth delete error:', deleteAuthError);

      // Delete from Profiles (cascade should handle members, but we do it explicitly just in case)
      await adminClient.from('profiles').delete().eq('id', target_user_id);
      
      return new Response(JSON.stringify({ ok: true, message: 'User deleted' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // PATCH METHOD: Update user role or profile
    if (req.method === 'PATCH') {
      const { target_user_id, organization_id, role, disabled, is_platform_admin } = await req.json();
      if (!target_user_id) throw new Error('target_user_id is required.');

      console.log(`Updating user: ${target_user_id}`);

      // Check permissions
      let allowed = isPlatformAdmin;
      if (!allowed && organization_id) {
        const { data: membership } = await adminClient
          .from('organization_members')
          .select('role')
          .eq('organization_id', organization_id)
          .eq('user_id', callerId)
          .single();
        allowed = ['owner', 'admin', 'finance_admin'].includes(membership?.role);
      }
      if (!allowed) throw new Error('Not authorized to update this user.');

      // Update role in organization_members if provided
      if (organization_id && role) {
        const { error: roleError } = await adminClient.from('organization_members').upsert({
          organization_id,
          user_id: target_user_id,
          role,
        }, { onConflict: 'organization_id,user_id' });
        if (roleError) throw roleError;
      }

      // Update disabled or is_platform_admin in profiles if provided
      const profileUpdates: any = {};
      if (typeof disabled === 'boolean') profileUpdates.disabled = disabled;
      if (typeof is_platform_admin === 'boolean') {
        if (!isPlatformAdmin) throw new Error('Only platform admins can change platform admin status.');
        profileUpdates.is_platform_admin = is_platform_admin;
      }

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await adminClient
          .from('profiles')
          .update(profileUpdates)
          .eq('id', target_user_id);
        if (profileError) throw profileError;
      }

      return new Response(JSON.stringify({ ok: true, message: 'User updated' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // POST METHOD: Create user (original logic)
    if (req.method === 'POST') {
      const body = await req.json();
      const organizationId = body.organization_id;
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const fullName = String(body.full_name || body.fullName || '').trim();
      const username = String(body.username || '').trim().toLowerCase();
      const role = String(body.role || 'viewer').trim().toLowerCase();

      if (!organizationId) throw new Error('organization_id is required.');
      if (!email) throw new Error('email is required.');
      if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.');
      if (!fullName) throw new Error('full_name is required.');
      if (!username) throw new Error('username is required.');

      // Permission check for POST
      let allowed = isPlatformAdmin;
      if (!allowed) {
        const { data: membership } = await adminClient
          .from('organization_members')
          .select('role')
          .eq('organization_id', organizationId)
          .eq('user_id', callerId)
          .single();
        allowed = ['owner', 'admin', 'finance_admin'].includes(membership?.role);
      }
      if (!allowed) throw new Error('Not authorized to create users in this organization.');

      console.log(`Creating user: ${email}`);

      // Check if user exists in Auth
      const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
      if (listError) throw listError;
      
      let targetUserId = users.users.find((u) => u.email?.toLowerCase() === email)?.id;

      if (!targetUserId) {
        const { data: created, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, username, role },
        });
        if (createError) throw createError;
        targetUserId = created?.user?.id;
      }

      if (!targetUserId) throw new Error('Failed to resolve target user ID.');

      // Upsert profile
      const { error: profileUpsertError } = await adminClient.from('profiles').upsert({
        id: targetUserId,
        email,
        full_name: fullName,
        username,
        created_by_admin: callerId,
        disabled: false,
      }, { onConflict: 'id' });
      
      if (profileUpsertError) {
        if (profileUpsertError.code === '23505') throw new Error('Username or email already taken.');
        throw profileUpsertError;
      }

      // Upsert membership
      const { error: memberError } = await adminClient.from('organization_members').upsert({
        organization_id: organizationId,
        user_id: targetUserId,
        role,
      }, { onConflict: 'organization_id,user_id' });
      if (memberError) throw memberError;

      return new Response(JSON.stringify({ ok: true, user_id: targetUserId }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    const errMsg = String(error?.message || error);
    console.error('CRITICAL FUNCTION ERROR:', errMsg);
    return new Response(JSON.stringify({ ok: false, error: errMsg }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
