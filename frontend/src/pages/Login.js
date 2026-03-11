import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { CyberButton } from '../components/CyberButton';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await axios.post(`${API}/auth/login`, {
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Login successful!');
        navigate('/');
      } else {
        const res = await axios.post(`${API}/auth/register`, {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone
        });
        toast.success('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-syne text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">
            <span className="text-white">INK</span>
            <span className="text-cyber-cyan">STREET</span>
          </h1>
          <p className="font-mono text-sm text-zinc-400">
            {isLogin ? 'Login to your account' : 'Create a new account'}
          </p>
        </div>

        <div className="bg-void-card border border-white/5 p-8">
          <form onSubmit={handleSubmit} data-testid={isLogin ? 'login-form' : 'register-form'} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="register-name-input"
                  required={!isLogin}
                  className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none placeholder:text-zinc-700 font-mono"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                data-testid="email-input"
                required
                className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none placeholder:text-zinc-700 font-mono"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                data-testid="password-input"
                required
                className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none placeholder:text-zinc-700 font-mono"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="font-mono uppercase text-xs tracking-widest text-zinc-400 mb-2 block">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="register-phone-input"
                  className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white focus:border-cyber-cyan focus:outline-none placeholder:text-zinc-700 font-mono"
                  placeholder="Your phone number"
                />
              </div>
            )}

            <CyberButton
              type="submit"
              disabled={loading}
              data-testid={isLogin ? 'login-submit-button' : 'register-submit-button'}
              className="w-full"
            >
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
            </CyberButton>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              data-testid="toggle-auth-mode"
              className="font-mono text-xs text-zinc-400 hover:text-cyber-cyan transition-colors"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="font-mono text-xs text-zinc-500 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}