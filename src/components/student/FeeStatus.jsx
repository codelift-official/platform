import React from 'react';
import { Table, Button, Badge, Card } from 'react-bootstrap';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { FaMoneyBillWave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function FeeStatus() {
  const { fees = [], batches = [], students = [], recordFee, isHydrated } = useData();
  const { currentStudent, auth } = useAuth();

  const studentId = currentStudent?.id || auth?.studentId || auth?.userId;
  const studentEmail = (auth?.email || currentStudent?.email)?.toLowerCase();

  const student = students.find((s) =>
    (studentId && (s.id === studentId || s.legacyId === studentId)) ||
    (studentEmail && s.email && s.email.toLowerCase() === studentEmail)
  ) || (isHydrated ? (currentStudent || students[0]) : null);

  const isDataLoading = isSupabaseConfigured ? (!isHydrated || (students.length === 0 && !student)) : false;

  if (isDataLoading) {
    return (
      <Card className="border-0 shadow-sm rounded-3" style={{ backgroundColor: 'var(--card-bg)' }}>
        <Card.Body className="py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '220px' }}>
          <div className="position-relative mb-3">
            <div
              className="spinner-border"
              role="status"
              style={{
                width: '2.6rem',
                height: '2.6rem',
                borderWidth: '3px',
                color: 'var(--bs-primary)',
                borderColor: 'var(--bs-primary) transparent transparent transparent'
              }}
            />
            <div
              className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center"
              style={{ color: 'var(--bs-primary)' }}
            >
              <FaMoneyBillWave size={14} />
            </div>
          </div>
          <div className="fw-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Loading Fee Records...</div>
          <div className="small text-muted">Retrieving verified student ledger & tuition status</div>
        </Card.Body>
      </Card>
    );
  }

  const studentFees = fees.filter((f) => f.studentId === student?.id || (student?.legacyId && f.studentId === student.legacyId));
  const studentBatch = batches.find((b) => b.id === student?.batchId) || batches[0];

  const totalFee = (student?.totalFee !== undefined && student?.totalFee !== null)
    ? Number(student.totalFee)
    : (studentBatch?.feeAmount !== undefined && studentBatch?.feeAmount !== null)
      ? Number(studentBatch.feeAmount)
      : (student ? 0 : 45000);
  const paidTotal = studentFees
    .filter((f) => f.status === 'PAID')
    .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  const outstanding = Math.max(0, totalFee - paidTotal);

  const handlePayRemaining = () => {
    if (student && outstanding > 0) {
      recordFee({
        studentId: student.id,
        amount: outstanding,
        paidAt: new Date().toISOString().split('T')[0],
        mode: 'UPI',
        status: 'PAID'
      });
    }
  };

  return (
    <Card className="border-0 shadow-sm rounded-3" style={{ backgroundColor: 'var(--card-bg)' }}>
      <Card.Header className="py-3 border-0 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div>
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FaMoneyBillWave className="text-primary" />
            <span>Tuition & Fee Records</span>
          </h5>
          <span className="small text-muted">
            Batch: <strong>{studentBatch?.name || 'Full Stack Cohort'}</strong>
          </span>
        </div>

        <div>
          {outstanding === 0 ? (
            <Badge bg="success" className="px-3 py-2 fs-6 d-inline-flex align-items-center gap-1.5">
              <FaCheckCircle />
              <span>Tuition Paid in Full</span>
            </Badge>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Badge bg="warning" text="dark" className="px-3 py-2 fs-6 d-inline-flex align-items-center gap-1.5">
                <FaExclamationCircle />
                <span>Outstanding: ₹{outstanding.toLocaleString()}</span>
              </Badge>
              <Button variant="primary" size="sm" onClick={handlePayRemaining}>
                Pay Now
              </Button>
            </div>
          )}
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Payment Date</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {studentFees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    No fee transactions recorded yet.
                  </td>
                </tr>
              ) : (
                studentFees.map((fee) => (
                  <tr key={fee.id}>
                    <td className="font-monospace small text-muted">{fee.id}</td>
                    <td className="small" style={{ color: 'var(--text-primary)' }}>{fee.paidAt}</td>
                    <td className="fw-bold font-monospace">₹{Number(fee.amount)?.toLocaleString()}</td>
                    <td>
                      <Badge className="border px-2 py-1" style={{ background: 'var(--card-bg-alt)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
                        {fee.mode}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        bg={fee.status === 'PAID' ? 'success' : 'warning'}
                        text={fee.status === 'PAID' ? 'white' : 'dark'}
                      >
                        {fee.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}
