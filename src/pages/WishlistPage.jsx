import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const wishlist = user?.wishlist || [];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 32 }}>My Wishlist ({wishlist.length})</h1>
      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>❤️</div>
          <h2 style={{ marginBottom: 12 }}>Your wishlist is empty</h2>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Save products you love to buy them later.</p>
          <button onClick={() => navigate('/shop')} className="btn btn-primary">Browse Products</button>
        </div>
      ) : (
        <div className="grid-4">
          {wishlist.map(p => typeof p === 'object' && p._id ? (
            <ProductCard key={p._id} product={p} />
          ) : null)}
        </div>
      )}
    </div>
  );
}
