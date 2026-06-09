import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublishedBlogs } from '../store/slices/blogSlice';

const SITE_NAME = 'HY Nutrition';
const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://hy-nutrition.com';

function setSEO({ title, description, url, image }) {
  document.title = title;
  setMeta('description', description);
  setOG('og:title', title); setOG('og:description', description);
  setOG('og:url', url); setOG('og:type', 'website'); setOG('og:site_name', SITE_NAME);
  if (image) setOG('og:image', image);
  setOG('twitter:card', 'summary_large_image');
  setOG('twitter:title', title); setOG('twitter:description', description);
  if (image) setOG('twitter:image', image);
}
function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
  el.setAttribute('content', content || '');
}
function setOG(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
  el.setAttribute('content', content || '');
}

export default function BlogPage() {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector(s => s.blog);
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag');
  const category = searchParams.get('category');

  useEffect(() => {
    dispatch(fetchPublishedBlogs({ tag, category }));
  }, [dispatch, tag, category]);

  useEffect(() => {
    const title = `Blog${category ? ` – ${category}` : ''}${tag ? ` – #${tag}` : ''} | ${SITE_NAME}`;
    setSEO({ title, description: `Expert nutrition tips, fitness guides, and healthy recipes from ${SITE_NAME}.`, url: `${SITE_URL}/blog` });
    return () => { document.title = SITE_NAME; };
  }, [tag, category]);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 20px' }}>
      {/* H1 — SEO anchor */}
      <header style={{ textAlign: 'center', marginBottom: 52 }}>
        <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 8 }}>
          HY <span style={{ color: '#f59e0b' }}>Blog</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: 16 }}>Expert nutrition advice, workout tips, and supplement guides.</p>
        {(tag || category) && (
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
            {category && <FilterChip label={`Category: ${category}`} />}
            {tag && <FilterChip label={`#${tag}`} />}
          </div>
        )}
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: 'auto' }} /></div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <p style={{ fontSize: 18 }}>No posts found.</p>
          {(tag || category) && <Link to="/blog" style={{ color: '#f59e0b', fontWeight: 700, marginTop: 12, display: 'inline-block' }}>View all posts →</Link>}
        </div>
      ) : (
        <>
          {!tag && !category && posts[0] && <FeaturedPost post={posts[0]} />}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 28, marginTop: 40 }}>
            {posts.slice(!tag && !category ? 1 : 0).map(post => <PostCard key={post._id} post={post} />)}
          </div>
        </>
      )}
    </div>
  );
}

function FeaturedPost({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', background: '#fff', border: '1px solid #f0f0f0' }}>
      <article style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 320 }}>
        <div style={{ overflow: 'hidden', background: 'linear-gradient(135deg,#fef3c7,#fffbeb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {post.featuredImage
            ? <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            : <span style={{ fontSize: 80 }}>📰</span>}
        </div>
        <div style={{ padding: '36px 36px 28px' }}>
          <span style={{ background: '#f59e0b', color: '#000', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>FEATURED</span>
          {post.category && <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', marginTop: 12, marginBottom: 8 }}>{post.category}</div>}
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', lineHeight: 1.3, marginBottom: 12 }}>{post.title}</h2>
          {post.excerpt && <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: 15, marginBottom: 16 }}>{post.excerpt}</p>}
          <PostMeta post={post} />
        </div>
      </article>
    </Link>
  );
}

function PostCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
      <article className="card" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.3s' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
        <div style={{ height: 200, overflow: 'hidden', background: 'linear-gradient(135deg,#fef3c7,#fffbeb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {post.featuredImage
            ? <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            : <span style={{ fontSize: 56 }}>📰</span>}
        </div>
        <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {post.category && <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12, alignSelf: 'flex-start', marginBottom: 10 }}>{post.category}</span>}
          <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, lineHeight: 1.3 }}>{post.title}</h3>
          {post.excerpt && <p style={{ color: '#6b7280', lineHeight: 1.6, fontSize: 14, flex: 1, marginBottom: 12 }}>{post.excerpt.slice(0, 120)}{post.excerpt.length > 120 ? '...' : ''}</p>}
          <PostMeta post={post} compact />
          {post.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {post.tags.slice(0, 3).map(t => (
                <Link key={t} to={`/blog?tag=${t}`} onClick={e => e.stopPropagation()}
                  style={{ background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 20, fontSize: 11, textDecoration: 'none' }}>#{t}</Link>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

function PostMeta({ post, compact }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9ca3af', fontSize: compact ? 12 : 13 }}>
      <span>✍️ {post.author || 'Admin'}</span>
      <span>·</span>
      <time dateTime={post.createdAt}>📅 {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
    </div>
  );
}

function FilterChip({ label }) {
  return (
    <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f3f4f6', color: '#374151', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
      {label} ✕
    </Link>
  );
}
