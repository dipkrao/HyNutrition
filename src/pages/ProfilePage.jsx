import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, logout } from '../store/slices/authSlice';
import { fetchMyOrders } from '../store/slices/orderSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { orders } = useSelector(s => s.orders);
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  const handleSave = async () => {
    await dispatch(updateProfile(form));
    toast.success('Profile updated!');
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out');
    navigate('/');
  };

  const STATUS_COLOR = { processing: '#fef3c7', confirmed: '#dbeafe', shipped: '#ede9fe', delivered: '#dcfce7', cancelled: '#fee2e2' };
  const STATUS_TEXT = { processing: '#92400e', confirmed: '#1e40af', shipped: '#5b21b6', delivered: '#14532d', cancelled: '#991b1b' };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
      <aside className="card" style={{ padding: 24, height: 'fit-content' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 28, margin: '0 auto 12px' }}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{user?.name}</div>
          <div style={{ color: '#6b7280', fontSize: 13 }}>{user?.email}</div>
        </div>
        {[['profile','👤 Profile'],['orders','📦 My Orders'],['wishlist','❤️ Wishlist'],['addresses','📍 Addresses']].map(([id,label]) => (
          <div key={id} onClick={() => id === 'wishlist' ? navigate('/wishlist') : setTab(id)} style={{ padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: tab === id ? 700 : 400, background: tab === id ? '#fffbeb' : 'transparent', color: tab === id ? '#92400e' : '#374151', marginBottom: 4, fontSize: 14 }}>{label}</div>
        ))}
        <button onClick={handleLogout} style={{ width: '100%', background: '#fee2e2', color: '#991b1b', border: 'none', padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, marginTop: 16, fontSize: 14 }}>🚪 Logout</button>
      </aside>

      <main>
        {tab === 'profile' && (
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontWeight: 800, marginBottom: 24 }}>Profile Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {[['name','Full Name','text'],['phone','Phone','tel']].map(([k,l,t]) => (
                <div key={k}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>{l}</label>
                  <input type={t} value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Email</label>
                <input value={user?.email} disabled style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: '#f9fafb', color: '#9ca3af', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>Member Since</label>
                <input value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN',{year:'numeric',month:'long'}) : ''} disabled style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: '#f9fafb', color: '#9ca3af', boxSizing: 'border-box' }} />
              </div>
            </div>
            <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
          </div>
        )}
        {tab === 'orders' && (
          <div>
            <h2 style={{ fontWeight: 800, marginBottom: 24 }}>My Orders</h2>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
                <p>No orders yet. <span onClick={() => navigate('/shop')} style={{ color: '#f59e0b', cursor: 'pointer', fontWeight: 700 }}>Start shopping!</span></p>
              </div>
            ) : orders.map(o => (
              <div key={o._id} className="card" style={{ padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div><div style={{ fontWeight: 800, fontSize: 16 }}>{o.orderId}</div><div style={{ color: '#6b7280', fontSize: 13 }}>{new Date(o.createdAt).toLocaleDateString('en-IN')} · {o.items?.length} items</div></div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: STATUS_COLOR[o.orderStatus] || '#f3f4f6', color: STATUS_TEXT[o.orderStatus] || '#374151' }}>{o.orderStatus?.charAt(0).toUpperCase() + o.orderStatus?.slice(1)}</span>
                    <div style={{ fontWeight: 800, fontSize: 18, marginTop: 4 }}>₹{o.totalPrice?.toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                  {['processing','shipped','delivered'].map((s,i) => {
                    const statuses = ['processing','confirmed','shipped','delivered'];
                    const done = statuses.indexOf(o.orderStatus) >= statuses.indexOf(s);
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#f59e0b' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: done ? '#000' : '#9ca3af' }}>{i+1}</div>
                        {i < 2 && <div style={{ width: 40, height: 2, background: done ? '#f59e0b' : '#e5e7eb' }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'addresses' && (
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontWeight: 800, marginBottom: 24 }}>Saved Addresses</h2>
            {user?.addresses?.length > 0 ? user.addresses.map((a,i) => (
              <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{a.label} {a.isDefault && <span style={{ fontSize: 11, background: '#dcfce7', color: '#14532d', padding: '2px 8px', borderRadius: 12, marginLeft: 8 }}>Default</span>}</div>
                <div style={{ color: '#374151', fontSize: 14 }}>{a.fullName} · {a.phone}</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>{a.addressLine1}, {a.city}, {a.state} - {a.pincode}</div>
              </div>
            )) : (
              <div style={{ border: '2px dashed #e5e7eb', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', color: '#6b7280' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
                <div style={{ fontWeight: 600 }}>Add New Address</div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
