import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaTag, FaUpload, FaUniversity, FaQrcode } from 'react-icons/fa';
import CourseTechThumbnail from './CourseTechThumbnail';

export default function CheckoutModal({ course, onClose, onSuccess }) {
  const { auth, currentUser } = useAuth();
  const { coupons, enrollCourse, platformSettings } = useData();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentProof, setPaymentProof] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [uploading, setUploading] = useState(false);

  const isFree = course?.isFree || course?.price === 0;

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon && !isFree) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = (course.price * appliedCoupon.value) / 100;
    } else if (appliedCoupon.type === 'fixed') {
      discountAmount = appliedCoupon.value;
    }
  }
  const finalPrice = Math.max(0, (course?.price || 0) - discountAmount);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const found = coupons.find(
      (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase()
    );
    if (!found) {
      toast.error('Invalid coupon code!');
      return;
    }
    const now = new Date();
    if (found.expiry && new Date(found.expiry) < now) {
      toast.error('Coupon has expired!');
      return;
    }
    setAppliedCoupon(found);
    toast.success(`Coupon ${found.code} applied! Discount: ₹${found.type === 'percentage' ? `${found.value}%` : found.value}`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large! Maximum limit is 5MB.');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProof(reader.result); // Base64 data URL
      setUploading(false);
      toast.success('Payment proof uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please log in or register to enroll.');
      return;
    }

    if (!isFree && !paymentProof && !paymentNote) {
      toast.error('Please upload payment proof or enter transaction reference number.');
      return;
    }

    const enrollment = enrollCourse({
      studentId: currentUser.id,
      studentName: currentUser.name,
      courseId: course.id,
      amount: finalPrice,
      paymentProof,
      paymentNote,
      couponId: appliedCoupon?.id || null,
      discountApplied: discountAmount
    });

    if (isFree) {
      toast.success('Successfully enrolled! Course unlocked.');
    } else {
      toast.success('Enrollment submitted! Verification pending admin review.');
    }

    if (onSuccess) onSuccess(enrollment);
    onClose();
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-success text-white py-3 px-4">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <FaCheckCircle /> Course Enrollment Checkout
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            <div className="row g-4">
              {/* Course & Order Summary */}
              <div className="col-md-6 border-end">
                <h6 className="fw-bold mb-3 text-secondary text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                  Order Summary
                </h6>
                <div className="d-flex gap-3 mb-3 align-items-center p-3 rounded-3 border" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))', borderColor: 'var(--border-color)' }}>
                  <CourseTechThumbnail
                    course={course}
                    compact={true}
                    width={76}
                    height={60}
                    className="rounded-3 flex-shrink-0"
                  />
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{course.title}</h6>
                    <span className="badge bg-secondary text-capitalize">{course.categoryId}</span>
                  </div>
                </div>

                <div className="p-3 rounded-3 mb-3 border" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))', borderColor: 'var(--border-color)' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Original Price:</span>
                    <span className="fw-semibold">₹{course.price}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Discount ({appliedCoupon?.code}):</span>
                      <span className="fw-semibold">- ₹{discountAmount}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold fs-5">Total Payable:</span>
                    <span className="fw-bold fs-4 text-success">
                      {isFree ? 'FREE' : `₹${finalPrice}`}
                    </span>
                  </div>
                </div>

                {/* Coupon Input */}
                {!isFree && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Have a Coupon Code?</label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0" style={{ background: 'var(--card-bg)' }}>
                        <FaTag className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="e.g. WELCOME20"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button className="btn btn-outline-success fw-bold" type="button" onClick={handleApplyCoupon}>
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Details / Proof Upload */}
              <div className="col-md-6">
                <h6 className="fw-bold mb-3 text-secondary text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>
                  {isFree ? 'Instant Access' : 'Payment Verification'}
                </h6>

                {isFree ? (
                  <div className="p-4 bg-success-subtle text-success rounded-3 text-center mb-3">
                    <FaCheckCircle className="fs-1 mb-2" />
                    <h6 className="fw-bold">This Course is 100% Free!</h6>
                    <p className="small mb-0">Click below to gain instant lifetime access to all course modules and materials.</p>
                  </div>
                ) : (
                  <div>
                    {/* Payment Instructions */}
                    <div className="p-3 rounded-3 border mb-3" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))', borderColor: 'var(--border-color)' }}>
                      <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-bold">
                        <FaQrcode /> Payment Instructions
                      </div>
                      <p className="small text-muted mb-2">
                        {platformSettings?.paymentInstructions || 'UPI: codelift@upi | Bank: HDFC Bank A/C 98765432101, IFSC: HDFC0001234'}
                      </p>
                      <div className="alert alert-warning py-2 px-3 mb-0 small" style={{ fontSize: '0.75rem' }}>
                        Pay via UPI/Bank transfer, then upload screenshot or transaction UTR below for verification.
                      </div>
                    </div>

                    {/* Proof Upload */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Upload Payment Proof (Image/PDF)</label>
                      <input type="file" className="form-control" accept="image/*,application/pdf" onChange={handleFileUpload} />
                      {uploading && <div className="small text-muted mt-1">Processing file...</div>}
                      {paymentProof && (
                        <div className="mt-2 p-2 rounded border d-flex align-items-center justify-content-between" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.04))' }}>
                          <span className="small text-success fw-semibold">✓ Proof Attached</span>
                          {paymentProof.startsWith('data:image') && (
                            <img src={paymentProof} alt="Proof preview" style={{ height: 40, borderRadius: 4 }} />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Transaction Note / UTR */}
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Transaction Reference / UTR Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. UPI Ref #1234567890"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer border-top px-4 py-3" style={{ background: 'var(--card-bg-alt, rgba(255,255,255,0.02))' }}>
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" onClick={handleSubmit}>
              {isFree ? 'Confirm & Start Learning' : 'Submit Enrollment & Proof'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
