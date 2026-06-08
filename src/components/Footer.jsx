import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState({ phone: '+91 98765 43210', address: 'Bangalore, KA 560034', email: 'support@hynutrition.in' });

  useEffect(() => {
    api.get('/settings').then(res => {
      const s = res.data.settings;
      setInfo({ phone: s.phone, address: s.address, email: s.email });
    }).catch(() => {});
  }, []);
  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/newsletter/subscribe', { email });
      toast.success(res.data.message);
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    }
  };

  return (
    <footer style={{ background: '#0a0a0a', color: '#9ca3af', padding: '64px 20px 24px' }}>
      <div className="container">
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💪</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>HY NUTRITION</div>
                <div style={{ color: '#f59e0b', fontSize: 9, letterSpacing: 3 }}>FUEL YOUR LIMITS</div>
              </div>
            </div>
            <p style={{ lineHeight: 1.7, fontSize: 14, marginBottom: 20 }}>India's premium sports nutrition brand. Trusted by 50,000+ athletes for clean, effective supplements.</p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', marginBottom: 16 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Your email" required style={{ flex: 1, padding: '10px 14px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px 0 0 8px', fontSize: 13, outline: 'none' }} />
              <button type="submit" style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 16px', borderRadius: '0 8px 8px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Subscribe</button>
            </form>
            <div style={{ fontSize: 12, color: '#4b5563' }}>Use WELCOME15 for 15% off your first order!</div>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, marginBottom: 16 }}>Shop</div>
            {[['All Products', '/shop'], ['Protein', '/shop/protein'], ['Pre-Workout', '/shop/pre-workout'], ['Vitamins', '/shop/vitamins'], ['Mass Gainer', '/shop/mass-gainer']].map(([l, p]) => (
              <Link key={l} to={p} style={{ display: 'block', marginBottom: 10, fontSize: 14 }}
                onMouseEnter={e => e.target.style.color = '#f59e0b'} onMouseLeave={e => e.target.style.color = '#9ca3af'}>{l}</Link>
            ))}
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, marginBottom: 16 }}>Company</div>
            {[['About Us', '/about'], ['Contact', '/contact'], ['Blog', '/blog']].map(([l, p]) => (
              <Link key={l} to={p} style={{ display: 'block', marginBottom: 10, fontSize: 14 }}
                onMouseEnter={e => e.target.style.color = '#f59e0b'} onMouseLeave={e => e.target.style.color = '#9ca3af'}>{l}</Link>
            ))}
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, marginBottom: 16 }}>Support</div>
            {[['My Orders', '/orders'], ['My Profile', '/profile'], ['Wishlist', '/wishlist'], ['Contact Us', '/contact']].map(([l, p]) => (
              <Link key={l} to={p} style={{ display: 'block', marginBottom: 10, fontSize: 14 }}
                onMouseEnter={e => e.target.style.color = '#f59e0b'} onMouseLeave={e => e.target.style.color = '#9ca3af'}>{l}</Link>
            ))}
            <div style={{ marginTop: 16 }}>
              <div style={{ color: '#fff', fontWeight: 700, marginBottom: 8, fontSize: 14 }}>📍 {info.address}</div>
              <div style={{ fontSize: 13 }}>📞 {info.phone}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>✉️ {info.email}</div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13 }}>© {new Date().getFullYear()} HY Nutrition. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 20 }}>💳 🏦 📱 💵</div>
        </div>
      </div>
    </footer>
  );
}
