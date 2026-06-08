import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const BADGE_COLORS = {
  'Best Seller': '#f59e0b', 'New': '#10b981', 'Vegan': '#22c55e',
  'Top Rated': '#3b82f6', 'Hot': '#ef4444', 'Popular': '#8b5cf6', 'Sale': '#ef4444',
};

export default function ProductCard({ product, compact }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const cartItems = useSelector(s => s.cart.items);
  const inCart = cartItems.some(i => i._id === product._id);
  const inWishlist = user?.wishlist?.includes(product._id);
  const price = product.discountPrice || product.price;
  const discount = product.price > price ? Math.round(((product.price - price) / product.price) * 100) : 0;
  const rawImg = product.images?.[0];
  const img = typeof rawImg === 'string' ? rawImg : rawImg?.url;
  const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  const imgSrc = img ? (img.startsWith('http') ? img : `${API_BASE}${img}`) : null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to use wishlist'); return; }
    dispatch(toggleWishlist(product._id));
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <div onClick={() => navigate(`/product/${product.slug}`)} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
      {product.badge && <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, background: BADGE_COLORS[product.badge] || '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{product.badge}</div>}
      <button onClick={handleWishlist} style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, background: inWishlist ? '#ef4444' : 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 36, height: 36, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        {inWishlist ? '❤️' : '🤍'}
      </button>
      <div style={{ height: compact ? 120 : 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f8f9fa,#e9ecef)' }}>
        {imgSrc ? <img src={imgSrc} alt={product.name} style={{ height: '100%', objectFit: 'contain', padding: 8 }} /> : <span style={{ fontSize: compact ? 48 : 64 }}>💊</span>}
      </div>
      <div style={{ padding: compact ? '12px' : '16px' }}>
        <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{product.category?.name}</div>
        <div style={{ fontWeight: 700, fontSize: compact ? 13 : 15, color: '#111', marginBottom: 4, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.name}</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{product.shortDescription}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <span style={{ color: '#f59e0b', fontSize: 13 }}>{'★'.repeat(Math.round(product.ratings || 0))}{'☆'.repeat(5 - Math.round(product.ratings || 0))}</span>
          <span style={{ fontSize: 12, color: '#6b7280' }}>({product.numReviews || 0})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: compact ? 15 : 18, color: '#111' }}>₹{price?.toLocaleString()}</span>
            {discount > 0 && <>
              <span style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'line-through', marginLeft: 6 }}>₹{product.price?.toLocaleString()}</span>
              <span style={{ fontSize: 11, color: '#10b981', marginLeft: 4, fontWeight: 600 }}>{discount}% off</span>
            </>}
          </div>
          <button onClick={handleAddToCart} style={{ background: inCart ? '#111' : '#f59e0b', color: inCart ? '#fff' : '#000', border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            {inCart ? 'In Cart ✓' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
