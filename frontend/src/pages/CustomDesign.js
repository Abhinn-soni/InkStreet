import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CyberButton } from '../components/CyberButton';
import { FiUpload } from 'react-icons/fi';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CustomDesign3D } from '../components/CustomDesign3D';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CustomDesign() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [productType, setProductType] = useState('tshirt');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add custom design to cart');
      navigate('/login');
      return;
    }

    if (!uploadedImage) {
      toast.error('Please upload a design first');
      return;
    }

    setLoading(true);
    try {
      // For now, add as a custom product to cart
      // In production, this would upload to cloud storage and create custom product
      await axios.post(
        `${API}/cart/add`,
        {
          product_id: 'custom-design-temp',
          quantity: 1,
          size: selectedSize,
          color: selectedColor,
          custom_design_url: uploadedImage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Custom design added to cart!');
      navigate('/cart');
    } catch (err) {
      toast.error('Failed to add to cart');
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
          <p className="font-mono uppercase text-xs tracking-widest text-cyber-cyan mb-4">Custom Print</p>
          <h1 className="font-syne text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-6">
            Design Your Own
          </h1>
          <p className="text-zinc-400 mb-12 max-w-2xl">
            Upload your artwork and see it come to life on premium apparel. Full creative control.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 3D Preview */}
            <div>
              <div 
                className="bg-void-card border border-cyber-cyan/30 aspect-square relative overflow-hidden" 
                data-testid="3d-preview"
              >
                <CustomDesign3D designImage={uploadedImage} />
              </div>
              <p className="font-mono text-xs text-zinc-500 mt-4 text-center">
                {uploadedImage ? 'Drag to rotate • Auto-spinning enabled' : 'Upload a design to see 3D preview'}
              </p>
            </div>

            {/* Customization Options */}
            <div className="space-y-8">
              {/* Upload Design */}
              <div>
                <h3 className="font-syne text-xl font-bold mb-4">Upload Design</h3>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                  data-testid="file-input"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="upload-button"
                  className="w-full bg-void-surface border border-white/10 p-8 hover:border-cyber-cyan transition-colors flex flex-col items-center justify-center gap-4"
                >
                  <FiUpload size={32} className="text-cyber-cyan" />
                  <p className="font-mono text-sm">
                    {uploadedImage ? 'Change Image' : 'Click to upload PNG/JPG'}
                  </p>
                  <p className="font-mono text-xs text-zinc-500">
                    Recommended: 1000x1000px, transparent background
                  </p>
                </button>
              </div>

              {/* Product Type */}
              <div>
                <h3 className="font-syne text-xl font-bold mb-4">Product Type</h3>
                <div className="grid grid-cols-3 gap-4" data-testid="product-type-selector">
                  {['T-Shirt', 'Hoodie', 'Cap'].map(type => (
                    <button
                      key={type}
                      onClick={() => setProductType(type.toLowerCase())}
                      data-testid={`type-${type.toLowerCase()}`}
                      className={`px-4 py-3 border font-mono text-sm ${
                        productType === type.toLowerCase()
                          ? 'bg-cyber-cyan text-black border-cyber-cyan'
                          : 'bg-transparent text-white border-white/20 hover:border-cyber-cyan'
                      } transition-colors`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <h3 className="font-syne text-xl font-bold mb-4">Size</h3>
                <div className="flex gap-3" data-testid="size-selector">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
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

              {/* Color */}
              <div>
                <h3 className="font-syne text-xl font-bold mb-4">Color</h3>
                <div className="flex gap-3" data-testid="color-selector">
                  {['Black', 'White', 'Navy', 'Gray'].map(color => (
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

              {/* Price & Add to Cart */}
              <div className="pt-6 border-t border-white/10">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-mono text-zinc-400">Price</span>
                  <span className="font-syne text-2xl font-bold text-cyber-cyan" data-testid="custom-price">₹999</span>
                </div>
                <CyberButton
                  onClick={handleAddToCart}
                  disabled={loading || !uploadedImage}
                  data-testid="add-custom-to-cart"
                  className="w-full"
                >
                  {loading ? 'Adding...' : 'Add to Cart'}
                </CyberButton>
                <p className="font-mono text-xs text-zinc-500 mt-4">
                  * Custom printed items are non-returnable unless damaged or defective
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
