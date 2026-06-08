import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder } from '../store/slices/orderSlice';
export default function OrderSuccessPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order } = useSelector(s => s.orders);
  useEffect(() => { dispatch(fetchOrder(id)); }, [id, dispatch]);
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ fontSize: 80, marginBottom: 24 }}>🎉</div>
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Order Placed!</h1>
      {order && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '20px 24px', marginBottom: 32 }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#14532d', marginBottom: 4 }}>Order ID: {order.orderId}</div>
        <div style={{ color: '#6b7280' }}>Total: ₹{order.totalPrice?.toLocaleString()}</div>
        <div style={{ color: '#6b7280', marginTop: 4 }}>We'll send tracking updates to your email.</div>
      </div>}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <Link to="/orders" className="btn btn-dark">View My Orders</Link>
        <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}
