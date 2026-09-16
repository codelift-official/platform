import { handleCors, jsonResponse, errorResponse } from '../_lib/cors.js';
import { requireAdmin } from '../_lib/auth.js';
import { readJSON } from '../_lib/storage.js';
import { supabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  return requireAdmin(async (req, res) => {
    try {
      const [studentsRes, batches, submissions, fees, feedback] = await Promise.all([
        supabaseAdmin.from('students').select('*'),
        readJSON('batches.json').catch(() => []),
        readJSON('submissions.json').catch(() => []),
        readJSON('fees.json').catch(() => []),
        readJSON('feedback.json').catch(() => [])
      ]);

      const students = studentsRes.data || [];
      const totalStudents = students.length;
      const activeStudents = students.filter((s) => s.is_active !== false).length;
      const totalBatches = batches.length;
      const totalSubmissions = submissions.length;
      const pendingGrading = submissions.filter((s) => s.grade === null || s.grade === undefined).length;

      const totalRevenue = fees
        .filter((f) => f.status === 'PAID')
        .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

      const avgRating = feedback.length
        ? (feedback.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) / feedback.length).toFixed(1)
        : '5.0';

      return jsonResponse(res, 200, {
        stats: {
          totalStudents,
          activeStudents,
          totalBatches,
          totalSubmissions,
          pendingGrading,
          totalRevenue,
          feedbackCount: feedback.length,
          avgRating
        }
      });
    } catch (err) {
      return errorResponse(res, 500, 'Failed to fetch admin stats', err.message);
    }
  })(req, res);
}
