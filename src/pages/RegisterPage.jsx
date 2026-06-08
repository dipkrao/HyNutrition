import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
export default function RegisterPage() {
  const dispatch = useDispatch(); const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  useEffect(() => { if (isAuthenticated) navigate('/profile'); }, [isAuthenticated, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);
  const handleSubmit = (e) => { e.preventDefault(); dispatch(register(form)); };
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', padding: 20 }}>
      <div className="card" style={{ padding: '48px 40px', width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>💪</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Join HY Nutrition</h1>
          <p style={{ color: '#6b7280' }}>Create your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          {[['name','Full Name','text','John Doe'],['email','Email','email','you@example.com'],['phone','Phone','tel','+91 98765 43210'],['password','Password','password','Min 6 characters']].map(([k,l,t,ph]) => (
            <div key={k} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>{l}</label>
              <input type={t} value={form[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} placeholder={ph} required={k !== 'phone'} style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#f59e0b', color: '#000', border: 'none', padding: 14, borderRadius: 10, fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 16, marginTop: 8 }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: '#f59e0b', fontWeight: 700 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
