import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { selectCartCount } from '../store/slices/cartSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import toast from 'react-hot-toast';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(s => s.auth.user?.wishlist?.length || 0);
  const { categories } = useSelector(s => s.categories);

  const [search, setSearch] = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const catTimeout = useRef(null);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [navigate]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/shop?search=${encodeURIComponent(search)}`); setSearch(''); setDrawerOpen(false); }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
    setUserOpen(false);
    setDrawerOpen(false);
  };

  const openCatMenu = () => { clearTimeout(catTimeout.current); setCatMenuOpen(true); };
  const closeCatMenu = () => { catTimeout.current = setTimeout(() => setCatMenuOpen(false), 200); };

  const activeCategories = categories.filter(c => c.isActive);

  return (
    <>
      <nav style={{ background: '#0a0a0a', position: 'sticky', top: 0, zIndex: 1000, boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 20px rgba(0,0,0,0.3)', transition: 'box-shadow 0.3s', maxWidth: '100vw' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, minWidth: 0 }}>
            <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💪</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontWeight: 900, fontSize: 'clamp(13px,4vw,18px)', letterSpacing: 1, whiteSpace: 'nowrap' }}>HY NUTRITION</div>
              <div style={{ color: '#f59e0b', fontSize: 9, letterSpacing: 3, fontWeight: 600, whiteSpace: 'nowrap' }}>FUEL YOUR LIMITS</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="nav-links" style={{ gap: 24, alignItems: 'center' }}>
            {[['/', 'Home'], ['/shop', 'Shop'], ['/blog', 'Blog'], ['/contact', 'Contact']].map(([to, label]) => (
              <Link key={to} to={to} style={{ color: '#d1d5db', fontSize: 14, fontWeight: 600, letterSpacing: 0.5, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#f59e0b'} onMouseLeave={e => e.target.style.color = '#d1d5db'}>
                {label}
              </Link>
            ))}

            {/* Categories Mega Menu Trigger */}
            {activeCategories.length > 0 && (
              <div style={{ position: 'static' }}
                onMouseEnter={openCatMenu}
                onMouseLeave={closeCatMenu}>
                <button style={{ background: 'none', border: 'none', color: catMenuOpen ? '#f59e0b' : '#d1d5db', fontSize: 14, fontWeight: 600, letterSpacing: 0.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                  Categories <span style={{ fontSize: 10 }}>▼</span>
                </button>

                {catMenuOpen && (
                  <div
                    onMouseEnter={openCatMenu}
                    onMouseLeave={closeCatMenu}
                    style={{ position: 'fixed', top: 64, left: '50%', transform: 'translateX(-25%)', background: '#fff', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.18)', minWidth: 560, padding: 24, zIndex: 2000, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    <Link to="/shop" onClick={() => setCatMenuOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, transition: 'background 0.15s', color: '#111', textDecoration: 'none', gridColumn: '1/-1', background: '#f8f9fa', marginBottom: 4 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fef3c7'} onMouseLeave={e => e.currentTarget.style.background = '#f8f9fa'}>
                      <span style={{ fontSize: 20 }}>🛍️</span>
                      <div><div style={{ fontWeight: 700, fontSize: 13 }}>All Products</div><div style={{ fontSize: 11, color: '#6b7280' }}>Browse entire catalog</div></div>
                    </Link>
                    {activeCategories.map(cat => {
                      const imgUrl = cat.image ? (cat.image.startsWith('http') ? cat.image : `${API_BASE}${cat.image}`) : null;
                      return (
                        <Link key={cat._id} to={`/category/${cat.slug}`} onClick={() => setCatMenuOpen(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, transition: 'background 0.15s', color: '#111', textDecoration: 'none' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {imgUrl ? <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 18 }}>{cat.icon || '💊'}</span>}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{cat.name}</div>
                            {cat.productCount > 0 && <div style={{ fontSize: 11, color: '#9ca3af' }}>{cat.productCount} products</div>}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <form onSubmit={handleSearch} className="nav-search" style={{ position: 'relative' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '7px 36px 7px 14px', borderRadius: 24, fontSize: 13, width: 180, outline: 'none' }} />
              <button type="submit" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', fontSize: 14 }}>🔍</button>
            </form>

            <Link to="/wishlist" style={{ position: 'relative', fontSize: 20, color: '#d1d5db', lineHeight: 1 }}>
              ❤️{wishlistCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{wishlistCount}</span>}
            </Link>

            <Link to="/cart" style={{ position: 'relative', fontSize: 20, lineHeight: 1 }}>
              🛒{cartCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: '#f59e0b', color: '#000', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cartCount}</span>}
            </Link>

            <div className="nav-user" style={{ position: 'relative' }}>
              {isAuthenticated ? (
                <>
                  <div onClick={() => setUserOpen(!userOpen)} style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  {userOpen && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setUserOpen(false)} />
                      <div style={{ position: 'absolute', right: 0, top: 44, background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.16)', minWidth: 180, overflow: 'hidden', zIndex: 100 }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.name}</div>
                          <div style={{ color: '#6b7280', fontSize: 12 }}>{user?.email}</div>
                        </div>
                        {[['Profile', '/profile'], ['My Orders', '/orders'], ['Wishlist', '/wishlist']].map(([label, path]) => (
                          <Link key={path} to={path} onClick={() => setUserOpen(false)} style={{ display: 'block', padding: '10px 16px', fontSize: 14, color: '#374151' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                            {label}
                          </Link>
                        ))}
                        <button onClick={handleLogout} style={{ width: '100%', padding: '10px 16px', textAlign: 'left', border: 'none', background: 'none', color: '#ef4444', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderTop: '1px solid #f0f0f0' }}>Logout</button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Link to="/login" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#000', padding: '8px 18px', borderRadius: 24, fontWeight: 700, fontSize: 13 }}>Sign In</Link>
              )}
            </div>

            <button className="hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Drawer Overlay */}
      <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />

      {/* Mobile Drawer */}
      <div className={`mobile-drawer${drawerOpen ? ' open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #1a1a1a' }}>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>HY NUTRITION</div>
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: '16px 24px', borderBottom: '1px solid #1a1a1a' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ flex: 1, padding: '10px 14px', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: 8, fontSize: 13, outline: 'none' }} />
            <button type="submit" style={{ background: '#f59e0b', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 14, cursor: 'pointer' }}>🔍</button>
          </form>
        </div>

        <div style={{ padding: '8px 0' }}>
          {[['/', 'Home'], ['/shop', 'Shop'], ['/blog', 'Blog'], ['/contact', 'Contact']].map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setDrawerOpen(false)} style={{ display: 'block', padding: '14px 24px', color: '#d1d5db', fontSize: 15, fontWeight: 600, borderBottom: '1px solid #111' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'} onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>
              {label}
            </Link>
          ))}

          {/* Mobile Categories Accordion */}
          {activeCategories.length > 0 && (
            <div style={{ borderBottom: '1px solid #111' }}>
              <button onClick={() => setMobileCatOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: 'none', border: 'none', color: '#d1d5db', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Categories <span style={{ fontSize: 10 }}>{mobileCatOpen ? '▲' : '▼'}</span>
              </button>
              {mobileCatOpen && (
                <div style={{ background: '#111' }}>
                  <Link to="/shop" onClick={() => setDrawerOpen(false)} style={{ display: 'block', padding: '12px 32px', color: '#9ca3af', fontSize: 14, borderBottom: '1px solid #0a0a0a' }}>All Products</Link>
                  {activeCategories.map(cat => (
                    <Link key={cat._id} to={`/category/${cat.slug}`} onClick={() => setDrawerOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 32px', color: '#9ca3af', fontSize: 14, borderBottom: '1px solid #0a0a0a' }}>
                      <span>{cat.icon || '💊'}</span> {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #1a1a1a', marginTop: 8 }}>
          {isAuthenticated ? (
            <>
              <div style={{ color: '#fff', fontWeight: 700, marginBottom: 12 }}>{user?.name}</div>
              {[['My Profile', '/profile'], ['My Orders', '/orders'], ['Wishlist', '/wishlist']].map(([label, path]) => (
                <Link key={path} to={path} onClick={() => setDrawerOpen(false)} style={{ display: 'block', padding: '10px 0', color: '#9ca3af', fontSize: 14 }}>{label}</Link>
              ))}
              <button onClick={handleLogout} style={{ marginTop: 12, background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%' }}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setDrawerOpen(false)} style={{ display: 'block', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#000', padding: '12px 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, textAlign: 'center' }}>Sign In</Link>
          )}
        </div>
      </div>
    </>
  );
}
