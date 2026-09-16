import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabase.js';
import { errorResponse } from './cors.js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export async function getUser(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    throw new Error('Unauthorized: Missing Bearer token');
  }

  // Support local dev mock tokens (e.g. "mock-token-admin" or "mock-token-student")
  if (token.startsWith('mock-token-')) {
    const role = token.replace('mock-token-', '');
    const isAdmin = role === 'admin';
    const email = isAdmin ? (process.env.ADMIN_EMAIL || 'admin@codelift.com') : 'student@codelift.com';
    const id = isAdmin ? 'std-admin-super' : 'std-001-rahul';

    let student = null;
    try {
      const { data } = await supabaseAdmin
        .from('students')
        .select('*')
        .or(`id.eq.${id},email.eq.${email.toLowerCase()}`)
        .maybeSingle();
      student = data;
    } catch (e) {}

    return {
      id,
      email,
      isAdmin,
      student: student || {
        id,
        email,
        name: isAdmin ? 'Admin' : 'Demo Student',
        batchId: 'batch-alpha-2026',
        progress: {},
        isActive: true
      }
    };
  }

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);

  if (error || !user) {
    throw new Error('Unauthorized: Invalid or expired token');
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@codelift.com').toLowerCase();
  const isAdmin = user.email?.toLowerCase() === adminEmail || user.app_metadata?.role === 'admin';

  // Attach student profile from Supabase
  let student = null;
  try {
    const { data } = await supabaseAdmin
      .from('students')
      .select('*')
      .or(`id.eq.${user.id},email.eq.${user.email?.toLowerCase()}`)
      .maybeSingle();
    student = data || null;
  } catch (e) {
    // Continue even if profile read fails
  }

  return {
    ...user,
    isAdmin,
    student
  };
}

export function requireAuth(handler) {
  return async (req, res) => {
    try {
      const user = await getUser(req);
      req.user = user;
      return await handler(req, res);
    } catch (err) {
      return errorResponse(res, 401, err.message);
    }
  };
}

export function requireAdmin(handler) {
  return async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user.isAdmin) {
        return errorResponse(res, 403, 'Forbidden: Administrator privileges required');
      }
      req.user = user;
      return await handler(req, res);
    } catch (err) {
      return errorResponse(res, 401, err.message);
    }
  };
}
