import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

const invalidatePropertiesCache = () => {
  axiosInstance.cache?.invalidateByUrl?.('properties/');
};

const invalidateBlogsCache = () => {
  axiosInstance.cache?.invalidateByUrl?.('blogs/');
};

export const useAdminOpsStore = create((set, get) => ({
  isLoading: false,
  error: null,
  newsletterStats: null,
  recentBroadcasts: [],
  totalBroadcasts: 0,
  totalBroadcastPages: 1,
  currentBroadcastPage: 1,
  isFetchingNewsletter: false,
  newsletterError: null,
  isSendingNewsletter: false,

  addProperty: async (data) => {
    console.log('Adding property with data:', data); // Debug log
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post('/admin/ops/add-property', data);
      toast.success('Property added successfully');
      invalidatePropertiesCache();
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      set({ error: error.response?.data?.message || error.message });
      throw error; // Re-throw the error to handle it in the component if needed
    } finally {
      set({ isLoading: false });
    }
  },

  updateProperty: async (id, data) => {
    console.log('Updating property with ID:', id, 'and data:', data); // Debug log
    set({ isLoading: true });
    try {
      const res = await axiosInstance.put(`/admin/ops/update-property/${id}`, data);
      toast.success('Property updated successfully');
      invalidatePropertiesCache();
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      set({ error: error.response?.data?.message || error.message });
      throw error; // Re-throw the error to handle it in the component if needed
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProperty: async (id) => {
    console.log('Deleting property with ID:', id); // Debug log
    set({ isLoading: true });
    try {
      const res = await axiosInstance.delete(`/admin/ops/delete-property/${id}`);
      toast.success('Property deleted successfully');
      invalidatePropertiesCache();
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      set({ error: error.response?.data?.message || error.message });
      throw error; // Re-throw the error to handle it in the component if needed
    } finally {
      set({ isLoading: false });
    }
  },

  addBlog: async (data) => {
    console.log('Adding blog with data:', data); // Debug log
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post('/admin/ops/add-blog', data);
      toast.success('Blog added successfully');
      invalidateBlogsCache();
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      set({ error: error.response?.data?.message || error.message });
      throw error; // Re-throw the error to handle it in the component if needed
    } finally {
      set({ isLoading: false });
    }
  },

  updateBlog: async (id, data) => {
    console.log('Updating blog with ID:', id, 'and data:', data); // Debug log
    set({ isLoading: true });
    try {
      const res = await axiosInstance.put(`/admin/ops/update-blog/${id}`, data);
      toast.success('Blog updated successfully');
      invalidateBlogsCache();
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      set({ error: error.response?.data?.message || error.message });
      throw error; // Re-throw the error to handle it in the component if needed
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBlog: async (id) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.delete(`admin/ops/delete-blog/${id}`);

      if (res.data.success) {
        toast.success('Blog deleted successfully');
        invalidateBlogsCache();
        return res.data;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete blog';
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getNewsletterStats: async () => {
    set({ isFetchingNewsletter: true, newsletterError: null });
    try {
      const res = await axiosInstance.get('admin/ops/newsletter/stats');

      set({
        newsletterStats: res.data.data,
        isFetchingNewsletter: false,
      });

      return res.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch newsletter stats';

      set({
        newsletterError: errorMessage,
        isFetchingNewsletter: false,
      });

      toast.error(errorMessage);
    }
  },

  getRecentBroadcasts: async (params = {}) => {
    set({ isFetchingNewsletter: true, newsletterError: null });
    try {
      const { page = 1, limit = 10 } = params;
      const res = await axiosInstance.get('admin/ops/newsletter/broadcasts', {
        params: { page, limit },
      });

      set({
        recentBroadcasts: res.data.data.broadcasts,
        totalBroadcasts: res.data.data.pagination.total,
        totalBroadcastPages: res.data.data.pagination.totalPages,
        currentBroadcastPage: res.data.data.pagination.currentPage,
        isFetchingNewsletter: false,
      });

      return res.data.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch broadcasts';

      set({
        newsletterError: errorMessage,
        isFetchingNewsletter: false,
      });

      toast.error(errorMessage);
    }
  },

  sendNewsletter: async (newsletterData) => {
    set({ isSendingNewsletter: true, newsletterError: null });
    try {
      const res = await axiosInstance.post('admin/ops/newsletter/send', newsletterData);

      toast.success('Newsletter sent successfully!');

      // Refresh broadcasts list
      get().getRecentBroadcasts({ page: 1, limit: 10 });

      set({ isSendingNewsletter: false });
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to send newsletter';

      set({
        newsletterError: errorMessage,
        isSendingNewsletter: false,
      });

      toast.error(errorMessage);
      throw error;
    }
  },

  createBroadcast: async (broadcastData) => {
    set({ isSendingNewsletter: true, newsletterError: null });
    try {
      const res = await axiosInstance.post('admin/broadcast/send', broadcastData);

      toast.success('Broadcast sent successfully!');

      // Refresh broadcasts list
      // get().getRecentBroadcasts({ page: 1, limit: 10 });

      set({ isSendingNewsletter: false });
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to send broadcast';

      set({
        newsletterError: errorMessage,
        isSendingNewsletter: false,
      });

      toast.error(errorMessage);
      throw error;
    }
  },
}));
