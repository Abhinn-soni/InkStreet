import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CyberButton } from '../components/CyberButton';
import { CouponInput } from '../components/CouponInput';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const cartRes = await axios.get(`${API}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(cartRes.data);

      if (cartRes.data.items.length === 0) {
        navigate('/cart');
        return;
      }

      // Load product details
      const productIds = [...new Set(cartRes.data.items.map(item => item.product_id))];
      const productDetails = {};
      for (const id of productIds) {
        const res = await axios.get(`${API}/products/${id}`);
        productDetails[id] = res.data;
      }
      setProducts(productDetails);
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    const subtotal = cart.items.reduce((total, item) => {
      const product = products[item.product_id];
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
    
    // Apply coupon discount
    if (appliedCoupon) {
      return Math.max(0, subtotal - appliedCoupon.discount);
    }
    
    return subtotal;
  };

  const getSubtotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      const product = products[item.product_id];
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const total = calculateTotal();

      // Create order
      const orderRes = await axios.post(
        `${API}/orders`,
        {
          items: cart.items,
          total,
          shipping_address: shippingAddress
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderId = orderRes.data.id;

      // Check if Razorpay is configured
      try {
        // Create payment order
        const paymentRes = await axios.post(
          `${API}/payment/create-order`,
          {
            amount: Math.round(total * 100), // Convert to paise
            order_id: orderId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          const options = {
            key: paymentRes.data.key_id,
            amount: paymentRes.data.amount,
            currency: paymentRes.data.currency,
            name: 'InkStreet',
            description: 'Order Payment',
            order_id: paymentRes.data.order_id,
            handler: async (response) => {
              try {
                await axios.post(
                  `${API}/payment/verify`,
                  {
                    payment_id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id,
                    signature: response.razorpay_signature
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success('Payment successful!');
                navigate('/account?tab=orders');
              } catch (err) {
                toast.error('Payment verification failed');
              }
            },
            prefill: {
              name: shippingAddress.name,
              contact: shippingAddress.phone
            },
            theme: {
              color: '#00F0FF'
            }
          };

          const razorpay = new window.Razorpay(options);
          razorpay.open();
        };
      } catch (paymentErr) {
        // If payment gateway not configured, still create order
        if (paymentErr.response?.status === 503) {
          toast.info('Order created! Payment gateway will be configured soon.');
          navigate('/account?tab=orders');
        } else {
          throw paymentErr;
        }
      }
    } catch (err) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono uppercase text-xs tracking-widest text-cyber-cyan mb-4">Checkout</p>
          <h1 className="font-syne text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-12">
            Complete Order
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Shipping Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handlePlaceOrder} data-testid="checkout-form" className="space-y-6">
                <div>
                  <h3 className="font-syne text-xl font-bold mb-6">Shipping Address</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.name}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                        data-testid="shipping-name"
                        required
                        className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        data-testid="shipping-phone"
                        required
                        className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address_line1}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address_line1: e.target.value })}
                      data-testid="shipping-address1"
                      required
                      className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address_line2}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address_line2: e.target.value })}
                      data-testid="shipping-address2"
                      className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div>
                      <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        data-testid="shipping-city"
                        required
                        className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        data-testid="shipping-state"
                        required
                        className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                        data-testid="shipping-pincode"
                        required
                        className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-void-card border border-white/5 p-6 sticky top-24">
                <h3 className="font-syne text-xl font-bold mb-6">Order Summary</h3>
                
                {/* Coupon Input */}
                <CouponInput 
                  cartTotal={getSubtotal()} 
                  onCouponApplied={setAppliedCoupon}
                />
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between font-mono text-sm">
                    <span className="text-zinc-400">Subtotal</span>
                    <span>₹{getSubtotal().toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between font-mono text-sm text-cyber-cyan">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₹{appliedCoupon.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-mono text-sm">
                    <span className="text-zinc-400">Shipping</span>
                    <span className="text-cyber-cyan">FREE</span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between font-syne text-lg font-bold">
                      <span>Total</span>
                      <span className="text-cyber-cyan" data-testid="checkout-total">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <CyberButton
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  data-testid="place-order-button"
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </CyberButton>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}