import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      if (isWishlisted) {
        await axios.delete(`${API}/wishlist/remove/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await axios.post(`${API}/wishlist/add/${product.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      data-testid={`product-card-${product.id}`}
      className="group relative overflow-hidden bg-void-card border border-white/5 hover:border-cyber-cyan/50 transition-colors duration-300"
    >
      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        data-testid={`wishlist-btn-${product.id}`}
        className="absolute top-4 right-4 z-10 p-2 bg-void/80 backdrop-blur-sm hover:bg-cyber-cyan/20 transition-colors"
      >
        <FiHeart size={18} className={isWishlisted ? 'fill-cyber-cyan text-cyber-cyan' : 'text-white'} />
      </button>

      {/* Image */}
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600'}
          alt={product.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-105"
        />
      </div>

      {/* Details */}
      <div className="p-4">
        <p className="font-mono uppercase text-xs tracking-widest text-cyber-cyan mb-2">
          {product.category_id}
        </p>
        <h3 className="font-syne font-bold text-lg mb-2 group-hover:text-cyber-cyan transition-colors">
          {product.name}
        </h3>
        <p className="font-mono text-sm text-zinc-400">₹{product.price}</p>
      </div>
    </Link>
  );
};