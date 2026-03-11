import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CyberButton } from '../components/CyberButton';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Account() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [userRes, ordersRes] = await Promise.all([
        axios.get(`${API}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setUser(userRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load account data');
    } finally {
      setLoading(false);
    }
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
          <p className="font-mono uppercase text-xs tracking-widest text-cyber-cyan mb-4">Account</p>
          <h1 className="font-syne text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-12">
            My Account
          </h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-white/10" data-testid="account-tabs">
            <button
              onClick={() => setActiveTab('profile')}
              data-testid="tab-profile"
              className={`pb-4 font-mono text-sm uppercase tracking-widest border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-cyber-cyan text-cyber-cyan'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              data-testid="tab-orders"
              className={`pb-4 font-mono text-sm uppercase tracking-widest border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-cyber-cyan text-cyber-cyan'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Orders
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && user && (
            <div className="max-w-2xl" data-testid="profile-section">
              <div className="bg-void-card border border-white/5 p-8 space-y-6">
                <div>
                  <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
                    Name
                  </label>
                  <p className="font-mono text-lg">{user.name}</p>
                </div>
                <div>
                  <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
                    Email
                  </label>
                  <p className="font-mono text-lg">{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
                      Phone
                    </label>
                    <p className="font-mono text-lg">{user.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div data-testid="orders-section">
              {orders.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-zinc-400 mb-8">No orders yet</p>
                  <CyberButton onClick={() => navigate('/shop')}>Start Shopping</CyberButton>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order, idx) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-void-card border border-white/5 p-6"
                      data-testid={`order-${order.id}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-mono text-xs text-zinc-400 mb-1">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <p className="font-mono text-xs text-zinc-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-lg text-cyber-cyan mb-1">₹{order.total.toFixed(2)}</p>
                          <span
                            className={`font-mono text-xs px-3 py-1 ${
                              order.order_status === 'delivered'
                                ? 'bg-cyber-green/20 text-cyber-green'
                                : order.order_status === 'shipped'
                                ? 'bg-cyber-cyan/20 text-cyber-cyan'
                                : 'bg-zinc-700 text-zinc-400'
                            }`}
                          >
                            {order.order_status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex justify-between text-sm">
                            <span className="text-zinc-400">Item {itemIdx + 1}</span>
                            <span>{item.size} • {item.color} • Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      {order.tracking_info && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="font-mono text-xs text-zinc-400">Tracking: {order.tracking_info.tracking_number}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}