import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogBySlug, clearCurrentBlog } from '../store/slices/blogSlice';

const SITE_NAME = 'HY Nutrition';
const SITE_URL = process.env.REACT_APP_SITE_URL || 'https://hy-nutrition.com';

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

// Minimal markdown → HTML (handles headers, bold, italic, lists, links, code, blockquote)
function mdToHtml(md = '') {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" rel="noopener">$1</a>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/^(?!<[hbulicoq]).+$/gm, '<p>$&</p>')
    .replace(/\n{2,}/g, '')
    .replace(/<\/p>\n<p>/g, '</p><p>');
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { current: blog, loading } = useSelector(s => s.blog);

  useEffect(() => {
    dispatch(fetchBlogBySlug(slug));
    window.scrollTo(0, 0);
    return () => dispatch(clearCurrentBlog());
  }, [dispatch, slug]);

  useEffect(() => {
    if (!blog) return;
    const title = `${blog.metaTitle || blog.title} | ${SITE_NAME}`;
    const description = blog.metaDescription || blog.excerpt || '';
    const url = `${SITE_URL}/blog/${blog.slug}`;

    document.title = title;
    setMeta('description', description);
    setMeta('robots', 'index, follow');
    setOG('og:title', title); setOG('og:description', description);
    setOG('og:url', url); setOG('og:type', 'article'); setOG('og:site_name', SITE_NAME);
    if (blog.featuredImage) setOG('og:image', blog.featuredImage);
    setOG('article:author', blog.author || SITE_NAME);
    setOG('article:published_time', blog.createdAt);
    if (blog.category) setOG('article:section', blog.category);
    setOG('twitter:card', 'summary_large_image');
    setOG('twitter:title', title); setOG('twitter:description', description);
    if (blog.featuredImage) setOG('twitter:image', blog.featuredImage);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = url;

    return () => { document.title = SITE_NAME; };
  }, [blog]);

  if (loading) return <div style={{ maxWidth: 800, margin: '80px auto', textAlign: 'center' }}><div className="spinner" style={{ margin: 'auto' }} /></div>;

  if (!loading && !blog) return (
    <div style={{ maxWidth: 800, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Post Not Found</h1>
      <Link to="/blog" style={{ color: '#f59e0b', fontWeight: 700 }}>← Back to Blog</Link>
    </div>
  );

  if (!blog) return null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" style={{ marginBottom: 28 }}>
        <ol style={{ display: 'flex', gap: 6, listStyle: 'none', padding: 0, fontSize: 13, color: '#9ca3af', flexWrap: 'wrap' }}>
          <li><Link to="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Home</Link></li>
          <li>›</li>
          <li><Link to="/blog" style={{ color: '#9ca3af', textDecoration: 'none' }}>Blog</Link></li>
          {blog.category && <><li>›</li><li><Link to={`/blog?category=${blog.category}`} style={{ color: '#9ca3af', textDecoration: 'none' }}>{blog.category}</Link></li></>}
          <li>›</li>
          <li style={{ color: '#374151' }}>{blog.title}</li>
        </ol>
      </nav>

      <article itemScope itemType="https://schema.org/BlogPosting">
        {blog.category && (
          <Link to={`/blog?category=${blog.category}`}
            style={{ background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 12, display: 'inline-block', marginBottom: 16, textDecoration: 'none' }}>
            {blog.category}
          </Link>
        )}

        {/* H1 — SEO critical */}
        <h1 itemProp="headline" style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 900, color: '#111', lineHeight: 1.2, marginBottom: 20 }}>
          {blog.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#6b7280', fontSize: 14, marginBottom: 32, flexWrap: 'wrap' }}>
          <span itemProp="author" itemScope itemType="https://schema.org/Person">✍️ <span itemProp="name">{blog.author || 'Admin'}</span></span>
          <span>·</span>
          <time itemProp="datePublished" dateTime={blog.createdAt}>
            📅 {new Date(blog.createdAt).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          {blog.views > 0 && <><span>·</span><span>👁 {blog.views} views</span></>}
        </div>

        {blog.featuredImage && (
          <figure style={{ margin: '0 0 36px', borderRadius: 16, overflow: 'hidden' }}>
            <img src={blog.featuredImage} alt={blog.featuredImageAlt || blog.title} itemProp="image"
              style={{ width: '100%', maxHeight: 460, objectFit: 'cover', display: 'block' }} loading="eager" />
          </figure>
        )}

        {blog.excerpt && (
          <p itemProp="description" style={{ fontSize: 18, color: '#374151', lineHeight: 1.8, fontStyle: 'italic', borderLeft: '4px solid #f59e0b', padding: '16px 20px', borderRadius: '0 12px 12px 0', background: '#fffbeb', marginBottom: 36 }}>
            {blog.excerpt}
          </p>
        )}

        {/* Main content */}
        <div itemProp="articleBody" className="blog-content" style={{ fontSize: 17, lineHeight: 1.85, color: '#1f2937' }}
          dangerouslySetInnerHTML={{ __html: mdToHtml(blog.content) }} />

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Tags</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {blog.tags.map(t => (
                <Link key={t} to={`/blog?tag=${t}`} rel="tag" itemProp="keywords"
                  style={{ background: '#f3f4f6', color: '#374151', padding: '6px 14px', borderRadius: 20, fontSize: 13, textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  #{t}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        <div style={{ marginTop: 36, background: '#fffbeb', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontWeight: 700, color: '#374151' }}>Share this post</span>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Twitter/X', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(`${SITE_URL}/blog/${blog.slug}`)}` },
              { label: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITE_URL}/blog/${blog.slug}`)}` },
              { label: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${SITE_URL}/blog/${blog.slug}`)}` },
            ].map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#374151', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </article>

      <div style={{ marginTop: 40 }}>
        <Link to="/blog" style={{ color: '#f59e0b', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
}
