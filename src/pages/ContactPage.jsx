import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' });
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState({ phone: '+91 98765 43210', address: 'HY Nutrition HQ, Koramangala, Bangalore, Karnataka 560034', email: 'support@hynutrition.in' });

  useEffect(() => {
    api.get('/settings').then(res => {
      const s = res.data.settings;
      setInfo({ phone: s.phone, address: s.address, email: s.email });
    }).catch(() => {});
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success("Message sent! We'll reply within 24 hours.");
    setForm({ name:'', email:'', subject:'', message:'' }); setLoading(false);
  };
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 12 }}>Get In <span style={{ color: '#f59e0b' }}>Touch</span></h1>
        <p style={{ color: '#6b7280', fontSize: 16 }}>We're here to help with any questions about our products.</p>
      </div>
      <div className="grid-2" style={{ gap: 48 }}>
        <div className="card" style={{ padding: 32 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 24 }}>Send a Message</h3>
          <form onSubmit={handleSubmit}>
            {[['name','Name','text'],['email','Email','email'],['subject','Subject','text']].map(([k,l,t]) => (
              <div key={k} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>{l}</label>
                <input type={t} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} required style={{ width:'100%', padding:'12px 16px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:14, outline:'none', boxSizing:'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Message</label>
              <textarea value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))} rows={5} required style={{ width:'100%', padding:'12px 16px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:14, outline:'none', resize:'vertical', boxSizing:'border-box' }} />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>{loading ? 'Sending...' : 'Send Message'}</button>
          </form>
        </div>
        <div>
          <h3 style={{ fontWeight: 800, marginBottom: 24 }}>Contact Information</h3>
          {[['📍','Address', info.address],['📞','Phone', info.phone],['📧','Email', info.email],['🕒','Hours','Mon–Sat: 9am–7pm IST'],['📸','Instagram','@hynutrition'],['🚚','Free Shipping','On orders above ₹999']].map(([icon,title,inf]) => (
            <div key={title} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <div style={{ fontSize: 28 }}>{icon}</div>
              <div><div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div><div style={{ color: '#6b7280' }}>{inf}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
