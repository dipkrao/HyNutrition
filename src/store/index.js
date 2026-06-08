import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import cartSlice from './slices/cartSlice';
import productSlice from './slices/productSlice';
import orderSlice from './slices/orderSlice';
import categorySlice from './slices/categorySlice';

const store = configureStore({
  reducer: { auth: authSlice, cart: cartSlice, products: productSlice, orders: orderSlice, categories: categorySlice },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
