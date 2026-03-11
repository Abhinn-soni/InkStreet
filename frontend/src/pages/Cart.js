import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CyberButton } from '../components/CyberButton';
import { FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Item removed from cart');
      loadCart();
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      const product = products[item.product_id];
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-zinc-400 animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono uppercase text-xs tracking-widest text-cyber-cyan mb-4">Shopping Cart</p>
          <h1 className="font-syne text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-12">
            Your Cart
          </h1>

          {!cart || cart.items.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-zinc-400 mb-8">Your cart is empty</p>
              <Link to="/shop">
                <CyberButton>Continue Shopping</CyberButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6" data-testid="cart-items">
                {cart.items.map((item, idx) => {
                  const product = products[item.product_id];
                  if (!product) return null;

                  return (
                    <motion.div
                      key={`${item.product_id}-${item.size}-${item.color}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-6 bg-void-card border border-white/5 p-6"
                      data-testid={`cart-item-${product.id}`}
                    >
                      {/* Image */}
                      <img
                        src={product.images[0] || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200'}
                        alt={product.name}
                        className="w-24 h-24 object-cover"
                      />

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="font-syne font-bold text-lg mb-2">{product.name}</h3>
                        <p className="font-mono text-xs text-zinc-400 mb-2">
                          Size: {item.size} • Color: {item.color}
                        </p>
                        <p className="font-mono text-sm text-cyber-cyan">₹{product.price}</p>
                        <p className="font-mono text-xs text-zinc-500 mt-1">Qty: {item.quantity}</p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(item.product_id)}
                        data-testid={`remove-item-${product.id}`}
                        className="text-zinc-400 hover:text-cyber-red transition-colors"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-void-card border border-white/5 p-6 sticky top-24">
                  <h3 className="font-syne text-xl font-bold mb-6">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between font-mono text-sm">
                      <span className="text-zinc-400">Subtotal</span>
                      <span data-testid="cart-subtotal">₹{calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-mono text-sm">
                      <span className="text-zinc-400">Shipping</span>
                      <span className="text-cyber-cyan">FREE</span>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex justify-between font-syne text-lg font-bold">
                        <span>Total</span>
                        <span data-testid="cart-total" className="text-cyber-cyan">₹{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/checkout">
                    <CyberButton data-testid="proceed-to-checkout" className="w-full">Proceed to Checkout</CyberButton>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}