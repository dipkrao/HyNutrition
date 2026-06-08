import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../store/slices/orderSlice';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';

const STATUS_STYLE = {
  processing: { bg: '#fef3c7', color: '#92400e' },
  confirmed:  { bg: '#dbeafe', color: '#1e40af' },
  shipped:    { bg: '#ede9fe', color: '#5b21b6' },
  delivered:  { bg: '#dcfce7', color: '#14532d' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b' },
};

export default function OrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useSelector(s => s.orders);
  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  if (loading) return <Spinner center />;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 32 }}>My Orders</h1>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>📦</div>
          <h2 style={{ marginBottom: 12 }}>No orders yet</h2>
          <button onClick={() => navigate('/shop')} className="btn btn-primary">Start Shopping</button>
        </div>
      ) : orders.map(o => {
        const ss = STATUS_STYLE[o.orderStatus] || { bg: '#f3f4f6', color: '#374151' };
        return (
          <div key={o._id} className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>Order {o.orderId}</div>
                <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>Placed on {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
              <span style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700, background: ss.bg, color: ss.color }}>
                {o.orderStatus?.charAt(0).toUpperCase() + o.orderStatus?.slice(1)}
              </span>
            </div>
            <div style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>
              {o.items?.slice(0,3).map(i => i.name).join(', ')}{o.items?.length > 3 ? ` +${o.items.length - 3} more` : ''}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 20 }}>₹{o.totalPrice?.toLocaleString()}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {['Processing','Shipped','Delivered'].map((s, i) => {
                  const order = ['processing','confirmed','shipped','delivered'];
                  const active = order.indexOf(o.orderStatus) >= order.indexOf(s.toLowerCase());
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: active ? '#f59e0b' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: active ? '#000' : '#9ca3af' }}>{i+1}</div>
                      {i < 2 && <div style={{ width: 32, height: 2, background: active ? '#f59e0b' : '#e5e7eb' }} />}
                    </div>
                  );
                })}
              </div>
            </div>
            {o.trackingNumber && (
              <div style={{ marginTop: 12, background: '#f8f9fa', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                📦 Tracking: <strong>{o.trackingNumber}</strong> via {o.shippingCarrier}
                {o.trackingUrl && <a href={o.trackingUrl} target="_blank" rel="noreferrer" style={{ color: '#f59e0b', marginLeft: 8 }}>Track →</a>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
