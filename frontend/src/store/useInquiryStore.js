import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useInquiryStore = create((set) => ({
  isSubmitting: false,

  submitInquiry: async (data) => {
    set({ isSubmitting: true });
    try {
      const res = await axiosInstance.post('/inquiries', data);
      toast.success('Tour request submitted successfully!');
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
      return null;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
