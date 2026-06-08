import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct, addToRecentlyViewed } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/authSlice';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector(s => s.products);
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('desc');
  const [related, setRelated] = useState([]);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => { dispatch(fetchProduct(slug)); setQty(1); setTab('desc'); setImgIdx(0); }, [slug, dispatch]);

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
  if (!product) return <div style={{ textAlign: 'center', padding: 80 }}><h2>Product not found</h2></div>;

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
          {[['desc', 'Description'], ['nutrition', 'Nutrition Facts'], ['usage', 'How to Use'], ['reviews', `Reviews (${product.numReviews})`]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: tab === id ? 700 : 400, color: tab === id ? '#111' : '#6b7280', borderBottom: `2px solid ${tab === id ? '#f59e0b' : 'transparent'}`, marginBottom: -2 }}>{label}</button>
          ))}
        </div>
        {tab === 'desc' && <div style={{ color: '#374151', lineHeight: 1.8, fontSize: 15 }}>{product.description}</div>}
        {tab === 'nutrition' && product.nutrition && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, maxWidth: 600 }}>
            {Object.entries(product.nutrition).filter(([k]) => k !== 'servingSize').map(([k, v]) => (
              <div key={k} style={{ background: '#fafafa', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{v}</div>
                <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'capitalize' }}>{k}</div>
              </div>
            ))}
          </div>
        )}
        {tab === 'usage' && <div style={{ color: '#374151', lineHeight: 1.8 }}>{product.usageInstructions || 'Mix 1 scoop with 250ml cold water. Consume post-workout for best results.'}</div>}
        {tab === 'reviews' && (
          <div>
            <p style={{ color: '#6b7280' }}>Reviews shown after approval. Be the first to review this product!</p>
          </div>
        )}
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
