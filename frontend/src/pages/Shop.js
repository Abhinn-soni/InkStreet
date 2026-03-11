import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ProductCard } from '../components/ProductCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Shop() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || 'all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (categorySlug) {
      setSelectedCategory(categorySlug);
    }
  }, [categorySlug]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      const catRes = await axios.get(`${API}/categories`);
      setCategories(catRes.data);
      await loadProducts();
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      let url = `${API}/products`;
      if (selectedCategory !== 'all') {
        const category = categories.find(c => c.slug === selectedCategory);
        if (category) {
          url += `?category_id=${category.id}`;
        }
      }
      const prodRes = await axios.get(url);
      setProducts(prodRes.data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="font-mono uppercase text-xs tracking-widest text-cyber-cyan mb-4">Shop</p>
          <h1 className="font-syne text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-6">
            All Products
          </h1>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-4" data-testid="category-filter">
            <button
              onClick={() => setSelectedCategory('all')}
              data-testid="filter-all"
              className={`px-6 py-2 font-mono text-xs uppercase tracking-widest border transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-cyber-cyan text-black border-cyber-cyan'
                  : 'bg-transparent text-white border-white/20 hover:border-cyber-cyan'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                data-testid={`filter-${cat.slug}`}
                className={`px-6 py-2 font-mono text-xs uppercase tracking-widest border transition-colors ${
                  selectedCategory === cat.slug
                    ? 'bg-cyber-cyan text-black border-cyber-cyan'
                    : 'bg-transparent text-white border-white/20 hover:border-cyber-cyan'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-24">
            <p className="font-mono text-zinc-400 animate-pulse">Loading...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-mono text-zinc-400">No products found</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12"
            data-testid="products-grid"
          >
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
          </motion.div>
        )}
      </div>
    </div>
  );
}