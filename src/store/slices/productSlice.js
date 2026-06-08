// productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/products', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (slug, { rejectWithValue }) => {
  try {
    const res = await api.get(`/products/${slug}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchFeatured = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/products/featured');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    product: null,
    featured: [],
    total: 0,
    totalPages: 1,
    currentPage: 1,
    loading: false,
    error: null,
    recentlyViewed: [],
  },
  reducers: {
    addToRecentlyViewed: (state, action) => {
      const existing = state.recentlyViewed.findIndex(p => p._id === action.payload._id);
      if (existing !== -1) state.recentlyViewed.splice(existing, 1);
      state.recentlyViewed.unshift(action.payload);
      if (state.recentlyViewed.length > 6) state.recentlyViewed.pop();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProduct.pending, (state) => { state.loading = true; state.product = null; })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false; state.product = action.payload.product;
      })
      .addCase(fetchProduct.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeatured.fulfilled, (state, action) => {
        state.featured = action.payload.products;
      });
  },
});

export const { addToRecentlyViewed } = productSlice.actions;
export default productSlice.reducer;
