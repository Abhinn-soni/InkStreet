import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';
import { CyberButton } from '../components/CyberButton';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const wishlistRes = await axios.get(`${API}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(wishlistRes.data);

      // Load product details
      const productDetails = [];
      for (const id of wishlistRes.data.product_ids) {
        try {
          const res = await axios.get(`${API}/products/${id}`);
          productDetails.push(res.data);
        } catch (err) {
          console.error(`Error loading product ${id}:`, err);
        }
      }
      setProducts(productDetails);
    } catch (err) {
      console.error('Error loading wishlist:', err);
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
          <p className="font-mono uppercase text-xs tracking-widest text-cyber-cyan mb-4">Wishlist</p>
          <h1 className="font-syne text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-12">
            Saved Items
          </h1>

          {!wishlist || products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-zinc-400 mb-8">Your wishlist is empty</p>
              <CyberButton onClick={() => navigate('/shop')}>Start Shopping</CyberButton>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12" data-testid="wishlist-grid">
              {products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}