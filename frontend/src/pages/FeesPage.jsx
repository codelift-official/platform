import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { CreditCard, Tag, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export default function FeesPage() {
  const { student, user } = useAuth();
  const [fees, setFees] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [validating, setValidating] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const [couponError, setCouponError] = useState(null);

  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    loadFeeData();
  }, [student]);

  async function loadFeeData() {
    try {
      const [fRes, bRes] = await Promise.all([
        api.fees.list().catch(() => ({ fees: [] })),
        api.batches.list().catch(() => ({ batches: [] }))
      ]);
      setFees(fRes.fees || []);
      setBatches(bRes.batches || []);
    } finally {
      setLoading(false);
    }
  }

  const currentBatch = batches.find((b) => b.id === student?.batchId) || {
    fee: 5000,
    name: 'Full Stack Mastery - Spring 2026'
  };

  const baseFee = currentBatch.fee || 5000;
  const payableAmount = Math.max(0, baseFee - discount);
  const paidRecord = fees.find((f) => f.status === 'PAID');

  async function handleApplyCoupon(e) {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidating(true);
    setCouponError(null);
    setCouponSuccess(null);

    try {
      const res = await api.coupons.validate(couponCode);
      setDiscount(res.discount);
      setCouponSuccess(`Coupon applied! ₹${res.discount} discount activated.`);
    } catch (err) {
      setDiscount(0);
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setValidating(false);
    }
  }

  async function handlePayFees() {
    setPaying(true);
    try {
      await api.fees.record(payableAmount, couponSuccess ? couponCode : null);
      setPaySuccess(true);
      confetti({
        particleCount: 80,
        spread: 60
      });
      await loadFeeData();
    } catch (err) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-brand-400 font-semibold tracking-wider">
            Account & Tuition
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-amber-400" />
            <span>Course Tuition & Payment Records</span>
          </h1>
        </div>
        <p className="text-xs text-slate-400 max-w-xs">
          Payments are recorded into <code className="text-brand-300">fees.json</code> with coupon tracking in <code className="text-brand-300">coupons.json</code>.
        </p>
      </div>

      {paidRecord ? (
        /* Paid Receipt Banner */
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Payment Completed
              </span>
              <h3 className="text-xl font-bold text-white">Tuition Paid in Full</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
            <div>
              <p className="text-slate-500 uppercase text-[10px] font-mono">Amount Paid</p>
              <p className="text-base font-bold text-white font-mono mt-0.5">
                ₹{paidRecord.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-slate-500 uppercase text-[10px] font-mono">Date Paid</p>
              <p className="text-base font-semibold text-slate-200 mt-0.5">
                {new Date(paidRecord.paidAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-slate-500 uppercase text-[10px] font-mono">Receipt Reference</p>
              <p className="font-mono text-brand-400 mt-0.5">{paidRecord.id}</p>
            </div>
          </div>
        </div>
      ) : (
        /* Unpaid Invoice Card */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
              Invoice Outstanding
            </span>
            <h3 className="text-2xl font-bold text-white">{currentBatch.name}</h3>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Batch Tuition Fee</span>
              <span className="font-mono text-white font-semibold">₹{baseFee.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Promotional Discount (Coupon Applied)</span>
                <span className="font-mono">- ₹{discount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between pt-3 border-t border-slate-800 text-base font-bold text-white">
              <span>Total Payable</span>
              <span className="font-mono text-brand-400 text-lg">₹{payableAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Coupon Input Form */}
          <form onSubmit={handleApplyCoupon} className="pt-4 border-t border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Have a Discount Coupon?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="e.g. CODELIFT-500 or EARLYBIRD-1000"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono uppercase focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                disabled={validating}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5 text-brand-400" />
                <span>Apply</span>
              </button>
            </div>

            {couponSuccess && (
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {couponSuccess}
              </p>
            )}
            {couponError && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {couponError}
              </p>
            )}
          </form>

          {/* Pay Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handlePayFees}
              disabled={paying}
              className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment to Storage...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{payableAmount.toLocaleString()} via Secured Gateway</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
