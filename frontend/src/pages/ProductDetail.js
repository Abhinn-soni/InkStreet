import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CyberButton } from '../components/CyberButton';
import { Product3DPreview } from '../components/Product3DPreview';
import { ReviewSection } from '../components/ReviewSection';
import { LimitedEditionBadge } from '../components/LimitedEditionBadge';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Color name to hex mapping
const colorMap = {
  'Black': '#1a1a1a',
  'White': '#f5f5f5',
  'Navy': '#1e3a5f',
  'Gray': '#6b7280',
  'Red': '#dc2626',
  'Blue': '#2563eb'
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [show3DPreview, setShow3DPreview] = useState(true);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await axios.get(`${API}/products/${id}`);
      setProduct(res.data);
      setSelectedSize(res.data.sizes[0]);
      setSelectedColor(res.data.colors[0]);
    } catch (err) {
      console.error('Error loading product:', err);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }

    try {
      await axios.post(
        `${API}/cart/add`,
        {
          product_id: product.id,
          quantity,
          size: selectedSize,
          color: selectedColor
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-zinc-400 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-zinc-400">Product not found</p>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images & 3D Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Toggle between image and 3D */}
            <div className="mb-4 flex gap-3">
              <button
                onClick={() => setShow3DPreview(false)}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-widest border transition-colors ${
                  !show3DPreview
                    ? 'bg-cyber-cyan text-black border-cyber-cyan'
                    : 'bg-transparent text-white border-white/20 hover:border-cyber-cyan'
                }`}
              >
                Images
              </button>
              <button
                onClick={() => setShow3DPreview(true)}
                data-testid="toggle-3d-preview"
                className={`px-4 py-2 font-mono text-xs uppercase tracking-widest border transition-colors ${
                  show3DPreview
                    ? 'bg-cyber-cyan text-black border-cyber-cyan'
                    : 'bg-transparent text-white border-white/20 hover:border-cyber-cyan'
                }`}
              >
                3D Preview
              </button>
            </div>

            {show3DPreview ? (
              <div className="aspect-[3/4] bg-void-card border border-cyber-cyan/30 overflow-hidden" data-testid="product-3d-preview">
                <Product3DPreview
                  color={colorMap[selectedColor] || '#1a1a1a'}
                  size={selectedSize}
                  productType={product.name.toLowerCase().includes('hoodie') ? 'hoodie' : product.name.toLowerCase().includes('cap') ? 'cap' : 'tshirt'}
                />
                <p className="text-center font-mono text-xs text-zinc-500 mt-2">
                  Real-time 3D preview • Auto-rotating
                </p>
              </div>
            ) : (
              <>
                <div className="aspect-[3/4] bg-void-card border border-white/5 mb-4 overflow-hidden">
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    data-testid="product-main-image"
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`aspect-square border ${
                          selectedImage === idx ? 'border-cyber-cyan' : 'border-white/10'
                        } overflow-hidden`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono uppercase text-xs tracking-widest text-cyber-cyan mb-4">
              {product.category_id}
            </p>
            <h1
              data-testid="product-name"
              className="font-syne text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4"
            >
              {product.name}
            </h1>
            <p
              data-testid="product-price"
              className="font-mono text-2xl text-cyber-cyan mb-8"
            >
              ₹{product.price}
            </p>

            {product.description && (
              <p className="text-zinc-400 leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            {/* Limited Edition Badge */}
            <div className="mb-8">
              <LimitedEditionBadge product={product} />
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <p className="font-mono uppercase text-xs tracking-widest mb-3">Size</p>
              <div className="flex gap-3" data-testid="size-selector">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    data-testid={`size-${size}`}
                    className={`px-6 py-2 border font-mono text-sm ${
                      selectedSize === size
                        ? 'bg-cyber-cyan text-black border-cyber-cyan'
                        : 'bg-transparent text-white border-white/20 hover:border-cyber-cyan'
                    } transition-colors`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="mb-8">
              <p className="font-mono uppercase text-xs tracking-widest mb-3">Color</p>
              <div className="flex gap-3" data-testid="color-selector">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    data-testid={`color-${color.toLowerCase()}`}
                    className={`px-6 py-2 border font-mono text-sm ${
                      selectedColor === color
                        ? 'bg-cyber-cyan text-black border-cyber-cyan'
                        : 'bg-transparent text-white border-white/20 hover:border-cyber-cyan'
                    } transition-colors`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="font-mono uppercase text-xs tracking-widest mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  data-testid="quantity-decrease"
                  className="px-4 py-2 border border-white/20 hover:border-cyber-cyan transition-colors"
                >
                  -
                </button>
                <span data-testid="quantity-display" className="font-mono text-lg w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  data-testid="quantity-increase"
                  className="px-4 py-2 border border-white/20 hover:border-cyber-cyan transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <CyberButton
              onClick={handleAddToCart}
              data-testid="add-to-cart-button"
              className="w-full"
            >
              Add to Cart
            </CyberButton>

            {/* Stock Status */}
            <p className="font-mono text-xs text-zinc-500 mt-4">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          </motion.div>
        </div>

        {/* Review Section */}
        <div className="max-w-7xl mx-auto px-6 mt-16">
          <h2 className="font-syne text-3xl font-bold uppercase tracking-tighter mb-8">
            Customer Reviews
          </h2>
          <ReviewSection productId={id} />
        </div>
      </div>
    </div>
  );
}