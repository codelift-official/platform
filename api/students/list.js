import { handleCors, jsonResponse, errorResponse } from '../_lib/cors.js';
import { requireAdmin } from '../_lib/auth.js';
import { supabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  return requireAdmin(async (req, res) => {
    try {
      const { batchId } = req.query || {};
      let query = supabaseAdmin.from('students').select('*').order('created_at', { ascending: false });

      if (batchId) {
        query = query.eq('batch_id', batchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const students = (data || []).map((s) => ({
        id: s.id,
        legacyId: s.legacy_id,
        name: s.name,
        email: s.email,
        phone: s.phone || '',
        batchId: s.batch_id || '',
        enrolledDate: s.enrolled_date,
        totalFee: Number(s.total_fee || 0),
        paidFee: Number(s.paid_fee || 0),
        feeStatus: s.fee_status || 'PENDING',
        isGraduated: Boolean(s.is_graduated),
        isActive: Boolean(s.is_active),
        reset_requested: Boolean(s.reset_requested),
        completedBatchIds: s.completed_batch_ids || [],
        progress: s.progress || {},
        baseFee: Number(s.base_fee || 0),
        concessionAmount: Number(s.concession_amount || 0),
        concessionReason: s.concession_reason || '',
        createdAt: s.created_at,
        updatedAt: s.updated_at
      }));

      return jsonResponse(res, 200, {
        students,
        total: students.length
      });
    } catch (err) {
      return errorResponse(res, 500, 'Failed to fetch students from Supabase', err.message);
    }
  })(req, res);
}
