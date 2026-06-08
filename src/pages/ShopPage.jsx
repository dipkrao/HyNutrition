import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

export default function ShopPage() {
  const dispatch = useDispatch();
  const { category: urlCat } = useParams();
  const [searchParams] = useSearchParams();
  const { products, loading, total, totalPages, currentPage } = useSelector(s => s.products);
  const { categories } = useSelector(s => s.categories);

  const [filters, setFilters] = useState({ categorySlug: urlCat || searchParams.get('category') || '', search: searchParams.get('search') || '', minPrice: '', maxPrice: '', inStock: false, sort: 'featured', page: 1 });

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    const params = {};
    if (filters.categorySlug) {
      const found = categories.find(c => c.slug === filters.categorySlug);
      if (found) params.category = found._id;
    }
    if (filters.search) params.search = filters.search;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.inStock) params.inStock = true;
    params.sort = filters.sort;
    params.page = filters.page;
    params.limit = 12;
    dispatch(fetchProducts(params));
  }, [filters, categories, dispatch]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  const activeTitle = filters.categorySlug
    ? categories.find(c => c.slug === filters.categorySlug)?.name || filters.categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'All Products';

  return (
    <div className="shop-layout" style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 20px', display: 'flex', gap: 32 }}>
      {/* Sidebar */}
      <aside className="shop-sidebar" style={{ width: 240, flexShrink: 0 }}>
        <div className="card" style={{ padding: 24, position: 'sticky', top: 80 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 20, fontSize: 16 }}>Filters</h3>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#374151' }}>Categories</div>
            <div onClick={() => setFilter('categorySlug', '')} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, marginBottom: 4, background: !filters.categorySlug ? '#fef3c7' : 'transparent', color: !filters.categorySlug ? '#92400e' : '#374151', fontWeight: !filters.categorySlug ? 700 : 400 }}>All</div>
            {categories.filter(c => c.isActive).map(cat => (
              <div key={cat._id} onClick={() => setFilter('categorySlug', cat.slug)} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, marginBottom: 4, background: filters.categorySlug === cat.slug ? '#fef3c7' : 'transparent', color: filters.categorySlug === cat.slug ? '#92400e' : '#374151', fontWeight: filters.categorySlug === cat.slug ? 700 : 400, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{cat.icon || '💊'}</span> {cat.name}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 20, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#374151' }}>Price Range</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" value={filters.minPrice} onChange={e => setFilter('minPrice', e.target.value)} placeholder="Min" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, outline: 'none' }} />
              <input type="number" value={filters.maxPrice} onChange={e => setFilter('maxPrice', e.target.value)} placeholder="Max" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 12, outline: 'none' }} />
            </div>
          </div>
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
            <div onClick={() => setFilter('inStock', !filters.inStock)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <div style={{ width: 18, height: 18, border: '2px solid #f59e0b', borderRadius: 4, background: filters.inStock ? '#f59e0b' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {filters.inStock && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13 }}>In Stock Only</span>
            </div>
          </div>
            <button onClick={() => setFilters({ categorySlug: '', search: '', minPrice: '', maxPrice: '', inStock: false, sort: 'featured', page: 1 })} style={{ marginTop: 16, width: '100%', padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Clear Filters</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 4px' }}>{activeTitle}</h1>
            <span style={{ color: '#6b7280', fontSize: 14 }}>{total} products found</span>
          </div>
          <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)} style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' }}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {loading ? <Spinner center /> : (
          <>
            <div className="grid-3">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            {products.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280' }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontSize: 20, marginBottom: 8 }}>No products found</h3>
                <p>Try adjusting your filters or search query.</p>
              </div>
            )}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setFilters(f => ({ ...f, page: p }))} style={{ width: 40, height: 40, border: '1px solid', borderColor: currentPage === p ? '#f59e0b' : '#e5e7eb', background: currentPage === p ? '#f59e0b' : '#fff', color: currentPage === p ? '#000' : '#374151', borderRadius: 8, fontWeight: currentPage === p ? 700 : 400, cursor: 'pointer', fontSize: 14 }}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
