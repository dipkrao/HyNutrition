import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../store/slices/orderSlice';
import { clearCart, selectCartTotal } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, coupon } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const { loading } = useSelector(s => s.orders);
  const subtotal = useSelector(selectCartTotal);
  const shipping = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;
  const [form, setForm] = useState({ fullName: user?.name || '', phone: user?.phone || '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', paymentMethod: 'razorpay' });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleOrder = async () => {
    if (!form.fullName || !form.phone || !form.addressLine1 || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all required fields'); return;
    }
    const orderData = {
      items: items.map(i => ({ product: i._id, quantity: i.quantity })),
      shippingAddress: { fullName: form.fullName, phone: form.phone, addressLine1: form.addressLine1, addressLine2: form.addressLine2, city: form.city, state: form.state, pincode: form.pincode },
      paymentMethod: form.paymentMethod,
      couponCode: coupon,
    };
    const res = await dispatch(createOrder(orderData));
    if (res.payload?.order) {
      dispatch(clearCart());
      toast.success(`Order ${res.payload.order.orderId} placed! 🎉`);
      navigate(`/order-success/${res.payload.order._id}`);
    } else {
      toast.error(res.payload || 'Order failed');
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 32 }}>Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
        <div>
          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Delivery Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[['fullName','Full Name *','text'],['phone','Phone *','tel']].map(([k,l,t]) => (
                <div key={k}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{l}</label>
                  <input type={t} value={form[k]} onChange={e => setF(k, e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              {[['addressLine1','Address Line 1 *','text'],['addressLine2','Address Line 2','text']].map(([k,l,t]) => (
                <div key={k} style={{ gridColumn: '1/-1' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{l}</label>
                  <input type={t} value={form[k]} onChange={e => setF(k, e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              {[['city','City *'],['state','State *'],['pincode','Pincode *']].map(([k,l]) => (
                <div key={k}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{l}</label>
                  <input value={form[k]} onChange={e => setF(k, e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontWeight: 800, marginBottom: 20 }}>Payment Method</h3>
            {[['razorpay','Razorpay','💳','UPI, Cards, Netbanking'],['stripe','Stripe','🌐','International Cards'],['cod','Cash on Delivery','💵','Pay when delivered']].map(([id,label,icon,sub]) => (
              <div key={id} onClick={() => setF('paymentMethod', id)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, border: `2px solid ${form.paymentMethod === id ? '#f59e0b' : '#e5e7eb'}`, borderRadius: 12, marginBottom: 12, cursor: 'pointer', background: form.paymentMethod === id ? '#fffbeb' : '#fff', transition: 'all 0.2s' }}>
                <div style={{ fontSize: 28 }}>{icon}</div>
                <div><div style={{ fontWeight: 700 }}>{label}</div><div style={{ fontSize: 12, color: '#6b7280' }}>{sub}</div></div>
                <div style={{ marginLeft: 'auto', width: 20, height: 20, border: `2px solid ${form.paymentMethod === id ? '#f59e0b' : '#d1d5db'}`, borderRadius: '50%', background: form.paymentMethod === id ? '#f59e0b' : 'transparent' }} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Order Summary ({items.length} items)</h3>
            {items.map(i => {
              const p = i.discountPrice || i.price;
              return (
                <div key={i._id} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                  <div style={{ fontSize: 28 }}>{i.images?.[0]?.url ? <img src={i.images[0].url} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} /> : '💊'}</div>
                  <div style={{ flex: 1, fontSize: 13 }}><div style={{ fontWeight: 600 }}>{i.name}</div><div style={{ color: '#6b7280' }}>Qty: {i.quantity}</div></div>
                  <span style={{ fontWeight: 700 }}>₹{(p * i.quantity).toLocaleString()}</span>
                </div>
              );
            })}
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 8 }}>
              {[['Subtotal', `₹${subtotal.toLocaleString()}`],['Shipping', shipping === 0 ? 'FREE' : `₹${shipping}`],['Tax (5%)', `₹${tax.toLocaleString()}`]].map(([l,v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: '#6b7280' }}>{l}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f0f0f0', paddingTop: 12, marginTop: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 18 }}>Total</span>
                <span style={{ fontWeight: 900, fontSize: 22 }}>₹{total.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={handleOrder} disabled={loading} style={{ width: '100%', background: loading ? '#e5e7eb' : '#f59e0b', color: loading ? '#9ca3af' : '#000', border: 'none', padding: 16, borderRadius: 10, fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 20 }}>
              {loading ? 'Placing Order...' : form.paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ₹${total.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
