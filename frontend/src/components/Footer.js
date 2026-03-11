import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

export const Footer = () => {
  return (
    <footer className="bg-void-surface border-t border-white/5 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-syne text-xl font-bold mb-4">
              <span className="text-white">INK</span>
              <span className="text-cyber-cyan">STREET</span>
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Gen-Z streetwear and anime culture. Bold, edgy, futuristic.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-cyber-cyan transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="hover:text-cyber-cyan transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="hover:text-cyber-cyan transition-colors">
                <FiFacebook size={20} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-mono uppercase text-xs tracking-widest mb-4 text-cyber-cyan">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop?category=streetwear" className="text-zinc-400 hover:text-white transition-colors">Streetwear</Link></li>
              <li><Link to="/shop?category=anime" className="text-zinc-400 hover:text-white transition-colors">Anime Collection</Link></li>
              <li><Link to="/custom" className="text-zinc-400 hover:text-white transition-colors">Custom Design</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-mono uppercase text-xs tracking-widest mb-4 text-cyber-cyan">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="text-zinc-400 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/size-guide" className="text-zinc-400 hover:text-white transition-colors">Size Guide</Link></li>
              <li><Link to="/track-order" className="text-zinc-400 hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/contact" className="text-zinc-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-mono uppercase text-xs tracking-widest mb-4 text-cyber-cyan">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/policy/privacy" className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/policy/terms" className="text-zinc-400 hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/policy/return" className="text-zinc-400 hover:text-white transition-colors">Return Policy</Link></li>
              <li><Link to="/policy/shipping" className="text-zinc-400 hover:text-white transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/5 pt-8 text-center">
          <p className="text-zinc-500 text-sm font-mono">
            © 2026 INKSTREET. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};