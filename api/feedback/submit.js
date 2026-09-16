import { handleCors, jsonResponse, errorResponse } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';
import { readJSON, writeJSON } from '../_lib/storage.js';
import { supabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  return requireAuth(async (req, res) => {
    try {
      const { rating, comment, isAnonymous = false } = req.body || {};

      if (!rating || !comment) {
        return errorResponse(res, 400, 'Missing rating or comment');
      }

      const { data: student } = await supabaseAdmin
        .from('students')
        .select('name')
        .eq('id', req.user.id)
        .maybeSingle();

      const feedback = await readJSON('feedback.json').catch(() => []);
      const feedbackRecord = {
        id: `fbk-${Date.now()}-${req.user.id.slice(0, 6)}`,
        studentId: req.user.id,
        studentName: student?.name || 'Student',
        rating: Number(rating),
        comment: comment.trim(),
        isAnonymous: Boolean(isAnonymous),
        isPublished: true,
        createdAt: new Date().toISOString()
      };

      feedback.push(feedbackRecord);
      await writeJSON('feedback.json', feedback);

      return jsonResponse(res, 201, {
        message: 'Feedback submitted successfully',
        feedback: feedbackRecord
      });
    } catch (err) {
      return errorResponse(res, 500, 'Failed to submit feedback', err.message);
    }
  })(req, res);
}
