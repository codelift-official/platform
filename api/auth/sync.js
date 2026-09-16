import { handleCors, jsonResponse, errorResponse } from '../_lib/cors.js';
import { supabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { id, email, name, phone, batchId } = req.body || {};

    if (!id || !email) {
      return errorResponse(res, 400, 'Missing required fields: id and email');
    }

    const emailLower = email.toLowerCase();
    const { data: existingStudent } = await supabaseAdmin
      .from('students')
      .select('*')
      .or(`id.eq.${id},email.eq.${emailLower}`)
      .maybeSingle();

    let result;
    if (existingStudent) {
      const { data, error } = await supabaseAdmin
        .from('students')
        .update({
          name: name || existingStudent.name || email.split('@')[0],
          phone: phone || existingStudent.phone || '',
          batch_id: batchId || existingStudent.batch_id || null
        })
        .eq('id', existingStudent.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('students')
        .insert({
          id,
          email: emailLower,
          name: name || email.split('@')[0],
          phone: phone || '',
          batch_id: batchId || null,
          progress: {},
          is_active: true,
          enrolled_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return jsonResponse(res, 200, {
      message: 'Student profile synced successfully in Supabase',
      student: result
    });
  } catch (err) {
    console.error('[Sync Error]:', err);
    return errorResponse(res, 500, 'Failed to sync student profile in Supabase', err.message);
  }
}
