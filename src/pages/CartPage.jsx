import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon, selectCartTotal } from '../store/slices/cartSlice';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, coupon, couponDiscount } = useSelector(s => s.cart);
  const { isAuthenticated } = useSelector(s => s.auth);
  const subtotal = useSelector(selectCartTotal);
  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);
  const discount = Math.round(subtotal * couponDiscount / 100);
  const shipping = subtotal >= 999 ? 0 : 99;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + shipping + tax;

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setApplying(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponInput, orderTotal: subtotal });
      dispatch(applyCoupon({ code: res.data.coupon.code, discount: res.data.coupon.discountValue }));
      toast.success(`Coupon applied! ${res.data.coupon.discountValue}% off`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally { setApplying(false); }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) { toast.error('Please login to checkout'); navigate('/login'); return; }
    navigate('/checkout');
  };

  if (items.length === 0) return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🛒</div>
      <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Your cart is empty</h2>
      <p style={{ color: '#6b7280', marginBottom: 32 }}>Add some supplements to get started!</p>
      <Link to="/shop" className="btn btn-primary">Shop Now</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 32 }}>Shopping Cart ({items.reduce((a,b) => a+b.quantity, 0)} items)</h1>
      <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
        <div>
          {items.map(item => {
            const price = item.discountPrice || item.price;
            const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
            const rawImg = item.images?.[0];
            const imgUrl = rawImg ? (typeof rawImg === 'string' ? rawImg : rawImg.url) : null;
            const imgSrc = imgUrl ? (imgUrl.startsWith('http') ? imgUrl : `${API_BASE}${imgUrl}`) : null;
            return (
              <div key={item._id} className="card cart-item" style={{ padding: 20, marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: 80, height: 80, background: '#f8f9fa', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {imgSrc ? <img src={imgSrc} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 32 }}>💊</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                  <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 8 }}>{item.shortDescription}</div>
                  <div style={{ fontWeight: 800, fontSize: 17 }}>₹{price?.toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                  <button onClick={() => { if (item.quantity === 1) dispatch(removeFromCart(item._id)); else dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 })); }} style={{ width: 36, height: 36, border: 'none', background: 'none', fontSize: 16, cursor: 'pointer' }}>−</button>
                  <span style={{ width: 36, textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                  <button onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))} style={{ width: 36, height: 36, border: 'none', background: 'none', fontSize: 16, cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, minWidth: 80, textAlign: 'right' }}>₹{(price * item.quantity)?.toLocaleString()}</div>
                <button onClick={() => dispatch(removeFromCart(item._id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 20 }}>✕</button>
              </div>
            );
          })}
        </div>
        <div>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 20 }}>Order Summary</h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())} placeholder="Coupon code" style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                <button onClick={handleApplyCoupon} disabled={applying} style={{ background: '#111', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{applying ? '...' : 'Apply'}</button>
              </div>
              {coupon && <div style={{ color: '#10b981', fontSize: 12, fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                ✓ "{coupon}" applied — {couponDiscount}% off!
                <button onClick={() => dispatch(removeCoupon())} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>Remove</button>
              </div>}
              <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>Try: HY10, HY20, WELCOME15, FIRST25</div>
            </div>
            {[['Subtotal', `₹${subtotal.toLocaleString()}`], ['Discount', `-₹${discount.toLocaleString()}`, '#10b981'], ['Shipping', shipping === 0 ? 'FREE' : `₹${shipping}`, shipping === 0 ? '#10b981' : undefined], ['Tax (5%)', `₹${tax.toLocaleString()}`]].map(([l, v, c]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                <span style={{ color: '#6b7280' }}>{l}</span><span style={{ fontWeight: 600, color: c || '#111' }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '2px solid #f0f0f0', paddingTop: 16, display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontWeight: 800, fontSize: 18 }}>Total</span>
              <span style={{ fontWeight: 900, fontSize: 22 }}>₹{total.toLocaleString()}</span>
            </div>
            <button onClick={handleCheckout} style={{ width: '100%', background: '#f59e0b', color: '#000', border: 'none', padding: 16, borderRadius: 10, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>Proceed to Checkout →</button>
            {shipping > 0 && <p style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, marginTop: 12 }}>Add ₹{(999 - subtotal).toLocaleString()} more for free shipping!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
