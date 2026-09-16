import { handleCors, jsonResponse, errorResponse } from '../_lib/cors.js';
import { requireAuth } from '../_lib/auth.js';
import { readJSON, writeJSON } from '../_lib/storage.js';
import { supabaseAdmin } from '../_lib/supabase.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method === 'GET') {
    return requireAuth(async (req, res) => {
      try {
        const { studentId } = req.query || {};
        const targetStudentId = req.user.isAdmin ? (studentId || req.user.id) : req.user.id;

        const certificates = await readJSON('certificates.json').catch(() => []);
        const filtered = certificates.filter((c) => c.studentId === targetStudentId && !c.isRevoked);

        return jsonResponse(res, 200, {
          certificates: filtered
        });
      } catch (err) {
        return errorResponse(res, 500, 'Failed to fetch certificates', err.message);
      }
    })(req, res);
  }

  if (req.method === 'POST') {
    return requireAuth(async (req, res) => {
      try {
        // Admin or student claiming completion certificate
        const { studentId, courseTitle = 'Modern Full-Stack Web Engineering' } = req.body || {};
        const targetId = req.user.isAdmin ? (studentId || req.user.id) : req.user.id;

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetId);
        const { data: student } = await (isUUID
          ? supabaseAdmin.from('students').select('*').eq('id', targetId)
          : supabaseAdmin.from('students').select('*').or(`id.eq.${targetId},legacy_id.eq.${targetId}`))
          .maybeSingle();

        if (!student) {
          return errorResponse(res, 404, 'Student not found in Supabase');
        }

        const certId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const issuedAt = new Date().toISOString();
        const certStoragePath = `certificates/${certId}.json`;

        // Save certificate metadata and printable details to Storage
        await writeJSON(certStoragePath, {
          id: certId,
          studentId: targetId,
          studentName: student.name,
          courseTitle,
          issuedAt,
          issuer: 'CodeLift Platform Accreditation',
          verificationUrl: `/certificates?id=${certId}`
        });

        const certRecord = {
          id: certId,
          studentId: targetId,
          studentName: student.name,
          courseTitle,
          pdfUrl: certStoragePath,
          issuedAt,
          isRevoked: false
        };

        const certificates = await readJSON('certificates.json').catch(() => []);
        certificates.push(certRecord);
        await writeJSON('certificates.json', certificates);

        return jsonResponse(res, 201, {
          message: 'Certificate generated successfully',
          certificate: certRecord
        });
      } catch (err) {
        return errorResponse(res, 500, 'Failed to generate certificate', err.message);
      }
    })(req, res);
  }

  return errorResponse(res, 405, 'Method not allowed');
}
