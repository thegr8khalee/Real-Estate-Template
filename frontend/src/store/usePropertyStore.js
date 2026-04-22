import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import {
  buildCacheConfig,
  buildAxiosCacheOptions,
  hasCachedResponse,
  createAxiosRequestConfig,
} from './cacheHelpers.js';

export const usePropertyStore = create((set) => ({
  // State
  properties: [],
  property: null,
  propertyDetails: null, // Full envelope: { property, relatedProperties, reviews, averageRatings }
  isLoading: false,
  error: null,
  searchResults: [],
  isSearching: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },

  // Actions
  /**
   * Fetches a paginated list of all properties with optional filters.
   * @param {Object} params - An object containing query parameters for filtering and pagination.
   * e.g., { page: 2, limit: 10, type: 'House', priceMin: 500000 }
   */
  getProperties: async (params = {}, options = {}) => {
    const cacheConfig = buildCacheConfig('properties/get-all', params);
    const cacheOptions = buildAxiosCacheOptions(options);
    const hasCachedData = hasCachedResponse(cacheConfig, cacheOptions);

    set({ isLoading: !hasCachedData, error: null });
    try {
      const res = await axiosInstance.get(
        'properties/get-all',
        createAxiosRequestConfig(cacheOptions, { params })
      );

      // Update state with the properties and pagination data from the response
      set({
        properties: res.data.properties,
        pagination: {
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalItems: res.data.totalItems,
        },
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to retrieve properties.';
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Searches for properties based on a single query string.
   * @param {string} query - The search term.
   */
  search: async (params = {}, options = {}) => {
    const cacheOptions = buildAxiosCacheOptions(options);

    try {
      // Convert params object to URL search params
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value);
        }
      });

      // Use get-all so the full filter set (price, type, beds, status, etc.) is honored.
      // The dedicated /search endpoint only supports the `query` param.
      const url = `/properties/get-all?${searchParams.toString()}`;
      const cacheConfig = buildCacheConfig(url);
      const hasCachedData = hasCachedResponse(cacheConfig, cacheOptions);

      set({ isSearching: !hasCachedData, error: null });

      const response = await axiosInstance.get(
        url,
        createAxiosRequestConfig(cacheOptions)
      );
      const data = response.data;

      if (response.status === 200) {
        const results = data.properties ?? data.data ?? [];
        set({
          searchResults: results,
          properties: results, // Update both for compatibility
          isSearching: false,
        });
      } else {
        set({
          searchResults: [],
          properties: [],
          error: data.message,
          isSearching: false,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      set({
        searchResults: [],
        properties: [],
        error: error.message || 'An error occurred while searching',
        isSearching: false,
      });
    }
  },

  /**
   * Clears any cached search results so the next listings view shows the full property list.
   */
  clearSearchResults: () => set({ searchResults: [] }),

  /**
   * Fetches a property plus its related properties, reviews, and average ratings.
   * Stores the full envelope under `propertyDetails` for the property details page.
   */
  getPropertyById: async (id, options = {}) => {
    const cacheConfig = buildCacheConfig(`properties/get/${id}`);
    const cacheOptions = buildAxiosCacheOptions(options);
    const hasCachedData = hasCachedResponse(cacheConfig, cacheOptions);

    set({ isLoading: !hasCachedData, error: null });
    try {
      const res = await axiosInstance.get(
        `properties/get/${id}`,
        createAxiosRequestConfig(cacheOptions)
      );
      set({ propertyDetails: res.data });
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to retrieve property details.';
      toast.error(errorMessage);
      set({ error: errorMessage, propertyDetails: null });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Fetches a single property by its ID (bare property only — used by edit forms).
   * @param {string} id - The ID of the property to retrieve.
   */
  getProperty: async (id, options = {}) => {
    const cacheConfig = buildCacheConfig(`properties/get/${id}`);
    const cacheOptions = buildAxiosCacheOptions(options);
    const hasCachedData = hasCachedResponse(cacheConfig, cacheOptions);

    set({ isLoading: !hasCachedData, error: null });
    try {
      const res = await axiosInstance.get(
        `properties/get/${id}`,
        createAxiosRequestConfig(cacheOptions)
      );
      set({ property: res.data.property });
      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to retrieve property details.';
      toast.error(errorMessage);
      set({ error: errorMessage });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));
