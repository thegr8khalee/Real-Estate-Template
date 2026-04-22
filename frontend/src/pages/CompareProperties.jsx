import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, X, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { formatPrice } from '../lib/utils';

const CompareProperties = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('property1');

  const [properties, setProperties] = useState([null, null]);
  const [loading, setLoading] = useState([false, false]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null);

  useEffect(() => {
    if (initialId) {
      fetchProperty(initialId, 0);
    }
  }, [initialId]);

  const fetchProperty = async (id, slot) => {
    setLoading((prev) => { const n = [...prev]; n[slot] = true; return n; });
    try {
      const res = await axiosInstance.get(`properties/get-one/${id}`);
      setProperties((prev) => {
        const n = [...prev];
        n[slot] = res.data.property || res.data;
        return n;
      });
    } catch {
      // silently fail
    } finally {
      setLoading((prev) => { const n = [...prev]; n[slot] = false; return n; });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await axiosInstance.get(`/properties/search?query=${encodeURIComponent(searchQuery)}`);
      const results = res.data.data || res.data || [];
      setSearchResults(Array.isArray(results) ? results : []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectProperty = (property) => {
    setProperties((prev) => {
      const n = [...prev];
      n[activeSlot] = property;
      return n;
    });
    setSearchResults([]);
    setSearchQuery('');
    setActiveSlot(null);
  };

  const removeProperty = (slot) => {
    setProperties((prev) => {
      const n = [...prev];
      n[slot] = null;
      return n;
    });
  };

  const comparisonFields = [
    { label: 'Price', key: 'price', format: (v) => formatPrice(v) },
    { label: 'Type', key: 'type' },
    { label: 'Status', key: 'status' },
    { label: 'Bedrooms', key: 'bedrooms' },
    { label: 'Bathrooms', key: 'bathrooms' },
    { label: 'Square Feet', key: 'sqft', format: (v) => v ? `${Number(v).toLocaleString()} sqft` : '—' },
    { label: 'Year Built', key: 'yearBuilt' },
    { label: 'Condition', key: 'condition' },
    { label: 'City', key: 'city' },
    { label: 'State', key: 'state' },
    { label: 'Postal Code', key: 'zipCode' },
  ];

  const getImageUrl = (property) => {
    if (property?.imageUrls?.length) return property.imageUrls[0];
    if (property?.images?.length) {
      const img = property.images[0];
      return typeof img === 'string' ? img : img?.url;
    }
    return null;
  };

  const renderPropertySlot = (slot) => {
    const property = properties[slot];
    const isLoading = loading[slot];

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin size-8 text-primary" />
        </div>
      );
    }

    if (!property) {
      return (
        <div
          className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors"
          onClick={() => setActiveSlot(slot)}
        >
          <Search className="size-10 text-gray-400 mb-3" />
          <p className="text-gray-500 font-medium">Select a property to compare</p>
        </div>
      );
    }

    const imgUrl = getImageUrl(property);

    return (
      <div className="relative">
        <button
          onClick={() => removeProperty(slot)}
          className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow hover:bg-red-50"
        >
          <X className="size-4 text-red-500" />
        </button>
        {imgUrl && (
          <img src={imgUrl} alt={property.title} className="w-full h-48 object-cover rounded-lg mb-3" />
        )}
        <h3 className="font-bold text-lg">{property.title}</h3>
        <p className="text-sm text-gray-500">{property.address}, {property.city}</p>
        <p className="text-primary font-bold text-lg mt-1">{formatPrice(property.price)}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-200 pt-20 px-4 pb-12">
      <div className="container mx-auto max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-5" />
          Back
        </button>

        <h1 className="text-3xl font-bold mb-8">Compare Properties</h1>

        {/* Search Modal */}
        {activeSlot !== null && (
          <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Search for a property</h3>
              <button onClick={() => { setActiveSlot(null); setSearchResults([]); setSearchQuery(''); }}>
                <X className="size-5 text-gray-500" />
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input input-bordered flex-1"
                placeholder="Search by title, city, or address..."
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="btn btn-primary"
              >
                {isSearching ? <Loader2 className="animate-spin size-4" /> : 'Search'}
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => selectProperty(result)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border"
                  >
                    {getImageUrl(result) && (
                      <img src={getImageUrl(result)} alt="" className="w-16 h-12 object-cover rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      <p className="text-sm text-gray-500">{result.city} — {formatPrice(result.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Property Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            {renderPropertySlot(0)}
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            {renderPropertySlot(1)}
          </div>
        </div>

        {/* Comparison Table */}
        {properties[0] && properties[1] && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-4 font-semibold text-gray-700 w-1/3">Feature</th>
                  <th className="text-left p-4 font-semibold text-gray-700 w-1/3">{properties[0].title}</th>
                  <th className="text-left p-4 font-semibold text-gray-700 w-1/3">{properties[1].title}</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFields.map((field, idx) => {
                  const val1 = properties[0][field.key];
                  const val2 = properties[1][field.key];
                  const fmt = field.format || ((v) => v ?? '—');
                  return (
                    <tr key={field.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-4 font-medium text-gray-600">{field.label}</td>
                      <td className="p-4">{fmt(val1)}</td>
                      <td className="p-4">{fmt(val2)}</td>
                    </tr>
                  );
                })}
                {/* Features comparison */}
                <tr className="bg-white">
                  <td className="p-4 font-medium text-gray-600">Features</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {(properties[0].features || []).map((f, i) => (
                        <span key={i} className="badge badge-sm badge-outline">{f}</span>
                      ))}
                      {(!properties[0].features || properties[0].features.length === 0) && '—'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {(properties[1].features || []).map((f, i) => (
                        <span key={i} className="badge badge-sm badge-outline">{f}</span>
                      ))}
                      {(!properties[1].features || properties[1].features.length === 0) && '—'}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {(!properties[0] || !properties[1]) && (
          <div className="text-center text-gray-500 mt-8">
            <p>Select two properties to see a side-by-side comparison</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareProperties;
