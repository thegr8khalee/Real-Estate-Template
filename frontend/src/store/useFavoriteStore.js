import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useFavoriteStore = create((set, get) => ({
  favoriteIds: [],
  favorites: [],
  isLoading: false,

  fetchFavoriteIds: async () => {
    try {
      const res = await axiosInstance.get('favorites/ids');
      if (res.data.success) {
        set({ favoriteIds: res.data.propertyIds });
      }
    } catch {
      // silently fail — user may not be logged in
    }
  },

  toggleFavorite: async (propertyId) => {
    try {
      const res = await axiosInstance.post(`favorites/${propertyId}`);
      if (res.data.success) {
        set((state) => ({
          favoriteIds: res.data.favorited
            ? [...state.favoriteIds, propertyId]
            : state.favoriteIds.filter((id) => id !== propertyId),
        }));
        toast.success(res.data.message);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update favorites';
      toast.error(msg);
    }
  },

  isFavorited: (propertyId) => {
    return get().favoriteIds.includes(propertyId);
  },

  fetchFavorites: async (page = 1) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get('favorites', { params: { page, limit: 20 } });
      if (res.data.success) {
        set({ favorites: res.data.favorites, isLoading: false });
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch favorites';
      toast.error(msg);
      set({ isLoading: false });
    }
  },

  clearFavorites: () => set({ favoriteIds: [], favorites: [] }),
}));
