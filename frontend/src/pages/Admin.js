import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CyberButton } from '../components/CyberButton';
import { toast } from 'sonner';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // New category/product forms
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', image_url: '' });
  const [productForm, setProductForm] = useState({
    name: '', slug: '', category_id: '', price: 0, description: '',
    images: '', sizes: 'S,M,L,XL', colors: 'Black,White', stock: 100
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || !user.is_admin) {
      toast.error('Admin access required');
      navigate('/');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, catRes, prodRes, ordersRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers }),
        axios.get(`${API}/categories`, { headers }),
        axios.get(`${API}/products`, { headers }),
        axios.get(`${API}/admin/orders`, { headers })
      ]);

      setStats(statsRes.data);
      setCategories(catRes.data);
      setProducts(prodRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/categories`, categoryForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Category created!');
      setShowCategoryForm(false);
      setCategoryForm({ name: '', slug: '', description: '', image_url: '' });
      loadData();
    } catch (err) {
      toast.error('Failed to create category');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const productData = {
        ...productForm,
        images: productForm.images.split(',').map(i => i.trim()).filter(Boolean),
        sizes: productForm.sizes.split(',').map(s => s.trim()),
        colors: productForm.colors.split(',').map(c => c.trim()),
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock)
      };
      await axios.post(`${API}/products`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product created!');
      setShowProductForm(false);
      setProductForm({
        name: '', slug: '', category_id: '', price: 0, description: '',
        images: '', sizes: 'S,M,L,XL', colors: 'Black,White', stock: 100
      });
      loadData();
    } catch (err) {
      toast.error('Failed to create product');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Category deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete product');
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
          <p className="font-mono uppercase text-xs tracking-widest text-cyber-cyan mb-4">Admin Panel</p>
          <h1 className="font-syne text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-12">
            Dashboard
          </h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-white/10" data-testid="admin-tabs">
            {['dashboard', 'categories', 'products', 'orders'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                data-testid={`tab-${tab}`}
                className={`pb-4 font-mono text-sm uppercase tracking-widest border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-cyber-cyan text-cyber-cyan'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6" data-testid="dashboard-stats">
              <div className="bg-void-card border border-white/5 p-6">
                <p className="font-mono text-xs text-zinc-400 mb-2">Total Orders</p>
                <p className="font-syne text-3xl font-bold text-cyber-cyan">{stats.total_orders}</p>
              </div>
              <div className="bg-void-card border border-white/5 p-6">
                <p className="font-mono text-xs text-zinc-400 mb-2">Total Products</p>
                <p className="font-syne text-3xl font-bold text-cyber-cyan">{stats.total_products}</p>
              </div>
              <div className="bg-void-card border border-white/5 p-6">
                <p className="font-mono text-xs text-zinc-400 mb-2">Total Customers</p>
                <p className="font-syne text-3xl font-bold text-cyber-cyan">{stats.total_customers}</p>
              </div>
              <div className="bg-void-card border border-white/5 p-6">
                <p className="font-mono text-xs text-zinc-400 mb-2">Total Revenue</p>
                <p className="font-syne text-3xl font-bold text-cyber-cyan">₹{stats.total_revenue.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div data-testid="categories-section">
              <div className="mb-6">
                <CyberButton onClick={() => setShowCategoryForm(!showCategoryForm)} data-testid="add-category-button">
                  <FiPlus className="inline mr-2" /> Add Category
                </CyberButton>
              </div>

              {showCategoryForm && (
                <form onSubmit={handleCreateCategory} className="bg-void-card border border-white/5 p-6 mb-8 space-y-4">
                  <input
                    type="text"
                    placeholder="Category Name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    data-testid="category-name-input"
                    required
                    className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Slug (e.g., streetwear)"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    data-testid="category-slug-input"
                    required
                    className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={categoryForm.image_url}
                    onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                  />
                  <textarea
                    placeholder="Description"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full bg-transparent border border-white/20 p-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                    rows="3"
                  />
                  <CyberButton type="submit" data-testid="save-category-button">Save Category</CyberButton>
                </form>
              )}

              <div className="space-y-4">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-void-card border border-white/5 p-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-syne text-xl font-bold">{cat.name}</h3>
                      <p className="font-mono text-xs text-zinc-400">{cat.slug} • {cat.products_count} products</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      data-testid={`delete-category-${cat.id}`}
                      className="text-zinc-400 hover:text-cyber-red transition-colors"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div data-testid="products-section">
              <div className="mb-6">
                <CyberButton onClick={() => setShowProductForm(!showProductForm)} data-testid="add-product-button">
                  <FiPlus className="inline mr-2" /> Add Product
                </CyberButton>
              </div>

              {showProductForm && (
                <form onSubmit={handleCreateProduct} className="bg-void-card border border-white/5 p-6 mb-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      data-testid="product-name-input"
                      required
                      className="bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Slug"
                      value={productForm.slug}
                      onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                      required
                      className="bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      data-testid="product-category-select"
                      required
                      className="bg-void-surface border border-white/20 px-3 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Price"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                      className="bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Image URLs (comma separated)"
                    value={productForm.images}
                    onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                  />
                  <textarea
                    placeholder="Description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-transparent border border-white/20 p-3 text-white focus:border-cyber-cyan focus:outline-none font-mono"
                    rows="3"
                  />
                  <CyberButton type="submit" data-testid="save-product-button">Save Product</CyberButton>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(prod => (
                  <div key={prod.id} className="bg-void-card border border-white/5 p-6 flex justify-between items-start">
                    <div>
                      <h3 className="font-syne text-lg font-bold">{prod.name}</h3>
                      <p className="font-mono text-sm text-cyber-cyan">₹{prod.price}</p>
                      <p className="font-mono text-xs text-zinc-400 mt-1">Stock: {prod.stock}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      data-testid={`delete-product-${prod.id}`}
                      className="text-zinc-400 hover:text-cyber-red transition-colors"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4" data-testid="orders-section">
              {orders.map(order => (
                <div key={order.id} className="bg-void-card border border-white/5 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-sm mb-1">Order #{order.id.slice(0, 8)}</p>
                      <p className="font-mono text-xs text-zinc-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg text-cyber-cyan">₹{order.total.toFixed(2)}</p>
                      <span className="font-mono text-xs px-3 py-1 bg-zinc-700 text-zinc-400">
                        {order.order_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="font-mono text-xs text-zinc-500 mt-4">
                    {order.items.length} item(s)
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
