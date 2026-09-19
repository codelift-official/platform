import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { FaMoneyBillWave, FaCheckCircle, FaClock } from 'react-icons/fa';
import { FiCreditCard } from 'react-icons/fi';

export default function StudentFees() {
  const { auth, currentStudent } = useAuth();
  const { students = [], fees = [], batches = [], isHydrated } = useData();

  const targetStudentId = auth?.studentId || auth?.userId || currentStudent?.id;
  const targetEmail = (auth?.email || currentStudent?.email)?.toLowerCase();

  const student = students.find((s) =>
    (targetStudentId && (s.id === targetStudentId || s.legacyId === targetStudentId)) ||
    (targetEmail && s.email && s.email.toLowerCase() === targetEmail)
  ) || (isHydrated ? (students[0] || currentStudent) : null);

  const isDataLoading = isSupabaseConfigured ? (!isHydrated || (students.length === 0 && !student)) : false;

  if (isDataLoading) {
    return (
      <div>
        {/* Header */}
        <div className="mb-3">
          <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>My Fees</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Fee summary and payment records
          </p>
        </div>

        {/* Loader Display */}
        <div
          className="card border-0 rounded-4 my-4"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card, 0 2px 10px rgba(0,0,0,0.05))'
          }}
        >
          <div className="card-body py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '320px' }}>
            <div className="position-relative mb-3">
              <div
                className="spinner-border"
                role="status"
                style={{
                  width: '3.2rem',
                  height: '3.2rem',
                  borderWidth: '3.5px',
                  color: 'var(--bs-primary)',
                  borderColor: 'var(--bs-primary) transparent transparent transparent'
                }}
              />
              <div
                className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center"
                style={{ color: 'var(--bs-primary)' }}
              >
                <FaMoneyBillWave size={18} />
              </div>
            </div>
            <h5 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Loading Fee Details...</h5>
            <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
              Retrieving verified fee ledger and real-time payment records
            </p>
          </div>
        </div>
      </div>
    );
  }

  const batch = batches.find(b => b.id === student?.batchId);
  const myFees = fees
    .filter(f => f.studentId === student?.id || (student?.legacyId && f.studentId === student.legacyId))
    .sort((a, b) => new Date(b.paidAt || 0) - new Date(a.paidAt || 0));

  const totalPaid = myFees.filter(f => f.status === 'PAID').reduce((s, f) => s + (Number(f.amount) || 0), 0);
  // As per architecture: Batch fee is the final fee for the student view
  const totalFee = (batch?.feeAmount !== undefined && batch?.feeAmount !== null)
    ? Number(batch.feeAmount)
    : ((student?.totalFee !== undefined && student?.totalFee !== null)
      ? Number(student.totalFee)
      : (student ? 0 : 0));
  const pendingBalance = Math.max(0, totalFee - totalPaid);

  const formatAmount = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const paidPercent = totalFee ? Math.min(100, Math.round((totalPaid / totalFee) * 100)) : 100;

  return (
    <div>
      {/* Header */}
      <div className="mb-3">
        <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>My Fees</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          Fee summary for {batch?.name || 'your batch'}
        </p>
      </div>

      {/* KPI Cards (100% Theme Adaptive) */}
      <div className="row g-3 mb-3">
        {[
          {
            label: 'Total Course Fee',
            value: formatAmount(totalFee),
            color: 'var(--text-primary)',
            iconColor: 'var(--bs-primary)',
            iconBg: 'rgba(var(--bs-primary-rgb, 21, 128, 61), 0.12)',
            icon: <FaMoneyBillWave />
          },
          {
            label: 'Amount Paid',
            value: formatAmount(totalPaid),
            color: 'var(--bs-success, #16A34A)',
            iconColor: 'var(--bs-success, #16A34A)',
            iconBg: 'rgba(var(--bs-success-rgb, 22, 163, 74), 0.12)',
            icon: <FaCheckCircle />
          },
          {
            label: 'Pending Amount',
            value: formatAmount(pendingBalance),
            color: pendingBalance > 0 ? 'var(--bs-danger, #DC2626)' : 'var(--bs-success, #16A34A)',
            iconColor: pendingBalance > 0 ? 'var(--bs-danger, #DC2626)' : 'var(--bs-success, #16A34A)',
            iconBg: pendingBalance > 0 ? 'rgba(var(--bs-danger-rgb, 220, 38, 38), 0.12)' : 'rgba(var(--bs-success-rgb, 22, 163, 74), 0.12)',
            icon: <FaClock />
          },
        ].map(({ label, value, color, iconColor, iconBg, icon }) => (
          <div key={label} className="col-md-4">
            <div
              className="card border-0 rounded-4"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-card, 0 2px 10px rgba(0,0,0,0.05))'
              }}
            >
              <div className="card-body p-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: iconBg,
                      color: iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem'
                    }}
                  >
                    {icon}
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Progress */}
      <div className="card border-0 rounded-4 mb-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between mb-2">
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Payment Progress</span>
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--bs-primary)' }}>{paidPercent}% paid</span>
          </div>
          <div style={{ height: 12, background: 'var(--border-color)', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
            <div
              style={{
                width: `${paidPercent}%`,
                height: '100%',
                background: pendingBalance > 0 ? 'linear-gradient(90deg, var(--bs-primary), #34d399)' : 'linear-gradient(90deg, var(--bs-primary), #22c55e)',
                borderRadius: 6,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {pendingBalance > 0
              ? `₹${pendingBalance.toLocaleString('en-IN')} remaining balance. Please contact the administration for installment payment.`
              : 'All tuition fees fully paid. Thank you!'}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="card border-0 rounded-4" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div className="card-body p-4">
          <h6 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Payment History</h6>
          {myFees.length === 0 ? (
            <div className="empty-state">
              <FiCreditCard size={48} />
              <h3>No fee records found</h3>
              <p>You have no pending invoices or payment transactions recorded at this time.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Amount', 'Cohort / Program', 'Mode', 'Date', 'Status'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border-color)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myFees.map(fee => {
                    const feeCohort = batches.find(b => b.id === fee.batchId) || batch;
                    return (
                      <tr key={fee.id}>
                        <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatAmount(fee.amount)}
                        </td>
                        <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <span className="badge border" style={{ background: 'var(--bg-body)', color: 'var(--text-primary)', borderColor: 'var(--border-color)', fontSize: '0.75rem', fontWeight: 600 }}>
                            {feeCohort?.name || 'Cohort Tuition'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {fee.mode}
                        </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {fee.paidAt ? new Date(fee.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '4px 12px',
                          borderRadius: '50px',
                          background: fee.status === 'PAID' ? 'rgba(var(--bs-success-rgb, 22, 163, 74), 0.15)' : 'rgba(var(--bs-danger-rgb, 220, 38, 38), 0.15)',
                          color: fee.status === 'PAID' ? 'var(--bs-success, #16803D)' : 'var(--bs-danger, #BE123C)',
                          border: `1px solid ${fee.status === 'PAID' ? 'rgba(var(--bs-success-rgb, 22, 163, 74), 0.3)' : 'rgba(var(--bs-danger-rgb, 220, 38, 38), 0.3)'}`,
                        }}>
                          {fee.status}
                        </span>
                      </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-body)', borderRadius: 10, border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            For any payment discrepancies or to record a verified receipt, please contact the admin at <strong>codelift.official@gmail.com</strong> or call <strong>+91 9834671940</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
