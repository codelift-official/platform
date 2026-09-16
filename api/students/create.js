import { handleCors, jsonResponse, errorResponse } from '../_lib/cors.js';
import { requireAdmin } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';

function isValidUUID(id) {
  if (typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function genUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  return requireAdmin(async (req, res) => {
    try {
      const studentData = req.body || {};
      if (!studentData.email || !studentData.name) {
        return errorResponse(res, 400, 'Student name and email are required');
      }

      const assignedId = isValidUUID(studentData.id) ? studentData.id : genUUID();
      const insertPayload = {
        id: assignedId,
        legacy_id: studentData.legacyId || (!isValidUUID(studentData.id) && studentData.id ? studentData.id : null),
        name: studentData.name,
        email: studentData.email.trim().toLowerCase(),
        phone: studentData.phone || '',
        batch_id: studentData.batchId || null,
        enrolled_date: studentData.enrolledDate || new Date().toISOString(),
        total_fee: Number(studentData.totalFee || 0),
        paid_fee: Number(studentData.paidFee || 0),
        fee_status: studentData.feeStatus || 'PENDING',
        is_graduated: Boolean(studentData.isGraduated),
        is_active: studentData.isActive !== false,
        completed_batch_ids: studentData.completedBatchIds || [],
        progress: studentData.progress || {},
        base_fee: Number(studentData.baseFee || 0),
        concession_amount: Number(studentData.concessionAmount || 0),
        concession_reason: studentData.concessionReason || '',
        reset_requested: false
      };

      const { data, error } = await supabaseAdmin
        .from('students')
        .insert(insertPayload)
        .select()
        .single();

      if (error) {
        return errorResponse(res, 400, 'Failed to create student in Supabase', error.message);
      }

      return jsonResponse(res, 201, {
        message: 'Student created successfully in Supabase',
        student: data
      });
    } catch (err) {
      return errorResponse(res, 500, 'Failed to create student in Supabase', err.message);
    }
  })(req, res);
}
