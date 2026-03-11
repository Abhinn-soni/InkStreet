import { useState } from 'react';
import { FiTag, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CouponInput = ({ cartTotal, onCouponApplied }) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${API}/coupons/validate`,
        {
          params: { code: couponCode, cart_total: cartTotal },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setAppliedCoupon(res.data);
      onCouponApplied(res.data);
      toast.success(`Coupon applied! You saved ₹${res.data.discount}`);
      
      // Track coupon usage
      await axios.post(
        `${API}/coupons/apply`,
        null,
        {
          params: { code: couponCode },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid coupon code');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    onCouponApplied(null);
    toast.info('Coupon removed');
  };

  return (
    <div className="bg-void-card border border-white/5 p-4 mb-4">
      {appliedCoupon ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyber-cyan/20 text-cyber-cyan">
              <FiCheck size={20} />
            </div>
            <div>
              <p className="font-mono text-sm text-cyber-cyan font-bold">
                {appliedCoupon.code} APPLIED
              </p>
              <p className="font-mono text-xs text-zinc-400">
                You saved ₹{appliedCoupon.discount}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveCoupon}
            className="text-zinc-400 hover:text-cyber-red transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>
      ) : (
        <div>
          <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block flex items-center gap-2">
            <FiTag size={14} /> Have a coupon code?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              data-testid="coupon-input"
              className="flex-1 bg-transparent border border-white/20 px-4 py-2 text-white focus:border-cyber-cyan focus:outline-none placeholder:text-zinc-700 font-mono uppercase"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={loading}
              data-testid="apply-coupon-button"
              className="px-6 py-2 bg-cyber-cyan text-black font-mono text-xs uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] transition-all disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Apply'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
