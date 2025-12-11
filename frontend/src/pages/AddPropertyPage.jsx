import React, { useState } from 'react';
import { Upload, X, Plus, Save, ArrowLeft } from 'lucide-react';
import { useAdminOpsStore } from '../store/useAdminOpsStore';
import ErrorLogger from '../components/ErrorLogger';

const AddPropertyPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: '',
    status: 'For Sale',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    yearBuilt: '',
    condition: 'Used',
    description: '',
    features: [],
  });

  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [newFeature, setNewFeature] = useState('');

  const { isLoading, addProperty, error } = useAdminOpsStore();

  // Options
  const typeOptions = ['House', 'Apartment', 'Condo', 'Land', 'Commercial', 'Townhouse', 'Villa'];
  const statusOptions = ['For Sale', 'For Rent', 'Sold', 'Pending'];
  const conditionOptions = ['New', 'Used', 'Renovated', 'Under Construction'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== featureToRemove),
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setImages((prev) => [...prev, base64String]);
        setImagePreview((prev) => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const propertyData = {
        ...formData,
        images: images,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        sqft: formData.sqft ? parseInt(formData.sqft) : null,
        yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
      };
      
      const success = await addProperty(propertyData);
      if (success) {
        // Reset form
        setFormData({
          title: '',
          price: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          type: '',
          status: 'For Sale',
          bedrooms: '',
          bathrooms: '',
          sqft: '',
          yearBuilt: '',
          condition: 'Used',
          description: '',
          features: [],
        });
        setImages([]);
        setImagePreview([]);
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Error adding property:', error);
    }
  };

  const steps = [
    { id: 1, title: 'Basic Info', fields: ['title', 'price', 'type', 'status', 'condition'] },
    { id: 2, title: 'Location', fields: ['address', 'city', 'state', 'zipCode'] },
    { id: 3, title: 'Details', fields: ['bedrooms', 'bathrooms', 'sqft', 'yearBuilt'] },
    { id: 4, title: 'Features', fields: ['features'] },
    { id: 5, title: 'Images & Desc', fields: ['images', 'description'] },
  ];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="label font-medium">Property Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="e.g., Modern Villa with Ocean View"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="500000"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="select select-bordered w-full rounded-full"
                  required
                >
                  <option value="">Select Type</option>
                  {typeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label font-medium">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="select select-bordered w-full rounded-full"
                  required
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label font-medium">Condition *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="select select-bordered w-full rounded-full"
                  required
                >
                  {conditionOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="label font-medium">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="123 Main St"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="Los Angeles"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="CA"
                  required
                />
              </div>
              <div>
                <label className="label font-medium">Zip Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="90001"
                  required
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label font-medium">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="3"
                />
              </div>
              <div>
                <label className="label font-medium">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="2.5"
                  step="0.5"
                />
              </div>
              <div>
                <label className="label font-medium">Square Feet</label>
                <input
                  type="number"
                  name="sqft"
                  value={formData.sqft}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="2000"
                />
              </div>
              <div>
                <label className="label font-medium">Year Built</label>
                <input
                  type="number"
                  name="yearBuilt"
                  value={formData.yearBuilt}
                  onChange={handleInputChange}
                  className="input input-bordered w-full rounded-full"
                  placeholder="2020"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="label font-medium">Property Features</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="input input-bordered flex-1 rounded-full"
                  placeholder="Add a feature (e.g., Swimming Pool, Garage)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="btn btn-primary rounded-full px-6"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="badge badge-lg badge-outline gap-2 py-3 px-4 rounded-full">
                    <span>{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(feature)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="label font-medium">Property Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <span className="text-sm text-gray-600">Click to upload images</span>
                </label>
              </div>
              {imagePreview.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imagePreview.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Preview ${index}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="label font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full h-32 rounded-3xl"
                placeholder="Describe the property..."
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              className="btn btn-ghost rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Add New Property</h1>
              <p className="text-gray-600">Fill in the details to add a new property to inventory</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-2 text-sm font-medium">
              <span>Step {currentStep} of 5</span>
              <span>{steps[currentStep - 1]?.title}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {error && <ErrorLogger error={error} />}

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              {renderStep()}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-outline rounded-full px-8"
                  disabled={currentStep === 1}
                >
                  Previous
                </button>
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn btn-primary rounded-full px-8"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn btn-primary rounded-full px-8"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Adding Property...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Add Property
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPropertyPage;
