import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const POLICY_TITLES = {
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
  return: 'Return & Refund Policy',
  shipping: 'Shipping Policy',
  contact: 'Contact Us',
  faq: 'FAQ',
  size_guide: 'Size Guide'
};

export default function Policy() {
  const { type } = useParams();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolicy();
  }, [type]);

  const loadPolicy = async () => {
    try {
      const res = await axios.get(`${API}/policies/${type}`);
      setPolicy(res.data);
    } catch (err) {
      console.error('Error loading policy:', err);
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
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono uppercase text-xs tracking-widest text-cyber-cyan mb-4">
            {POLICY_TITLES[type] || 'Policy'}
          </p>
          <h1 className="font-syne text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-8">
            {policy?.title || POLICY_TITLES[type] || 'Policy'}
          </h1>
          
          <div className="prose prose-invert max-w-none">
            <div
              className="text-zinc-300 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: policy?.content || 'Content will be added soon.' }}
            />
          </div>

          {policy?.updated_at && (
            <p className="font-mono text-xs text-zinc-500 mt-12">
              Last updated: {new Date(policy.updated_at).toLocaleDateString()}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}