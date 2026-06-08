import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchCategories = createAsyncThunk('categories/fetchAll', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/categories?active=true'); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchCategory = createAsyncThunk('categories/fetchOne', async (slug, { rejectWithValue }) => {
  try { const res = await api.get(`/categories/${slug}`); return res.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: { categories: [], category: null, loading: false, error: null },
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchCategories.pending, s => { s.loading = true; })
     .addCase(fetchCategories.fulfilled, (s, a) => { s.loading = false; s.categories = a.payload.categories; })
     .addCase(fetchCategories.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
     .addCase(fetchCategory.fulfilled, (s, a) => { s.category = a.payload.category; });
  },
});

export default categorySlice.reducer;
