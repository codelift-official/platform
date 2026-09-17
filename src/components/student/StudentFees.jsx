import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { FaMoneyBillWave, FaCheckCircle, FaClock } from 'react-icons/fa';
import { FiCreditCard } from 'react-icons/fi';

export default function StudentFees() {
  const { auth } = useAuth();
  const { students, fees, batches } = useData();

  const student = students.find(s => s.id === (auth?.studentId || auth?.userId)) || students[0];
  const batch = batches.find(b => b.id === student?.batchId);
  const myFees = fees
    .filter(f => f.studentId === student?.id)
    .sort((a, b) => new Date(b.paidAt || 0) - new Date(a.paidAt || 0));

  const totalPaid = myFees.filter(f => f.status === 'PAID').reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const totalFee = Number(student?.totalFee) || batch?.feeAmount || 45000;
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

      {/* KPI Cards */}
      <div className="row g-3 mb-3">
        {[
          { label: 'Total Course Fee', value: formatAmount(totalFee), color: '#171717', bg: '#F8FAFC', icon: <FaMoneyBillWave /> },
          { label: 'Amount Paid', value: formatAmount(totalPaid), color: '#15803D', bg: '#F0FDF4', icon: <FaCheckCircle /> },
          { label: 'Pending Amount', value: formatAmount(pendingBalance), color: pendingBalance > 0 ? '#BE123C' : '#15803D', bg: pendingBalance > 0 ? '#FEF2F2' : '#F0FDF4', icon: <FaClock /> },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} className="col-md-4">
            <div className="card border-0 rounded-4" style={{ background: bg, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div className="card-body p-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ color, fontSize: '1.1rem' }}>{icon}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Progress */}
      <div className="card border-0 rounded-4 mb-4" style={{ background: 'var(--card-bg)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
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
                background: pendingBalance > 0 ? 'linear-gradient(90deg, #15803D, #34d399)' : 'linear-gradient(90deg, #15803D, #22c55e)',
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
      <div className="card border-0 rounded-4" style={{ background: 'var(--card-bg)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
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
                    {['Amount', 'Mode', 'Date', 'Status'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border-color)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myFees.map(fee => (
                    <tr key={fee.id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatAmount(fee.amount)}
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
                          padding: '3px 10px',
                          borderRadius: '50px',
                          background: fee.status === 'PAID' ? '#DCFCE7' : '#FEF2F2',
                          color: fee.status === 'PAID' ? '#15803D' : '#BE123C',
                          border: `1px solid ${fee.status === 'PAID' ? '#BBF7D0' : '#FECACA'}`,
                        }}>
                          {fee.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
