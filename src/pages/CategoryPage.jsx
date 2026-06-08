import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import { fetchCategory } from '../store/slices/categorySlice';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export default function CategoryPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { products, loading: pLoading, total, totalPages, currentPage } = useSelector(s => s.products);
  const { category, loading: cLoading } = useSelector(s => s.categories);

  const [filters, setFilters] = useState({ sort: 'featured', minPrice: '', maxPrice: '', inStock: false, page: 1 });

  // Update document title & meta for SEO
  useEffect(() => {
    if (category) {
      document.title = category.metaTitle || `${category.name} | HY Nutrition`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', category.metaDescription || category.description || '');
    }
    return () => { document.title = 'HY Nutrition'; };
  }, [category]);

  useEffect(() => { dispatch(fetchCategory(slug)); }, [slug, dispatch]);

  useEffect(() => {
    if (!category) return;
    const params = { category: category._id, sort: filters.sort, page: filters.page, limit: 12 };
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.inStock) params.inStock = true;
    dispatch(fetchProducts(params));
  }, [category, filters, dispatch]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  const bannerImg = category?.image ? (category.image.startsWith('http') ? category.image : `${API_BASE}${category.image}`) : null;

  if (cLoading) return <div style={{ padding: 80 }}><Spinner center /></div>;

  if (!category) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Category not found</h2>
      <Link to="/shop" style={{ color: '#f59e0b', fontWeight: 700 }}>Browse all products →</Link>
    </div>
  );

  return (
    <div>
      {/* Category Banner */}
      <div style={{ position: 'relative', background: bannerImg ? '#000' : 'linear-gradient(135deg,#0a0a0a,#1a1a1a)', minHeight: 220, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {bannerImg && <img src={bannerImg} alt={category.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', padding: '40px 20px', width: '100%' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, fontSize: 13, color: '#9ca3af' }}>
            <Link to="/" style={{ color: '#9ca3af' }}>Home</Link>
            <span>›</span>
            <Link to="/shop" style={{ color: '#9ca3af' }}>Shop</Link>
            <span>›</span>
            <span style={{ color: '#f59e0b' }}>{category.name}</span>
          </div>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{category.icon || '💊'}</div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, marginBottom: 8 }}>{category.name}</h1>
          {category.description && <p style={{ color: '#9ca3af', fontSize: 16, maxWidth: 600 }}>{category.description}</p>}
          <div style={{ marginTop: 12, color: '#f59e0b', fontSize: 14, fontWeight: 600 }}>{total} products</div>
        </div>
      </div>

      <div className="shop-layout" style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 20px', display: 'flex', gap: 32 }}>
        {/* Sidebar Filters */}
        <aside className="shop-sidebar" style={{ width: 220, flexShrink: 0 }}>
          <div className="card" style={{ padding: 24, position: 'sticky', top: 80 }}>
            <h3 style={{ fontWeight: 800, marginBottom: 20, fontSize: 16 }}>Filters</h3>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#374151' }}>Price Range</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)} placeholder="Min" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, outline: 'none' }} />
                <input type="number" value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)} placeholder="Max" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, outline: 'none' }} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 20, marginBottom: 20 }}>
              <div onClick={() => setFilter('inStock', !filters.inStock)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <div style={{ width: 18, height: 18, border: '2px solid #f59e0b', borderRadius: 4, background: filters.inStock ? '#f59e0b' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {filters.inStock && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
                </div>
                <span style={{ fontSize: 13 }}>In Stock Only</span>
              </div>
            </div>

            <button onClick={() => setFilters({ sort: 'featured', minPrice: '', maxPrice: '', inStock: false, page: 1 })}
              style={{ width: '100%', padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Products Grid */}
        <main style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: '#6b7280', fontSize: 14 }}>{total} products found</span>
            <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)} style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {pLoading ? <Spinner center /> : (
            <>
              <div className="grid-3">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              {products.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280' }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>📦</div>
                  <h3 style={{ fontSize: 20, marginBottom: 8 }}>No products in this category yet</h3>
                  <Link to="/shop" style={{ color: '#f59e0b', fontWeight: 700 }}>Browse all products</Link>
                </div>
              )}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setFilters(f => ({ ...f, page: p }))}
                      style={{ width: 40, height: 40, border: '1px solid', borderColor: currentPage === p ? '#f59e0b' : '#e5e7eb', background: currentPage === p ? '#f59e0b' : '#fff', color: currentPage === p ? '#000' : '#374151', borderRadius: 8, fontWeight: currentPage === p ? 700 : 400, cursor: 'pointer', fontSize: 14 }}>{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
