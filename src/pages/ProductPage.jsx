import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct, addToRecentlyViewed } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/authSlice';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} onClick={() => onChange(s)} style={{ fontSize: 28, cursor: 'pointer', color: s <= value ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </div>
  );
}

function ReviewsTab({ productId, numReviews }) {
  const { isAuthenticated } = useSelector(s => s.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadReviews = useCallback(() => {
    setLoading(true);
    api.get(`/reviews/product/${productId}`)
      .then(r => setReviews(r.data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.comment.trim()) { toast.error('Please fill in title and comment'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { product: productId, ...form });
      toast.success('Review submitted! It will appear after approval.');
      setForm({ rating: 5, title: '', comment: '' });
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <span style={{ color: '#6b7280', fontSize: 14 }}>{numReviews} approved review{numReviews !== 1 ? 's' : ''}</span>
        {isAuthenticated ? (
          <button onClick={() => setShowForm(f => !f)} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            {showForm ? 'Cancel' : '✏️ Write a Review'}
          </button>
        ) : (
          <p style={{ color: '#6b7280', fontSize: 13 }}>Please <a href="/login" style={{ color: '#f59e0b', fontWeight: 700 }}>log in</a> to write a review.</p>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 12, padding: 24, marginBottom: 32 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Your Review</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Rating</label>
            <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} maxLength={100} placeholder="Summarise your experience" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Comment</label>
            <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} rows={4} maxLength={1000} placeholder="Tell others about your experience with this product" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={submitting} style={{ background: '#111', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}

      {loading ? <Spinner center /> : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map(r => (
            <div key={r._id} style={{ border: '1px solid #f0f0f0', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {r.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.user?.name || 'Anonymous'}</div>
                    {r.isVerifiedPurchase && <span style={{ fontSize: 11, background: '#dcfce7', color: '#14532d', padding: '1px 8px', borderRadius: 10, fontWeight: 700 }}>✓ Verified Purchase</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#f59e0b', fontSize: 15 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{r.title}</div>
              <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading, error } = useSelector(s => s.products);
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('desc');
  const [related, setRelated] = useState([]);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!slug) { console.error('[ProductPage] No slug/id in URL params'); return; }
    console.log('[ProductPage] Fetching product for identifier:', slug);
    dispatch(fetchProduct(slug))
      .unwrap()
      .then(data => console.log('[ProductPage] Fetched product:', data?.product?.name))
      .catch(err => console.error('[ProductPage] Fetch failed for identifier:', slug, '| Error:', err));
    setQty(1); setTab('desc'); setImgIdx(0);
  }, [slug, dispatch]);

  useEffect(() => {
    if (product) {
      dispatch(addToRecentlyViewed(product));
      api.get(`/products/${product._id}/related`).then(r => setRelated(r.data.products)).catch(() => {});
    }
  }, [product, dispatch]);

  const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  const getImgUrl = (img) => {
    if (!img) return null;
    const url = typeof img === 'string' ? img : img.url;
    return url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : null;
  };

  if (loading) return <Spinner center />;
  if (!product) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
      <h2 style={{ marginBottom: 12 }}>Product not found</h2>
      {error && <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 16 }}>{error}</p>}
      <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>The product "{slug}" could not be found.</p>
      <button onClick={() => navigate('/shop')} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Browse All Products</button>
    </div>
  );

  const price = product.discountPrice || product.price;
  const discount = product.price > price ? Math.round(((product.price - price) / product.price) * 100) : 0;
  const inWishlist = user?.wishlist?.includes(product._id);

  const handleAddToCart = () => {
    dispatch(addToCart({ product, quantity: qty }));
    toast.success(`${qty}x ${product.name} added to cart!`);
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 20px' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14, marginBottom: 24 }}>← Back</button>
      <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 48 }}>
        {/* Images */}
        <div>
          <div style={{ background: 'linear-gradient(135deg,#f8f9fa,#e9ecef)', borderRadius: 24, height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' }}>
            {getImgUrl(product.images?.[imgIdx]) ? <img src={getImgUrl(product.images[imgIdx])} alt={product.name} style={{ maxHeight: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 120 }}>💊</span>}
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {product.images.map((img, i) => (
                <div key={i} onClick={() => setImgIdx(i)} style={{ width: 72, height: 72, borderRadius: 8, border: `2px solid ${i === imgIdx ? '#f59e0b' : '#e5e7eb'}`, overflow: 'hidden', cursor: 'pointer', background: '#f8f9fa' }}>
                  <img src={getImgUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Info */}
        <div>
          {product.badge && <span style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, marginBottom: 12 }}>{product.badge}</span>}
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#111', marginBottom: 8 }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ color: '#f59e0b', fontSize: 18 }}>{'★'.repeat(Math.round(product.ratings || 0))}</span>
            <span style={{ color: '#6b7280', fontSize: 14 }}>{product.numReviews} reviews</span>
            <span style={{ color: product.stock > 0 ? '#10b981' : '#ef4444', fontSize: 13, fontWeight: 600 }}>
              {product.stock > 0 ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}
            </span>
          </div>
          <p style={{ color: '#374151', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 28 }}>
            <span style={{ fontSize: 36, fontWeight: 900 }}>₹{price?.toLocaleString()}</span>
            {discount > 0 && <>
              <span style={{ fontSize: 20, color: '#9ca3af', textDecoration: 'line-through' }}>₹{product.price?.toLocaleString()}</span>
              <span style={{ background: '#dcfce7', color: '#14532d', fontSize: 14, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{discount}% OFF</span>
            </>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #e5e7eb', borderRadius: 8 }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 40, border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', fontWeight: 700 }}>−</button>
              <span style={{ width: 40, textAlign: 'center', fontWeight: 700 }}>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: 40, height: 40, border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', fontWeight: 700 }}>+</button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0} style={{ flex: 1, background: product.stock === 0 ? '#e5e7eb' : '#f59e0b', color: product.stock === 0 ? '#9ca3af' : '#000', border: 'none', padding: '14px 24px', borderRadius: 8, fontSize: 15, fontWeight: 800, cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}>
              {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>
            <button onClick={() => { if (!isAuthenticated) { toast.error('Please login'); return; } dispatch(toggleWishlist(product._id)); toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist'); }} style={{ width: 48, height: 48, border: '2px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 20 }}>{inWishlist ? '❤️' : '🤍'}</button>
          </div>
          <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['SKU', product.sku], ['Weight/Size', product.weight], ['Brand', product.brand || 'HY Nutrition'], ['Category', product.category?.name]].map(([k, v]) => v && (
                <div key={k}><span style={{ color: '#6b7280', fontSize: 12 }}>{k}: </span><span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #f0f0f0', marginBottom: 24 }}>
          {[['desc', 'Description'], ['reviews', `Reviews (${product.numReviews})`]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: tab === id ? 700 : 400, color: tab === id ? '#111' : '#6b7280', borderBottom: `2px solid ${tab === id ? '#f59e0b' : 'transparent'}`, marginBottom: -2 }}>{label}</button>
          ))}
        </div>
        {tab === 'desc' && <div style={{ color: '#374151', lineHeight: 1.8, fontSize: 15 }}>{product.description}</div>}
        {tab === 'reviews' && <ReviewsTab productId={product._id} numReviews={product.numReviews} />}
      </div>

      {related.length > 0 && (
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Related Products</h2>
          <div className="grid-4">{related.map(p => <ProductCard key={p._id} product={p} />)}</div>
        </div>
      )}
    </div>
  );
}
