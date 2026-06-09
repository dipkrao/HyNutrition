import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchAdminBlogs, createBlog, updateBlog, deleteBlog, togglePublish } from '../../store/slices/blogSlice';

const EMPTY_FORM = {
  title: '', slug: '', excerpt: '', content: '', featuredImage: '',
  category: '', tags: '', status: 'draft',
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

function readingTime(content = '') {
  return Math.max(1, Math.ceil(content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length / 200));
}

export default function BlogAdminPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminPosts, adminLoading } = useSelector(s => s.blog);
  const { user, isAuthenticated } = useSelector(s => s.auth);

  const [view, setView] = useState('list'); // list | editor | preview
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== 'admin')) {
      navigate('/login');
      return;
    }
    dispatch(fetchAdminBlogs());
  }, [dispatch, isAuthenticated, user, navigate]);

  const handleTitleChange = useCallback((title) => {
    setForm(f => ({
      ...f, title,
      slug: f.slug && f.slug !== slugify(f.title) ? f.slug : slugify(title),
      excerpt: f.excerpt || '',
    }));
  }, []);

  const handleContentChange = useCallback((content) => {
    setForm(f => ({
      ...f, content,
      excerpt: f.excerpt || content.replace(/<[^>]+>/g, '').slice(0, 160),
    }));
  }, []);

  const openNew = () => { setForm(EMPTY_FORM); setEditId(null); setView('editor'); };
  const openEdit = (post) => {
    setForm({
      title: post.title || '', slug: post.slug || '',
      excerpt: post.excerpt || '', content: post.content || '',
      featuredImage: post.featuredImage || '', category: post.category || '',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
      status: post.status || 'draft',
    });
    setEditId(post._id);
    setView('editor');
  };

  const handleSave = async (status = form.status) => {
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.slug.trim()) return toast.error('Slug is required');
    const payload = { ...form, status, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    const action = editId
      ? await dispatch(updateBlog({ id: editId, data: payload }))
      : await dispatch(createBlog(payload));
    if (action.error) { toast.error(action.payload || 'Save failed'); return; }
    toast.success(editId ? 'Post updated!' : 'Post created!');
    setView('list');
    dispatch(fetchAdminBlogs());
  };

  const handleDelete = async (id) => {
    const action = await dispatch(deleteBlog(id));
    if (action.error) { toast.error('Delete failed'); return; }
    toast.success('Post deleted');
    setDeleteConfirm(null);
  };

  const handleTogglePublish = async (id) => {
    const action = await dispatch(togglePublish(id));
    if (action.error) { toast.error('Failed'); return; }
    toast.success('Status updated');
  };

  if (view === 'preview') return <PreviewPanel post={form} onBack={() => setView('editor')} />;

  if (view === 'editor') return (
    <EditorPanel
      form={form} setForm={setForm} editId={editId}
      onTitleChange={handleTitleChange} onContentChange={handleContentChange}
      onSave={handleSave} onPreview={() => setView('preview')} onBack={() => setView('list')}
    />
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900 }}>Blog <span style={{ color: '#f59e0b' }}>Manager</span></h1>
        <button className="btn btn-primary" onClick={openNew}>+ New Post</button>
      </div>

      {adminLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: 'auto' }} /></div>
      ) : adminPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>
          <p style={{ fontSize: 18, marginBottom: 16 }}>No blog posts yet.</p>
          <button className="btn btn-primary" onClick={openNew}>Create your first post</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {adminPosts.map(post => (
            <div key={post._id} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {/* Image thumbnail */}
              <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', background: '#fef3c7', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                {post.featuredImage ? <img src={post.featuredImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📝'}
              </div>

              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{post.title}</p>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>/{post.slug} · {post.category || 'Uncategorized'} · {readingTime(post.content)} min read</p>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Publish toggle */}
                <button onClick={() => handleTogglePublish(post._id)}
                  style={{ padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                    background: post.status === 'published' ? '#d1fae5' : '#fef3c7',
                    color: post.status === 'published' ? '#065f46' : '#92400e' }}>
                  {post.status === 'published' ? '✓ Published' : '○ Draft'}
                </button>

                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => openEdit(post)}>Edit</button>

                {deleteConfirm === post._id ? (
                  <>
                    <button className="btn" style={{ background: '#ef4444', color: '#fff', padding: '6px 14px', fontSize: 12 }} onClick={() => handleDelete(post._id)}>Confirm</button>
                    <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                  </>
                ) : (
                  <button className="btn" style={{ background: '#fee2e2', color: '#ef4444', padding: '6px 14px', fontSize: 12 }} onClick={() => setDeleteConfirm(post._id)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorPanel({ form, setForm, editId, onTitleChange, onContentChange, onSave, onPreview, onBack }) {
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 14, marginBottom: 4, cursor: 'pointer' }}>← Back</button>
          <h1 style={{ fontSize: 26, fontWeight: 900 }}>{editId ? 'Edit Post' : 'New Post'}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={onPreview}>👁 Preview</button>
          <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => onSave('draft')}>Save Draft</button>
          <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => onSave('published')}>Publish</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Title */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input value={form.title} onChange={e => onTitleChange(e.target.value)}
            placeholder="Enter blog title..." style={inputStyle} />
        </div>

        {/* Slug */}
        <div>
          <label style={labelStyle}>Slug *</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f9fafb', border: '2px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <span style={{ padding: '0 12px', color: '#9ca3af', fontSize: 13, borderRight: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>/blog/</span>
            <input value={form.slug} onChange={set('slug')} placeholder="my-blog-post"
              style={{ ...inputStyle, border: 'none', borderRadius: 0, background: 'transparent', outline: 'none' }} />
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label style={labelStyle}>Featured Image URL</label>
          <input value={form.featuredImage} onChange={set('featuredImage')}
            placeholder="https://example.com/image.jpg" style={inputStyle} />
          {form.featuredImage && (
            <img src={form.featuredImage} alt="preview" style={{ marginTop: 12, height: 120, borderRadius: 8, objectFit: 'cover' }} />
          )}
        </div>

        {/* Row: Category + Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Category</label>
            <input value={form.category} onChange={set('category')} placeholder="e.g. Nutrition" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={form.status} onChange={set('status')} style={inputStyle}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label style={labelStyle}>Tags <span style={{ color: '#9ca3af', fontWeight: 400 }}>(comma separated)</span></label>
          <input value={form.tags} onChange={set('tags')} placeholder="protein, muscle, recovery" style={inputStyle} />
        </div>

        {/* Excerpt */}
        <div>
          <label style={labelStyle}>Excerpt <span style={{ color: '#9ca3af', fontWeight: 400 }}>(max 160 chars, auto-filled from content)</span></label>
          <textarea value={form.excerpt} onChange={set('excerpt')} rows={3} maxLength={160}
            placeholder="Short summary shown in listing..." style={{ ...inputStyle, resize: 'vertical' }} />
          <p style={{ textAlign: 'right', fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{form.excerpt.length}/160</p>
        </div>

        {/* Content Editor */}
        <div>
          <label style={labelStyle}>Content <span style={{ color: '#9ca3af', fontWeight: 400 }}>(HTML supported)</span></label>
          <div style={{ border: '2px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '8px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { label: 'H2', tag: '<h2>', close: '</h2>' },
                { label: 'H3', tag: '<h3>', close: '</h3>' },
                { label: 'B', tag: '<strong>', close: '</strong>' },
                { label: 'I', tag: '<em>', close: '</em>' },
                { label: 'P', tag: '<p>', close: '</p>' },
                { label: 'UL', tag: '<ul>\n  <li>', close: '</li>\n</ul>' },
                { label: 'Link', tag: '<a href="">', close: '</a>' },
              ].map(({ label, tag, close }) => (
                <button key={label} type="button"
                  onClick={() => {
                    const ta = document.getElementById('blog-content-editor');
                    const start = ta.selectionStart, end = ta.selectionEnd;
                    const selected = form.content.slice(start, end);
                    const newContent = form.content.slice(0, start) + tag + selected + close + form.content.slice(end);
                    onContentChange(newContent);
                    setTimeout(() => { ta.focus(); ta.selectionStart = start + tag.length; ta.selectionEnd = start + tag.length + selected.length; }, 0);
                  }}
                  style={{ padding: '4px 10px', fontSize: 12, fontWeight: 700, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
            <textarea id="blog-content-editor" value={form.content} onChange={e => onContentChange(e.target.value)}
              rows={18} placeholder="<h2>Introduction</h2><p>Start writing your post...</p>"
              style={{ width: '100%', padding: '16px', border: 'none', resize: 'vertical', fontSize: 14, lineHeight: 1.6, fontFamily: 'monospace', outline: 'none' }} />
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
            ~{readingTime(form.content)} min read · {form.content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid #f0f0f0' }}>
        <button className="btn btn-primary" onClick={() => onSave('published')}>🚀 Publish</button>
        <button className="btn btn-outline" onClick={() => onSave('draft')}>💾 Save Draft</button>
        <button className="btn btn-outline" onClick={onBack}>Cancel</button>
      </div>
    </div>
  );
}

function PreviewPanel({ post, onBack }) {
  return (
    <div>
      <div style={{ background: '#fef3c7', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} className="btn btn-dark" style={{ fontSize: 13, padding: '8px 16px' }}>← Back to Editor</button>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>📌 Preview Mode — not published yet</span>
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
        {post.category && <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 12, display: 'inline-block', marginBottom: 16 }}>{post.category}</span>}
        <h1 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 900, lineHeight: 1.2, marginBottom: 16 }}>{post.title || 'Untitled'}</h1>
        <div style={{ display: 'flex', gap: 12, color: '#6b7280', fontSize: 13, marginBottom: 32 }}>
          <span>📅 {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>⏱ {readingTime(post.content)} min read</span>
        </div>
        {post.featuredImage && (
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 40 }}>
            <img src={post.featuredImage} alt={post.title} style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} />
          </div>
        )}
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content || '<p style="color:#9ca3af">No content yet…</p>' }}
          style={{ fontSize: 17, lineHeight: 1.85, color: '#1f2937' }} />
        {post.tags && (
          <div style={{ marginTop: 40 }}>
            {post.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
              <span key={tag} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', fontSize: 13, padding: '4px 14px', borderRadius: 50, marginRight: 8 }}>#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function readingTime(content = '') {
  return Math.max(1, Math.ceil(content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length / 200));
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: '#374151' };
const inputStyle = { width: '100%', padding: '11px 14px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14, transition: 'border-color 0.2s', background: '#fff' };
