import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import api from '../utils/api';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const FALLBACK_BANNERS = [
  { title: 'FUEL YOUR', highlight: 'LIMITS', subtitle: 'Premium sports nutrition for elite performance', ctaText: 'Shop Now', ctaLink: '/shop', bgColor: '#0a0a0a', accentColor: '#f59e0b' },
  { title: 'BUILD YOUR', highlight: 'LEGACY', subtitle: 'Protein, creatine & more - engineered for results', ctaText: 'Explore', ctaLink: '/shop', bgColor: '#0f172a', accentColor: '#10b981' },
  { title: 'UNLEASH YOUR', highlight: 'POWER', subtitle: 'Up to 25% off on best-selling supplements', ctaText: 'Grab Deal', ctaLink: '/shop', bgColor: '#1a0a2e', accentColor: '#8b5cf6' },
];

const CARD_COLORS = ['#fef3c7','#dbeafe','#fee2e2','#dcfce7','#ede9fe','#fce7f3','#ecfdf5','#f3f4f6'];

const TESTIMONIALS = [
  { name: 'Arjun Sharma', role: 'Powerlifter', text: "HY Nutrition's whey protein is the best I've ever had. Gains are real!", rating: 5, av: 'AS' },
  { name: 'Priya Menon', role: 'CrossFit Athlete', text: "The pre-workout surge is insane! Best pump I've had in years.", rating: 5, av: 'PM' },
  { name: 'Rahul Verma', role: 'Bodybuilder', text: 'Mass Gainer Pro helped me gain 8kg in 3 months. Quality ingredients!', rating: 5, av: 'RV' },
  { name: 'Sneha Iyer', role: 'Marathon Runner', text: 'BCAA Recovery is a game-changer. Less soreness, more training.', rating: 4, av: 'SI' },
];

function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState(FALLBACK_BANNERS);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();
  const touchStart = React.useRef(null);

  useEffect(() => {
    api.get('/banners').then(r => { if (r.data.banners?.length) setBanners(r.data.banners); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length, paused]);

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) setCurrent(c => diff > 0 ? (c + 1) % banners.length : (c - 1 + banners.length) % banners.length);
    touchStart.current = null;
  };

  const banner = banners[current] || banners[0];
  const bg = banner.bgColor || banner.bg || '#0a0a0a';
  const accent = banner.accentColor || banner.accent || '#f59e0b';
  const sub = banner.subtitle || banner.sub;
  const cta = banner.ctaText || banner.cta;
  const ctaLink = banner.ctaLink || '/shop';
  const imageUrl = banner.image ? `${API_BASE}${banner.image}` : null;

  return (
    <div
      className="hero-section"
      style={{ background: bg, transition: 'background 0.8s' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {imageUrl && <img src={imageUrl} alt="" aria-hidden="true" className="hero-bg-image" />}
      <div className="hero-overlay" />
      {!imageUrl && (
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(255,255,255,0.3) 40px,rgba(255,255,255,0.3) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(255,255,255,0.3) 40px,rgba(255,255,255,0.3) 41px)' }} />
      )}

      <div className="hero-content">
        <div className="hero-text">
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', color: accent, border: `1px solid ${accent}`, padding: '6px 16px', borderRadius: 24, fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 20 }}>PREMIUM SPORTS NUTRITION</div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(32px,5vw,64px)', fontWeight: 900, lineHeight: 1.05, margin: '0 0 12px', letterSpacing: -1, textTransform: 'uppercase' }}>
            {banner.title}<br /><span style={{ color: accent }}>{banner.highlight}</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(14px,2vw,18px)', marginBottom: 28, lineHeight: 1.5 }}>{sub}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => navigate(ctaLink)} style={{ background: accent, color: '#000', border: 'none', padding: '13px 28px', borderRadius: 8, fontSize: 14, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>{cta} →</button>
            <button onClick={() => navigate('/about')} style={{ background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.35)', padding: '13px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Our Story</button>
          </div>
          <div style={{ display: 'flex', gap: 28, marginTop: 32, flexWrap: 'wrap' }}>
            {[['50K+', 'Customers'], ['100+', 'Products'], ['4.8★', 'Rating']].map(([n, l]) => (
              <div key={l}><div style={{ color: accent, fontWeight: 900, fontSize: 22 }}>{n}</div><div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{l}</div></div>
            ))}
          </div>
        </div>
        {!imageUrl && (
          <div className="hero-img-wrap">
            <div style={{ fontSize: 140, opacity: 0.1, userSelect: 'none' }}>💪</div>
          </div>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 3 }}>
        {banners.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} style={{ width: i === current ? 28 : 8, height: 8, borderRadius: 4, background: i === current ? accent : 'rgba(255,255,255,0.35)', cursor: 'pointer', border: 'none', padding: 0, transition: 'all 0.3s' }} />
        ))}
      </div>

      {banners.length > 1 && [
        ['◀', () => setCurrent(c => (c - 1 + banners.length) % banners.length), { left: 16 }],
        ['▶', () => setCurrent(c => (c + 1) % banners.length), { right: 16 }],
      ].map(([icon, fn, pos]) => (
        <button key={icon} onClick={fn} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', ...pos, zIndex: 3, background: 'rgba(0,0,0,0.35)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 14, cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}>{icon}</button>
      ))}
    </div>
  );
}

function Section({ title, label, products, loading, accent }) {
  if (loading) return <div style={{ padding: '60px 20px' }}><Spinner center /></div>;
  if (!products?.length) return null;
  return (
    <section style={{ padding: '60px 20px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ color: accent || '#f59e0b', fontWeight: 700, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>{label || 'Featured'}</div>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: '#111', margin: 0 }}>{title}</h2>
      </div>
      <div className="grid-4">{products.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}</div>
    </section>
  );
}

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.products);
  const { categories } = useSelector(s => s.categories);
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ isFeatured: true, limit: 8 })).then(res => { if (res.payload?.products) setFeatured(res.payload.products); });
    api.get('/products/bestsellers').then(r => setBestSellers(r.data.products)).catch(() => {});
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div>
      <HeroSection />

      {/* Dynamic Categories */}
      {categories.length > 0 && (
        <section style={{ padding: '60px 20px', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Browse By</div>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: '#111' }}>Product Categories</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
            {categories.filter(c => c.isActive).map((cat, i) => {
              const imgUrl = cat.image ? (cat.image.startsWith('http') ? cat.image : `${API_BASE}${cat.image}`) : null;
              return (
                <div key={cat._id} onClick={() => navigate(`/category/${cat.slug}`)}
                  style={{ background: CARD_COLORS[i % CARD_COLORS.length], borderRadius: 16, padding: '20px 12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  {imgUrl
                    ? <img src={imgUrl} alt={cat.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 12, margin: '0 auto 8px' }} />
                    : <div style={{ fontSize: 36, marginBottom: 8 }}>{cat.icon || '💊'}</div>}
                  <div style={{ fontWeight: 700, color: '#111', fontSize: 13 }}>{cat.name}</div>
                  {cat.productCount > 0 && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{cat.productCount} products</div>}
                </div>
              );
            })}
            <div onClick={() => navigate('/shop')}
              style={{ background: '#f3f4f6', borderRadius: 16, padding: '20px 12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🛍️</div>
              <div style={{ fontWeight: 700, color: '#111', fontSize: 13 }}>All Products</div>
            </div>
          </div>
        </section>
      )}

      <Section title="Featured Products" products={featured} loading={loading} />

      {/* Why Us */}
      <section style={{ background: '#0a0a0a', padding: '80px 20px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Why Us</div>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: '#fff' }}>The HY Nutrition Difference</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {[['🔬','Lab Tested','Every batch third-party tested for purity'],['🌿','Clean Ingredients','No fillers, just what your body needs'],['🚚','Fast Delivery','Free shipping on orders ₹999+'],['💯','30-Day Guarantee','Money-back, no questions asked'],['🏆','Award Winning','#1 nutrition brand 3 years running'],['📞','Expert Support','Free nutrition consultation']].map(([icon, title, desc]) => (
              <div key={title} style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: '28px 24px', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.border = '1px solid #f59e0b'; e.currentTarget.style.background = '#1a1a1a'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid #222'; e.currentTarget.style.background = '#111'; }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{title}</h3>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section title="Best Sellers" label="Top Picks" products={bestSellers} accent="#10b981" />

      {/* Testimonials */}
      <section style={{ padding: '80px 20px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Reviews</div>
            <h2 style={{ fontSize: 40, fontWeight: 900, color: '#111' }}>Real Athletes, Real Results</h2>
          </div>
          <div className="grid-4">
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ color: '#f59e0b', fontSize: 18, marginBottom: 12 }}>{'★'.repeat(t.rating)}</div>
                <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.6, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>{t.av}</div>
                  <div><div style={{ fontWeight: 700, color: '#111', fontSize: 14 }}>{t.name}</div><div style={{ color: '#6b7280', fontSize: 12 }}>{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background: '#111', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <h2 style={{ color: '#fff', fontSize: 36, fontWeight: 900, marginBottom: 12 }}>Get Exclusive Deals</h2>
          <p style={{ color: '#9ca3af', marginBottom: 32, fontSize: 16 }}>Subscribe for 15% off your first order + expert tips.</p>
          <form onSubmit={async (e) => { e.preventDefault(); try { const r = await api.post('/newsletter/subscribe', { email }); alert(r.data.message); setEmail(''); } catch (err) { alert(err.response?.data?.message || 'Error'); } }} style={{ display: 'flex', maxWidth: 420, margin: '0 auto' }}>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="Your email address" style={{ flex: 1, padding: '14px 20px', border: 'none', borderRadius: '8px 0 0 8px', background: '#1a1a1a', color: '#fff', fontSize: 14, outline: 'none', minWidth: 0 }} />
            <button type="submit" style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '14px 24px', borderRadius: '0 8px 8px 0', cursor: 'pointer', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>Subscribe</button>
          </form>
          <p style={{ color: '#4b5563', fontSize: 12, marginTop: 16 }}>Code: WELCOME15 for 15% off. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
}
