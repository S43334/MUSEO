import { createAnonClient, createServiceClient } from './supabase.ts';

export async function requireAdminFromRequest(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing bearer token');
  }

  const anonClient = createAnonClient(authHeader);
  const token = authHeader.replace('Bearer ', '').trim();
  const { data: userData, error: userError } = await anonClient.auth.getUser(token);

  if (userError || !userData?.user) {
    throw new Error('Invalid auth token');
  }

  const service = createServiceClient();
  const { data: adminProfile, error: adminError } = await service
    .from('admin_profiles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (adminError) {
    throw new Error(adminError.message);
  }

  if (!adminProfile || adminProfile.role !== 'admin') {
    throw new Error('Admin role required');
  }

  return {
    user: userData.user,
    service
  };
}