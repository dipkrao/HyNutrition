import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchPublishedBlogs = createAsyncThunk('blog/fetchPublished', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/blogs/published', { params });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const fetchBlogBySlug = createAsyncThunk('blog/fetchBySlug', async (slug, { rejectWithValue }) => {
  try {
    const res = await api.get(`/blogs/${slug}`);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Not found'); }
});

// Admin thunks
export const fetchAdminBlogs = createAsyncThunk('blog/fetchAdmin', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/blogs', { params });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const createBlog = createAsyncThunk('blog/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/blogs', data);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const updateBlog = createAsyncThunk('blog/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/blogs/${id}`, data);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const deleteBlog = createAsyncThunk('blog/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/blogs/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const togglePublish = createAsyncThunk('blog/togglePublish', async (id, { getState, rejectWithValue }) => {
  try {
    const post = getState().blog.adminPosts.find(p => p._id === id);
    const newStatus = post?.status === 'published' ? 'draft' : 'published';
    const res = await api.put(`/blogs/${id}`, { status: newStatus });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const blogSlice = createSlice({
  name: 'blog',
  initialState: { posts: [], current: null, adminPosts: [], loading: false, adminLoading: false, error: null, total: 0 },
  reducers: { clearCurrentBlog: s => { s.current = null; } },
  extraReducers: b => {
    b.addCase(fetchPublishedBlogs.pending, s => { s.loading = true; })
     .addCase(fetchPublishedBlogs.fulfilled, (s, a) => { s.loading = false; s.posts = a.payload.blogs; s.total = a.payload.total; })
     .addCase(fetchPublishedBlogs.rejected, s => { s.loading = false; })

     .addCase(fetchBlogBySlug.pending, s => { s.loading = true; })
     .addCase(fetchBlogBySlug.fulfilled, (s, a) => { s.loading = false; s.current = a.payload.blog; })
     .addCase(fetchBlogBySlug.rejected, s => { s.loading = false; })

     .addCase(fetchAdminBlogs.pending, s => { s.adminLoading = true; })
     .addCase(fetchAdminBlogs.fulfilled, (s, a) => { s.adminLoading = false; s.adminPosts = a.payload.blogs; })
     .addCase(fetchAdminBlogs.rejected, s => { s.adminLoading = false; })

     .addCase(createBlog.fulfilled, (s, a) => { s.adminPosts.unshift(a.payload.blog); })
     .addCase(updateBlog.fulfilled, (s, a) => {
       const idx = s.adminPosts.findIndex(p => p._id === a.payload.blog._id);
       if (idx !== -1) s.adminPosts[idx] = a.payload.blog;
     })
     .addCase(deleteBlog.fulfilled, (s, a) => { s.adminPosts = s.adminPosts.filter(p => p._id !== a.payload); })
     .addCase(togglePublish.fulfilled, (s, a) => {
       const idx = s.adminPosts.findIndex(p => p._id === a.payload.blog._id);
       if (idx !== -1) s.adminPosts[idx] = a.payload.blog;
     });
  },
});

export const { clearCurrentBlog } = blogSlice.actions;
export default blogSlice.reducer;
