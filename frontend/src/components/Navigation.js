import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX } from 'react-icons/fi';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav
      data-testid="main-navigation"
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-void/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-syne text-2xl font-bold tracking-tighter uppercase">
            <span className="text-white">INK</span>
            <span className="text-cyber-cyan neon-cyan">STREET</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              data-testid="nav-home"
              className="font-syne uppercase text-sm hover:text-cyber-cyan transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              data-testid="nav-shop"
              className="font-syne uppercase text-sm hover:text-cyber-cyan transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/custom"
              data-testid="nav-custom"
              className="font-syne uppercase text-sm hover:text-cyber-cyan transition-colors"
            >
              Custom Design
            </Link>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                <Link to="/wishlist" data-testid="nav-wishlist-icon" className="hover:text-cyber-cyan transition-colors">
                  <FiHeart size={20} />
                </Link>
                <Link to="/cart" data-testid="nav-cart-icon" className="hover:text-cyber-cyan transition-colors">
                  <FiShoppingCart size={20} />
                </Link>
                <Link to="/account" data-testid="nav-account-icon" className="hover:text-cyber-cyan transition-colors">
                  <FiUser size={20} />
                </Link>
                <button
                  onClick={handleLogout}
                  data-testid="nav-logout-button"
                  className="font-mono text-xs uppercase tracking-widest hover:text-cyber-cyan transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                data-testid="nav-login-button"
                className="font-mono text-xs uppercase tracking-widest hover:text-cyber-cyan transition-colors"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-toggle"
              className="md:hidden hover:text-cyber-cyan transition-colors"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-6 pb-6 border-t border-white/10 pt-6">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="font-syne uppercase text-sm hover:text-cyber-cyan transition-colors">
                Home
              </Link>
              <Link to="/shop" className="font-syne uppercase text-sm hover:text-cyber-cyan transition-colors">
                Shop
              </Link>
              <Link to="/custom" className="font-syne uppercase text-sm hover:text-cyber-cyan transition-colors">
                Custom Design
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};