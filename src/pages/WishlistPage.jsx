import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const wishlistIds = user?.wishlist || [];
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wishlistIds.length === 0) { setProducts([]); return; }
    setLoading(true);
    Promise.all(wishlistIds.map(id => api.get(`/products/${id}`).then(r => r.data.product).catch(() => null)))
      .then(results => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [JSON.stringify(wishlistIds)]);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 32 }}>My Wishlist ({wishlistIds.length})</h1>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>Loading...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>❤️</div>
          <h2 style={{ marginBottom: 12 }}>Your wishlist is empty</h2>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Save products you love to buy them later.</p>
          <button onClick={() => navigate('/shop')} className="btn btn-primary">Browse Products</button>
        </div>
      ) : (
        <div className="grid-4">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
