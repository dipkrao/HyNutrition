import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false); const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/auth/forgotpassword', { email }); setSent(true); toast.success('Reset email sent!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };
  if (sent) return <div style={{ textAlign: 'center', padding: '80px 20px' }}><div style={{ fontSize: 64, marginBottom: 16 }}>📧</div><h2>Check your email</h2><p style={{ color: '#6b7280', marginTop: 8 }}>We sent a reset link to {email}</p><Link to="/login" style={{ display: 'inline-block', marginTop: 24, color: '#f59e0b', fontWeight: 700 }}>Back to Login</Link></div>;
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', padding: 20 }}>
      <div className="card" style={{ padding: '48px 40px', width: '100%', maxWidth: 420 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Forgot Password</h1>
        <p style={{ color: '#6b7280', marginBottom: 28 }}>Enter your email to receive a reset link.</p>
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 16 }} />
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#f59e0b', color: '#000', border: 'none', padding: 14, borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#6b7280', fontSize: 14 }}><Link to="/login" style={{ color: '#f59e0b', fontWeight: 700 }}>Back to Login</Link></p>
      </div>
    </div>
  );
}
