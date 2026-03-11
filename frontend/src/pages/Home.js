import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProductCard } from '../components/ProductCard';
import { CyberButton } from '../components/CyberButton';
import { CyberParticles } from '../components/CyberParticles';
import { Hero3DScrollScene } from '../components/Hero3DScrollScene';

gsap.registerPlugin(ScrollTrigger);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const ctaRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Animate CTA button on scroll
    if (ctaRef.current) {
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1,
          },
        }
      );
    }
  }, []);

  const loadData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        axios.get(`${API}/categories`),
        axios.get(`${API}/products`)
      ]);
      setCategories(catRes.data);
      setFeaturedProducts(prodRes.data.slice(0, 8));
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Cyber Particles Background */}
      <CyberParticles />
      
      {/* Hero Section with Scroll Animation */}
      <section
        data-testid="hero-section"
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(5, 5, 5, 0.7), rgba(5, 5, 5, 0.9)), url('https://images.unsplash.com/photo-1587930708915-55a36837263b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHxjeWJlcnB1bmslMjBzdHJlZXR3ZWFyJTIwZmFzaGlvbiUyMG1vZGVsJTIwbmVvbnxlbnwwfHx8fDE3NzMyMTE4ODF8MA&ixlib=rb-4.1.0&q=85')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* 3D Scroll-Triggered Scene */}
        <div className="absolute inset-0 z-0 opacity-70">
          <Hero3DScrollScene />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-void opacity-80 z-0" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-6"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-mono uppercase text-xs tracking-widest text-cyber-cyan mb-4"
          >
            Gen-Z Culture • Streetwear • Anime
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-syne text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tighter mb-6"
          >
            <span className="text-white">INK</span>
            <span className="text-cyber-cyan neon-cyan">STREET</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Scroll to unfold. Bold. Edgy. Futuristic.
          </motion.p>
          
          {/* CTA appears after scroll */}
          <div ref={ctaRef} className="opacity-0">
            <Link to="/shop">
              <CyberButton data-testid="shop-the-drop-button">Shop the Drop</CyberButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono uppercase text-xs tracking-widest text-cyber-cyan mb-4">Collections</p>
          <h2 className="font-syne text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-12">
            Explore Categories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, idx) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  to={`/shop?category=${category.slug}`}
                  data-testid={`category-card-${category.slug}`}
                  className="group relative block h-96 overflow-hidden bg-void-card border border-white/5 hover:border-cyber-cyan/50 transition-all duration-300"
                >
                  <img
                    src={category.image_url || 'https://images.unsplash.com/photo-1608687087371-2950241246f9?w=800'}
                    alt={category.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 p-8">
                    <h3 className="font-syne text-3xl font-bold uppercase tracking-tighter mb-2 group-hover:text-cyber-cyan transition-colors">
                      {category.name}
                    </h3>
                    <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                      {category.products_count} Products
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono uppercase text-xs tracking-widest text-cyber-cyan mb-4">New Drops</p>
          <h2 className="font-syne text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-12">
            Featured Products
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {featuredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/shop">
              <CyberButton data-testid="view-all-button">View All Products</CyberButton>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-void-surface py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-syne text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-6">
              Create Your Own Design
            </h2>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              Upload your artwork and see it come to life on premium streetwear. Full creative control.
            </p>
            <Link to="/custom">
              <CyberButton data-testid="cta-custom-design-button">Start Designing</CyberButton>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}