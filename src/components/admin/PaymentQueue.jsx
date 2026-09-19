import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaTimesCircle, FaEye, FaReceipt } from 'react-icons/fa';

export default function PaymentQueue() {
  const { payments, verifyPayment, sendEmail } = useData();
  const [filterStatus, setFilterStatus] = useState('PENDING'); // PENDING, PAID, FAILED, ALL
  const [selectedPayment, setSelectedPayment] = useState(null);

  const filtered = payments.filter((p) => {
    if (filterStatus === 'ALL') return true;
    return p.status === filterStatus;
  });

  const handleApprove = (paymentId) => {
    const pay = payments.find((p) => p.id === paymentId);
    verifyPayment(paymentId, true, 'Approved by admin');
    toast.success('Payment verified & student enrolled!');
    setSelectedPayment(null);

    if (pay && pay.studentEmail && sendEmail) {
      sendEmail('fee_collected', { email: pay.studentEmail, name: pay.studentName }, {
        student_name: pay.studentName,
        student_email: pay.studentEmail,
        amount_paid: `₹${Number(pay.amount).toLocaleString('en-IN')}`,
        receipt_no: pay.id,
        payment_mode: pay.paymentMethod || 'UPI / Manual Transfer',
        date: new Date().toISOString().split('T')[0],
        batch_name: pay.courseTitle || 'CodeLift Program',
        remaining_due: '₹0'
      }).catch((e) => console.warn('[PaymentQueue] fee_collected email skipped:', e));
    }
  };

  const handleReject = (paymentId) => {
    verifyPayment(paymentId, false, 'Invalid proof or payment not received');
    toast.error('Payment rejected.');
    setSelectedPayment(null);
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <FaReceipt className="text-success" /> Manual Payment Verification Queue
          </h4>
          <p className="text-muted small mb-0">Review uploaded payment proof images/PDFs and verify manual bank/UPI payments.</p>
        </div>

        {/* Filter Pills */}
        <div className="d-flex gap-2">
          {['PENDING', 'PAID', 'FAILED', 'ALL'].map((st) => (
            <button
              key={st}
              className={`btn btn-sm rounded-pill px-3 fw-bold ${
                filterStatus === st ? 'btn-success' : 'btn-outline-secondary'
              }`}
              onClick={() => setFilterStatus(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Student</th>
              <th>Course Title</th>
              <th>Amount</th>
              <th>Payment Note / UTR</th>
              <th>Status</th>
              <th>Proof</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  No payment records found for status "{filterStatus}".
                </td>
              </tr>
            ) : (
              filtered.map((pay) => (
                <tr key={pay.id}>
                  <td>
                    <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>{pay.studentName}</div>
                    <div className="text-muted small">{pay.studentId}</div>
                  </td>
                  <td className="fw-semibold text-secondary">{pay.courseTitle}</td>
                  <td className="fw-bold text-success">₹{pay.amount}</td>
                  <td className="small text-muted">{pay.paymentNote || 'N/A'}</td>
                  <td>
                    <span
                      className={`badge rounded-pill px-3 py-1 ${
                        pay.status === 'PAID'
                          ? 'bg-success'
                          : pay.status === 'PENDING'
                          ? 'bg-warning text-dark'
                          : 'bg-danger'
                      }`}
                    >
                      {pay.status}
                    </span>
                  </td>
                  <td>
                    {pay.paymentProof ? (
                      <button
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                        onClick={() => setSelectedPayment(pay)}
                      >
                        <FaEye className="me-1" /> View Proof
                      </button>
                    ) : (
                      <span className="small text-muted">No File</span>
                    )}
                  </td>
                  <td className="text-end">
                    {pay.status === 'PENDING' && (
                      <div className="d-flex gap-2 justify-content-end">
                        <button
                          className="btn btn-sm btn-success rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                          onClick={() => handleApprove(pay.id)}
                        >
                          <FaCheckCircle /> Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                          onClick={() => handleReject(pay.id)}
                        >
                          <FaTimesCircle /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Proof Preview Modal */}
      {selectedPayment && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-dark text-white py-3 px-4">
                <h5 className="modal-title fw-bold">Payment Proof Preview</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedPayment(null)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <div className="mb-3 text-start p-3 rounded border" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))', borderColor: 'var(--border-color)' }}>
                  <div>Student: <strong>{selectedPayment.studentName}</strong></div>
                  <div>Course: <strong>{selectedPayment.courseTitle}</strong></div>
                  <div>Amount: <strong className="text-success">₹{selectedPayment.amount}</strong></div>
                  <div>Note: <span>{selectedPayment.paymentNote}</span></div>
                </div>

                {selectedPayment.paymentProof?.startsWith('data:image') || selectedPayment.paymentProof?.match(/\.(jpeg|jpg|gif|png)$/) ? (
                  <img src={selectedPayment.paymentProof} alt="Payment proof" className="img-fluid rounded border shadow-sm" style={{ maxHeight: 400 }} />
                ) : (
                  <iframe src={selectedPayment.paymentProof} title="Proof PDF" style={{ width: '100%', height: 400, border: 'none' }}></iframe>
                )}
              </div>

              <div className="modal-footer border-top px-4 py-3" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.02))' }}>
                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setSelectedPayment(null)}>
                  Close
                </button>
                {selectedPayment.status === 'PENDING' && (
                  <>
                    <button className="btn btn-danger rounded-pill px-4" onClick={() => handleReject(selectedPayment.id)}>
                      Reject
                    </button>
                    <button className="btn btn-success rounded-pill px-4 fw-bold" onClick={() => handleApprove(selectedPayment.id)}>
                      Approve & Enroll
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
