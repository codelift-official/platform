import { handleCors, jsonResponse, errorResponse } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST' && req.method !== 'PUT') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  return requireAuth(async (req, res) => {
    try {
      const { studentId, updates } = req.body || {};
      const targetId = studentId || req.user.id;

      // If updating someone else, must be admin
      if (targetId !== req.user.id && !req.user.isAdmin) {
        return errorResponse(res, 403, 'Forbidden: Cannot update another student profile');
      }

      const payload = {};
      if (updates?.name !== undefined) payload.name = updates.name;
      if (updates?.phone !== undefined) payload.phone = updates.phone;
      if (updates?.progress !== undefined) payload.progress = updates.progress;
      if (updates?.concessionReason !== undefined) payload.concession_reason = updates.concessionReason;
      if (updates?.concessionAmount !== undefined) payload.concession_amount = Number(updates.concessionAmount);
      if (updates?.baseFee !== undefined) payload.base_fee = Number(updates.baseFee);
      if (updates?.totalFee !== undefined) payload.total_fee = Number(updates.totalFee);
      if (updates?.paidFee !== undefined) payload.paid_fee = Number(updates.paidFee);
      if (updates?.feeStatus !== undefined) payload.fee_status = updates.feeStatus;

      if (req.user.isAdmin) {
        if (updates?.batchId !== undefined) payload.batch_id = updates.batchId || null;
        if (updates?.isActive !== undefined) payload.is_active = Boolean(updates.isActive);
        if (updates?.reset_requested !== undefined) payload.reset_requested = Boolean(updates.reset_requested);
      }

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetId);
      const query = supabaseAdmin.from('students').update(payload);

      const { data, error } = await (isUUID
        ? query.eq('id', targetId)
        : query.or(`id.eq.${targetId},legacy_id.eq.${targetId}`))
        .select()
        .single();

      if (error) {
        return errorResponse(res, 404, 'Student record not found or update failed', error.message);
      }

      return jsonResponse(res, 200, {
        message: 'Student record updated successfully in Supabase',
        student: data
      });
    } catch (err) {
      return errorResponse(res, 500, 'Failed to update student in Supabase', err.message);
    }
  })(req, res);
}
