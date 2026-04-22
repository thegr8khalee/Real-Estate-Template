import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  X,
  Plus,
  Save,
  ArrowLeft,
  Loader2,
  Search,
  Calendar,
  Tag,
  FileText,
  Image as ImageIcon,
  SearchIcon,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import ErrorLogger from '../components/ErrorLogger';
import { usePropertyStore } from '../store/usePropertyStore';
import { formatPrice } from '../lib/utils';
import { Editor } from '@tinymce/tinymce-react';
import { useAdminOpsStore } from '../store/useAdminOpsStore';
import { useUserAuthStore } from '../store/useUserAuthStore';
import { useBlogStore } from '../store/useBlogStore';

const UpdateBlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { search, isSearching, searchResults, getProperty } = usePropertyStore();
  const {
    updateBlog,
    isLoading: isBlogLoading,
    error: backendError,
  } = useAdminOpsStore();
  const { authUser } = useUserAuthStore();
  const {
    currentBlog,
    fetchBlogById,
    isLoading: isFetchingBlog,
    clearCurrentBlog,
  } = useBlogStore();

  useEffect(() => {
    if (id) {
      fetchBlogById(id);
    }
    return () => {
      clearCurrentBlog();
    };
  }, [id, fetchBlogById, clearCurrentBlog]);

  console.log('Current Blog:', currentBlog);

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    content: '',
    category: '',
    status: 'draft',
    propertyIds: [],
    tags: [],
    seoTitle: '',
    seoDescription: '',
    publishedAt: '',
    authorId: '',
  });

  const [imagePreviews, setImagePreviews] = useState({
    imageUrl: '',
    featuredImage: '',
  });

  const [selectedProperties, setSelectedProperties] = useState([]);
  const [searchData, setSearchData] = useState({ propertySearchQuery: '' });
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs
  const propertyDropdownRef = useRef(null);
  const editorRef = useRef(null);

  // Category options
  const categoryOptions = [
    { value: 'reviews', label: 'Reviews' },
    { value: 'news', label: 'News' },
    { value: 'comparisons', label: 'Comparisons' },
    { value: 'buying_guide', label: 'Buying Guide' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'technology', label: 'Technology' },
    { value: 'industry_insights', label: 'Industry Insights' },
    { value: 'events', label: 'Events' },
    { value: 'lifestyle', label: 'Lifestyle' },
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ];

  // Initialize form data when blog is loaded
  useEffect(() => {
    if (currentBlog && !isInitialized) {
      const publishedAtValue = currentBlog.currentBlog.publishedAt
        ? new Date(currentBlog.currentBlog.publishedAt)
            .toISOString()
            .slice(0, 16)
        : '';

      // ✅ Setup form data
      setFormData({
        title: currentBlog.currentBlog.title || '',
        tagline: currentBlog.currentBlog.tagline || '',
        content: currentBlog.currentBlog.content || '',
        category: currentBlog.currentBlog.category || '',
        status: currentBlog.currentBlog.status || 'draft',
        propertyIds: currentBlog.currentBlog.propertyIds || [],
        tags: currentBlog.currentBlog.tags || [],
        seoTitle: currentBlog.currentBlog.seoTitle || '',
        seoDescription: currentBlog.currentBlog.seoDescription || '',
        publishedAt: publishedAtValue,
        authorId: currentBlog.currentBlog.authorId || authUser?.id || '',
      });

      // ✅ Setup images
      setImagePreviews({
        imageUrl: currentBlog.currentBlog.imageUrls || '',
        featuredImage: currentBlog.currentBlog.featuredImage || '',
      });

      // ✅ Fetch property details if IDs exist
      const fetchSelectedProperties = async () => {
        if (!currentBlog.currentBlog.propertyIds) return;

        const propertyData = await Promise.all(
          currentBlog.currentBlog.propertyIds.map(async (p) => {
            if (typeof p === 'string' || typeof p === 'number') {
              return await getProperty(p); // fetch property details
            }
            return p; // already a property object
          })
        );

        console.log("Resolved propertyData:", propertyData);
        setSelectedProperties(propertyData.filter((property) => property)); // filter out nulls
      };

      fetchSelectedProperties();
      setIsInitialized(true);
    }
  }, [currentBlog, authUser, isInitialized, getProperty]);

//   console.log(selectedProperties)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        propertyDropdownRef.current &&
        !propertyDropdownRef.current.contains(event.target)
      ) {
        setShowPropertyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreviews((prev) => ({
        ...prev,
        [imageType]: event.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (imageType) => {
    setImagePreviews((prev) => ({
      ...prev,
      [imageType]: '',
    }));
  };

  const handlePropertySelection = (property) => {
    if (!selectedProperties.find((selected) => selected.id === property.id)) {
      const newSelectedProperties = [...selectedProperties, property];
      setSelectedProperties(newSelectedProperties);
      setFormData((prev) => ({
        ...prev,
        propertyIds: newSelectedProperties.map((c) => c.id),
      }));
    }
    setSearchData({ propertySearchQuery: '' });
    setShowPropertyDropdown(false);
  };

  const removeProperty = (propertyId) => {
    const newSelectedProperties = selectedProperties.filter((property) => property.id !== propertyId);
    setSelectedProperties(newSelectedProperties);
    setFormData((prev) => ({
      ...prev,
      propertyIds: newSelectedProperties.map((c) => c.id),
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      const updatedTags = [...formData.tags, newTag.trim()];
      setFormData((prev) => ({
        ...prev,
        tags: updatedTags,
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const htmlContent = editorRef.current?.getContent() || '';
      if (!htmlContent.replace(/<[^>]*>/g, '').trim()) {
        setError('Content cannot be empty.');
        return;
      }

      if (!formData.title.trim()) {
        setError('Title is required.');
        return;
      }

      if (!formData.category) {
        setError('Category is required.');
        return;
      }

      const submitData = {
        ...formData,
        content: htmlContent,
        authorId: authUser.id,
        publishedAt:
          formData.status === 'scheduled' ? formData.publishedAt : null,
        imageUrl: imagePreviews.imageUrl || null,
        featuredImage: imagePreviews.featuredImage || null,
      };

      console.log('Updating blog:', submitData);

      // Call updateBlog with blog ID and data
      const response = await updateBlog(id, submitData);

      if (response) {
        // Navigate back to blog list or blog detail page on success
        navigate('/admin/blogs'); // Adjust route as needed
      }
    } catch (err) {
      console.error('Error updating blog:', err);
      setError(err.message);
    }
  };

  const handleSaveAsDraft = async (e) => {
    e.preventDefault();

    // Update status to draft and submit
    const updatedFormData = { ...formData, status: 'draft' };
    setFormData(updatedFormData);

    // Create a synthetic event for handleSubmit
    const syntheticEvent = {
      preventDefault: () => {},
    };

    await handleSubmit(syntheticEvent);
  };

  // Show loading state while fetching blog
  if (isFetchingBlog) {
    return (
      <div className="min-h-screen bg-base-200 pt-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p>Loading blog data...</p>
        </div>
      </div>
    );
  }

  // Show error if blog not found
  if (!currentBlog && !isFetchingBlog) {
    return (
      <div className="min-h-screen bg-base-200 pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Blog not found</p>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              className="btn btn-ghost rounded-full"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Update Blog Post</h1>
              <p className="text-gray-600">Edit and update your blog content</p>
            </div>
          </div>

          {error && <ErrorLogger error={error} />}
          {backendError && <ErrorLogger error={backendError} />}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Main Content Card */}
            <div className="card bg-base-100 rounded-3xl shadow-xl">
              <div className="card-body">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <div>
                      <label className="label font-medium">
                        <span>Title *</span>
                        <span className="text-xs text-gray-500">
                          {formData.title.length}/200
                        </span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="input input-bordered w-full rounded-full"
                        placeholder="Enter blog title..."
                        maxLength="200"
                        required
                      />
                    </div>

                    {/* Tagline */}
                    <div>
                      <label className="label font-medium">
                        <span>Tagline</span>
                        <span className="text-xs text-gray-500">
                          {formData.tagline.length}/300
                        </span>
                      </label>
                      <input
                        type="text"
                        name="tagline"
                        value={formData.tagline}
                        onChange={handleInputChange}
                        className="input input-bordered w-full rounded-full"
                        placeholder="Brief description of your post..."
                        maxLength="300"
                      />
                    </div>

                    {/* Content Editor */}
                    <div>
                      <label className="label font-medium">
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Content *
                        </span>
                      </label>

                      <div className="border border-base-300 rounded-md overflow-hidden">
                        <Editor
                          onInit={(evt, editor) => (editorRef.current = editor)}
                          apiKey="esh5bav8bmcm4mdbribpsniybxdqty6jszu5ctwihsw35a5y"
                          value={formData.content}
                          init={{
                            height: 300,
                            menubar: false,
                            plugins: [
                              'advlist autolink lists link image charmap print preview anchor',
                              'searchreplace visualblocks code fullscreen',
                              'insertdatetime media table paste code help wordcount',
                            ],
                            toolbar:
                              'undo redo | formatselect | ' +
                              'bold italic backcolor | alignleft aligncenter ' +
                              'alignright alignjustify | bullist numlist outdent indent | ' +
                              'removeformat | help',
                            content_style:
                              'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                          }}
                          onEditorChange={(content) => {
                            setFormData((prev) => ({ ...prev, content }));
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Settings & Media */}
                  <div className="space-y-6">
                    {/* Publication Settings */}
                    <div className="card bg-base-200 shadow-sm rounded-2xl">
                      <div className="card-body p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Publication
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="label font-medium">Status</label>
                            <select
                              name="status"
                              value={formData.status}
                              onChange={handleInputChange}
                              className="select select-bordered w-full rounded-full"
                            >
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {formData.status === 'scheduled' && (
                            <div>
                              <label className="label font-medium">
                                Publish Date
                              </label>
                              <input
                                type="datetime-local"
                                name="publishedAt"
                                value={formData.publishedAt}
                                onChange={handleInputChange}
                                className="input input-bordered w-full rounded-full"
                              />
                            </div>
                          )}

                          <div>
                            <label className="label font-medium">
                              Category *
                            </label>
                            <select
                              name="category"
                              value={formData.category}
                              onChange={handleInputChange}
                              className="select select-bordered w-full rounded-full"
                              required
                            >
                              <option value="">Select Category</option>
                              {categoryOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Featured Image */}
                    <div className="card bg-base-200 shadow-sm rounded-2xl">
                      <div className="card-body p-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Featured Image
                        </h3>

                        {imagePreviews.featuredImage ? (
                          <div className="relative">
                            <img
                              src={imagePreviews.featuredImage}
                              alt="Featured"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage('featuredImage')}
                              className="absolute top-2 right-2 btn btn-circle btn-xs bg-red-500 text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpload(e, 'featuredImage')
                              }
                              className="hidden"
                              id="featured-image"
                              required
                            />
                            <label
                              htmlFor="featured-image"
                              className="cursor-pointer flex flex-col items-center"
                            >
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600">
                                Upload Featured Image
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Image */}
                    <div className="card bg-base-200 rounded-2xl shadow-sm">
                      <div className="card-body p-4">
                        <h3 className="font-semibold mb-4">Additional Image</h3>

                        {imagePreviews.imageUrl ? (
                          <div className="relative">
                            <img
                              src={imagePreviews.imageUrl}
                              alt="Additional"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage('imageUrl')}
                              className="absolute top-2 right-2 btn btn-circle btn-xs bg-red-500 text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'imageUrl')}
                              className="hidden"
                              id="additional-image"
                              required
                            />
                            <label
                              htmlFor="additional-image"
                              className="cursor-pointer flex flex-col items-center"
                            >
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600">
                                Upload Image
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Properties Section */}
            <div className="card bg-base-100 rounded-2xl shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4">Related Properties</h3>

                {/* Property Search Dropdown */}
                <div className="relative" ref={propertyDropdownRef}>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchData.propertySearchQuery}
                        onChange={(e) =>
                          setSearchData({ propertySearchQuery: e.target.value })
                        }
                        className="input input-bordered w-full pr-10 rounded-l-full"
                        placeholder="Search for properties..."
                      />
                      <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (searchData.propertySearchQuery.trim()) {
                          search({ query: searchData.propertySearchQuery });
                          setShowPropertyDropdown(true);
                        }
                      }}
                      className="btn btn-primary rounded-r-full"
                      disabled={!searchData.propertySearchQuery.trim()}
                    >
                      <SearchIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Dropdown */}
                  {showPropertyDropdown && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center">
                          <Loader2 className="animate-spin mx-auto mb-2" />
                          Loading properties...
                        </div>
                      ) : !searchResults || searchResults.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No properties found
                        </div>
                      ) : (
                        (searchResults.data || searchResults).map((property) => (
                          <button
                            key={property.id}
                            type="button"
                            onClick={() => handlePropertySelection(property)}
                            className="w-full text-left p-3 hover:bg-base-200 border-b border-base-300 last:border-b-0"
                            disabled={selectedProperties.some(
                              (selected) => selected.id === property.id
                            )}
                          >
                            <div className="font-medium">
                              {property.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.type} • {formatPrice(property.price)}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Properties */}
                {selectedProperties.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Selected Properties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProperties.map((property) => (
                        <div
                          key={property.id}
                          className="badge badge-lg badge-outline gap-2 py-3 px-4"
                        >
                          <span>
                            {property.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeProperty(property.id)}
                            className="hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags & SEO Section */}
            <div className="card bg-base-100 rounded-2xl shadow-xl">
              <div className="card-body">
                <h3 className="card-title mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags & SEO
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tags */}
                  <div>
                    <label className="label font-medium">Tags</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="input input-bordered flex-1 rounded-l-full"
                        placeholder="Add a tag..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="btn btn-primary rounded-r-full"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <div
                            key={index}
                            className="badge badge-lg badge-outline gap-2 py-3 px-4"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SEO */}
                  <div className="space-y-4">
                    <div>
                      <label className="label font-medium">
                        <span>SEO Title</span>
                        <span className="text-xs text-gray-500">
                          {formData.seoTitle.length}/60
                        </span>
                      </label>
                      <input
                        type="text"
                        name="seoTitle"
                        value={formData.seoTitle}
                        onChange={handleInputChange}
                        className="input input-bordered w-full rounded-full"
                        placeholder="SEO optimized title..."
                        maxLength="60"
                      />
                    </div>

                    <div>
                      <label className="label font-medium">
                        <span>SEO Description</span>
                        <span className="text-xs text-gray-500">
                          {formData.seoDescription.length}/160
                        </span>
                      </label>
                      <textarea
                        name="seoDescription"
                        value={formData.seoDescription}
                        onChange={handleInputChange}
                        className="textarea textarea-bordered w-full h-20 rounded-xl"
                        placeholder="Brief description for search engines..."
                        maxLength="160"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                className="btn btn-outline rounded-full"
                onClick={() => navigate('/admin/blogs')}
              >
                Cancel
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  className="btn btn-ghost"
                  disabled={isBlogLoading}
                >
                  Save as Draft
                </button>

                <button
                  type="submit"
                  className="btn btn-primary rounded-full"
                  disabled={isBlogLoading}
                >
                  {isBlogLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Blog Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateBlogPage;
