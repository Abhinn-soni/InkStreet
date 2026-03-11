import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ProductCard = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      className="group relative overflow-hidden bg-void-card border border-white/5 hover:border-cyber-cyan/50 transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-8px) rotateX(2deg)' : 'translateY(0) rotateX(0deg)',
        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
      }}
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
      <div className="aspect-[3/4] overflow-hidden relative">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600'}
          alt={product.name}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
          style={{
            transform: isHovered ? 'scale(1.1) rotateY(5deg)' : 'scale(1) rotateY(0deg)',
            transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)'
          }}
        />
        
        {/* Neon glow effect on hover */}
        {isHovered && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.1) 0%, transparent 70%)',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        )}
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