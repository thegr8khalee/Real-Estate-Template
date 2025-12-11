import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useSellStore = create((set) => ({
    // State
    isSubmitting: false,
    error: null,
    successMessage: null,

    // Actions
    submitSellForm: async (formData) => {
        set({ isSubmitting: true, error: null, successMessage: null });
        try {
            // Map frontend field names to backend field names
            const backendData = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                emailAddress: formData.email, // Backend expects 'emailAddress'
                propertyType: formData.propertyType,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                bedrooms: formData.bedrooms,
                bathrooms: formData.bathrooms,
                sqft: formData.sqft,
                askingPrice: formData.askingPrice,
                condition: formData.condition,
                uploadPhotos: formData.images, // Backend expects 'uploadPhotos'
                additionalNotes: formData.additionalNotes,
            };

            const res = await axiosInstance.post('/sell/submit', backendData);

            set({ successMessage: res.data.message, isSubmitting: false });
            toast.success(res.data.message);
            return true; // Return success
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to submit the form.';
            toast.error(errorMessage);
            set({ error: errorMessage, isSubmitting: false });
            return false; // Return failure
        }
    },
}));