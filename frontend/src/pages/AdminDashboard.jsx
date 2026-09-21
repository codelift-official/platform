import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/common/Modal';
import {
  ShieldCheck,
  Users,
  Layers,
  FileCheck2,
  DollarSign,
  Plus,
  Edit2,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Loader2,
  Tag
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('students');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Grading Modal State
  const [gradingSub, setGradingSub] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [gradingLoading, setGradingLoading] = useState(false);

  // Batch Modal State
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchFee, setBatchFee] = useState('5000');
  const [batchCapacity, setBatchCapacity] = useState('30');
  const [batchSaving, setBatchSaving] = useState(false);

  // Coupon Modal State
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('500');
  const [couponSaving, setCouponSaving] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  async function loadAllAdminData() {
    setLoading(true);
    try {
      const [stRes, sListRes, bListRes, subListRes, asgnListRes] = await Promise.all([
        api.admin.getStats().catch(() => ({ stats: null })),
        api.students.list().catch(() => ({ students: [] })),
        api.batches.list().catch(() => ({ batches: [] })),
        api.submissions.list().catch(() => ({ submissions: [] })),
        api.assignments.list().catch(() => ({ assignments: [] }))
      ]);

      setStats(stRes.stats);
      setStudents(sListRes.students || []);
      setBatches(bListRes.batches || []);
      setSubmissions(subListRes.submissions || []);
      setAssignments(asgnListRes.assignments || []);
    } finally {
      setLoading(false);
    }
  }

  // Handle Publish Grade
  async function handlePublishGrade(e) {
    e.preventDefault();
    if (!gradingSub) return;
    setGradingLoading(true);
    try {
      await api.admin.publishGrade(gradingSub.id, gradeInput, feedbackInput);
      setGradingSub(null);
      await loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Failed to publish grade');
    } finally {
      setGradingLoading(false);
    }
  }

  // Handle Create Batch
  async function handleCreateBatch(e) {
    e.preventDefault();
    setBatchSaving(true);
    try {
      await api.batches.update({
        name: batchName,
        fee: Number(batchFee),
        capacity: Number(batchCapacity)
      });
      setBatchModalOpen(false);
      setBatchName('');
      await loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Failed to create batch');
    } finally {
      setBatchSaving(false);
    }
  }

  // Toggle student active state
  async function handleToggleStudent(student) {
    try {
      await api.students.update(student.id, {
        isActive: !student.isActive
      });
      await loadAllAdminData();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-brand-400 font-semibold tracking-wider">
            Administrative Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-brand-400" />
            <span>Platform Operation & Grading Center</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            Store: <strong className="text-brand-400">app-data/*.json</strong>
          </span>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {stats?.totalStudents || students.length}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            {stats?.activeStudents ?? students.filter((s) => s.isActive).length} active
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Batches</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {stats?.totalBatches || batches.length}
          </p>
          <p className="text-[11px] text-slate-500">Live Courses</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Grading</span>
            <FileCheck2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {submissions.filter((s) => s.grade === null).length}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            {submissions.length} total submissions
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">
            ₹{(stats?.totalRevenue || 10000).toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">Fees collected</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'students'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-white'
            }`}
        >
          Students Directory ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('grading')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'grading'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-white'
            }`}
        >
          <span>Grading Queue</span>
          {submissions.filter((s) => s.grade === null).length > 0 && (
            <span className="w-2 h-2 rounded-full bg-brand-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'batches'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-white'
            }`}
        >
          Batches ({batches.length})
        </button>
      </div>

      {/* Tab 1: Students Directory */}
      {activeTab === 'students' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Student Name & Email</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Assigned Batch</th>
                  <th className="px-6 py-3.5">Topics Done</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{std.name || 'Unnamed'}</p>
                      <p className="text-slate-500 font-mono text-[11px]">{std.email}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">
                      {std.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-mono text-brand-400">
                      {batches.find((b) => b.id === std.batchId)?.name || std.batchId}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {Object.keys(std.progress || {}).length}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${std.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                      >
                        {std.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleStudent(std)}
                        className="text-xs text-slate-400 hover:text-white underline font-mono"
                      >
                        {std.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Grading Center */}
      {activeTab === 'grading' && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800 text-xs">
              No submissions uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((sub) => {
                const asgn = assignments.find((a) => a.id === sub.assignmentId);
                const std = students.find((s) => s.id === sub.studentId);

                return (
                  <div
                    key={sub.id}
                    className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">
                          {std?.name || sub.studentId}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-xs text-slate-400">
                          {asgn?.title || sub.assignmentId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">
                        Submitted: {new Date(sub.submittedAt).toLocaleString()}
                      </p>
                      {sub.fileUrls && sub.fileUrls.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          {sub.fileUrls.map((url, uIdx) => (
                            <a
                              key={uIdx}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-mono text-brand-400 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>View Submitted Asset {uIdx + 1}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {sub.grade !== null ? (
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                            Graded: {sub.grade} / {asgn?.maxMarks || 10}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setGradingSub(sub);
                            setGradeInput('');
                            setFeedbackInput('');
                          }}
                          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
                        >
                          Grade Submission
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Batches Manager */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setBatchModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Batch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {batches.map((b) => (
              <div
                key={b.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold">
                    {b.isActive ? 'Active' : 'Archived'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {b.id}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{b.name}</h3>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs font-mono text-slate-300">
                  <span>Tuition Fee: ₹{b.fee.toLocaleString()}</span>
                  <span>Capacity: {b.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grading Modal */}
      <Modal
        isOpen={Boolean(gradingSub)}
        onClose={() => setGradingSub(null)}
        title="Grade Assignment Submission"
      >
        <form onSubmit={handlePublishGrade} className="space-y-4">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
            <p className="text-slate-300">
              <strong>Student:</strong>{' '}
              {students.find((s) => s.id === gradingSub?.studentId)?.name || gradingSub?.studentId}
            </p>
            <p className="text-slate-300">
              <strong>Assignment:</strong>{' '}
              {assignments.find((a) => a.id === gradingSub?.assignmentId)?.title}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Score (out of 10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              required
              value={gradeInput}
              onChange={(e) => setGradeInput(e.target.value)}
              placeholder="e.g. 9"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Constructive Feedback
            </label>
            <textarea
              rows={3}
              required
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="Write qualitative feedback on code cleanliness and architecture..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500 placeholder:text-slate-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setGradingSub(null)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={gradingLoading}
              className="px-5 py-2 text-xs font-semibold bg-brand-500 hover:bg-brand-400 text-slate-950 rounded-xl transition-all shadow-sm"
            >
              {gradingLoading ? 'Publishing...' : 'Publish Grade to submissions.json'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Batch Create Modal */}
      <Modal
        isOpen={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
        title="Create New Batch"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Batch Name</label>
            <input
              type="text"
              required
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g. Distributed Systems - Fall 2026"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Tuition Fee (₹)</label>
              <input
                type="number"
                required
                value={batchFee}
                onChange={(e) => setBatchFee(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Capacity</label>
              <input
                type="number"
                required
                value={batchCapacity}
                onChange={(e) => setBatchCapacity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setBatchModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={batchSaving}
              className="px-5 py-2 text-xs font-semibold bg-brand-500 text-slate-950 rounded-xl"
            >
              {batchSaving ? 'Saving...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
