import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'sonner';
import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { ChatWidget } from './components/ChatWidget';
import { LoadingScreen } from './components/LoadingScreen';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import CustomDesign from './pages/CustomDesign';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Account from './pages/Account';
import Policy from './pages/Policy';
import Admin from './pages/Admin';

function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);

  return (
    <div className="App min-h-screen bg-void text-white">
      <LoadingScreen onLoadingComplete={() => setLoadingComplete(true)} />
      
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#121212',
            color: '#fff',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px'
          }
        }}
      />
      
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/custom" element={<CustomDesign />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          
          {/* Policy Pages */}
          <Route path="/policy/:type" element={<Policy />} />
          <Route path="/faq" element={<Policy />} />
          <Route path="/size-guide" element={<Policy />} />
          <Route path="/track-order" element={<Policy />} />
          <Route path="/contact" element={<Policy />} />
          
          {/* Admin */}
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Footer />
        <ChatWidget />
      </BrowserRouter>
    </div>
  );
}

export default App;
