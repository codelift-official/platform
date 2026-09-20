import React from 'react';
import { FaPrint, FaDownload, FaCheckCircle, FaFileInvoice } from 'react-icons/fa';

export default function InvoiceModal({ payment, enrollment, course, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1065 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-dark text-white py-3 px-4 d-print-none">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <FaFileInvoice /> Official Tax Invoice / Payment Receipt
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-5" id="printable-receipt">
            {/* Receipt Header */}
            <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
              <div>
                <div className="d-flex align-items-center gap-2 fw-bold text-success fs-3">
                  CodeLift Academy
                </div>
                <div className="text-muted small">CodeLift Online Engineering Institute</div>
                <div className="text-muted small">Web: https://codelift-official.github.io/platform/ | Email: codelift.official@gmail.com</div>
              </div>
              <div className="text-end">
                <span className="badge bg-success px-3 py-2 fs-6 mb-2">
                  <FaCheckCircle className="me-1" /> PAID & VERIFIED
                </span>
                <div className="fw-bold fs-5" style={{ color: 'var(--text-primary)' }}>RECEIPT #{payment?.id || enrollment?.id}</div>
                <div className="text-muted small">
                  Date: {new Date(payment?.createdAt || enrollment?.enrolledAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Billed To / Payment Mode */}
            <div className="row mb-4">
              <div className="col-6">
                <h6 className="fw-bold text-secondary text-uppercase small">Billed To:</h6>
                <div className="fw-bold fs-6" style={{ color: 'var(--text-primary)' }}>{payment?.studentName || 'Student'}</div>
                <div className="text-muted small">Enrollment ID: {enrollment?.id}</div>
                <div className="text-muted small">Status: Active Student</div>
              </div>
              <div className="col-6 text-end">
                <h6 className="fw-bold text-secondary text-uppercase small">Payment Method:</h6>
                <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>{payment?.mode || 'Manual Verification'}</div>
                <div className="text-muted small">Ref / Note: {payment?.paymentNote || 'Verified by Admin'}</div>
                <div className="text-muted small">Verified At: {payment?.verifiedAt ? new Date(payment.verifiedAt).toLocaleDateString() : 'Instant'}</div>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="table table-bordered mb-4">
              <thead className="table-light">
                <tr>
                  <th>Course / Service Description</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>{course?.title || payment?.courseTitle || 'Online Paid Course'}</div>
                    <div className="small text-muted">Full Lifetime Access + Course Certificate</div>
                  </td>
                  <td className="text-center">1</td>
                  <td className="text-end">₹{payment?.amount || enrollment?.amount || 0}</td>
                  <td className="text-end fw-bold">₹{payment?.amount || enrollment?.amount || 0}</td>
                </tr>
              </tbody>
            </table>

            {/* Total summary */}
            <div className="d-flex justify-content-end">
              <div style={{ width: 280, background: 'var(--card-bg-alt, rgba(255,255,255,0.04))' }} className="p-3 rounded border">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>₹{payment?.amount || enrollment?.amount || 0}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Discount Applied:</span>
                  <span>- ₹{enrollment?.discountApplied || 0}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Taxes (GST 0%):</span>
                  <span>₹0</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between align-items-center fw-bold fs-5 text-success">
                  <span>Total Paid:</span>
                  <span>₹{payment?.amount || enrollment?.amount || 0}</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-5 pt-4 border-top text-center text-muted small">
              This is a computer generated payment receipt. No physical signature is required.
              <br />
              Thank you for learning with CodeLift!
            </div>
          </div>

          <div className="modal-footer border-top px-4 py-3 d-print-none" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.02))' }}>
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={handlePrint}>
              <FaPrint className="me-2" /> Print / Save as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
