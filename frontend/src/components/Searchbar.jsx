import React, { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, ArrowUpRight, Home, Building, Warehouse } from 'lucide-react';
import { Range } from 'react-range';
import { usePropertyStore } from '../store/usePropertyStore';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import PropertyList from './PropertyList';
import branding from '../config/branding';
import { formatPrice } from '../lib/utils';

const Searchbar = () => {
  const { search, isSearching, searchResults, clearSearchResults } = usePropertyStore();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const filterRef = useRef(null);

  // Price range state - driven by branding config
  const SLIDER_MIN = branding.currency.priceRange.min; 
  const SLIDER_MAX = branding.currency.priceRange.max; 
  const SLIDER_STEP = branding.currency.priceRange.step; 
  const [values, setValues] = useState([SLIDER_MIN, SLIDER_MAX]);

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState([]); // Rent/Sale
  const [selectedType, setSelectedType] = useState([]); // House/Apartment
  const [selectedBedrooms, setSelectedBedrooms] = useState([]);
  const [isSearched, setIsSearched] = useState(false);

  useEffect(() => {
    const hasFilters =
      values[0] > SLIDER_MIN ||
      values[1] < SLIDER_MAX ||
      selectedStatus.length > 0 ||
      selectedType.length > 0 ||
      selectedBedrooms.length > 0;

    setHasActiveFilters(hasFilters);
  }, [
    values,
    selectedStatus,
    selectedType,
    selectedBedrooms,
    searchQuery,
  ]);

  const toggleSelectStatus = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const toggleSelectType = (type) => {
    setSelectedType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleSelectBedrooms = (num) => {
    setSelectedBedrooms((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const buildSearchParams = () => {
    const params = {
      page: 1,
      limit: 50,
    };

    if (searchQuery.trim()) {
      params.query = searchQuery.trim(); 
    }

    if (values[0] > SLIDER_MIN) params.minPrice = values[0];
    if (values[1] < SLIDER_MAX) params.maxPrice = values[1];

    if (selectedStatus.length > 0) {
      params.status = selectedStatus.join(',');
    }

    if (selectedType.length > 0) {
      params.type = selectedType.join(',');
    }

    if (selectedBedrooms.length > 0) {
      params.bedrooms = selectedBedrooms.join(',');
    }

    return params;
  };

  const handleSearch = async () => {
    try {
      setIsSearched(true);
      const searchParams = buildSearchParams();
      
      // if (searchQuery.trim()) searchParams.search = searchQuery.trim(); // Removed redundant line

      await search(searchParams);

      let message = 'Search completed';
      if (searchQuery.trim()) message += ` for "${searchQuery.trim()}"`;
      if (hasActiveFilters) message += ' with filters applied';

      toast.success(message);
      setIsFilterOpen(false);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const clearAllFilters = async () => {
    try {
      setIsSearched(false);
      setValues([SLIDER_MIN, SLIDER_MAX]);
      setSelectedStatus([]);
      setSelectedType([]);
      setSelectedBedrooms([]);
      setSearchQuery('');
      clearSearchResults();
      toast.success('All filters cleared');
    } catch (error) {
      console.error('Clear filters error:', error);
      toast.error('Failed to clear filters');
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (values[0] > SLIDER_MIN || values[1] < SLIDER_MAX) count++;
    if (selectedStatus.length > 0) count++;
    if (selectedType.length > 0) count++;
    if (selectedBedrooms.length > 0) count++;
    return count;
  };

  const location = useLocation();
  const isHome = location.pathname === '/';
  const navigate = useNavigate();

  const handleListingsClick = () => {
    navigate('/listings');
  };

  const propertyTypes = [
    { name: 'House', icon: Home },
    { name: 'Apartment', icon: Building },
    { name: 'Commercial', icon: Warehouse },
    { name: 'Land', icon: ArrowUpRight }, 
  ];

  return (
    <div className="fixed top-20 inset-x-0 text-center items-center justify-center flex flex-col w-full px-2 z-50">
      {/* Main Search Bar */}
      <div
        className={`items-center max-w-5xl justify-between p-1 flex w-full rounded-full backdrop-blur-lg h-15 z-50 relative
    ${
      isHome ? 'bg-secondary/30' : isFilterOpen ? 'bg-secondary/30' : 'bg-white'
    }`}
      >
        {/* Filter Button */}
        <div
          className={`relative ${
            isHome || isFilterOpen ? 'text-white' : 'text-gray-800'
          } items-center flex h-full px-4 border-r-2 ${
            isHome || isFilterOpen ? 'border-r-white/70' : 'border-r-black'
          } cursor-pointer text-sm transition-all duration-300 hover:bg-white/10`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          ref={filterRef}
        >
          <ChevronDown
            className={`size-5 mr-1 transform transition-transform duration-300 ${
              isFilterOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="ml-2 bg-primary text-secondary text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
              {getActiveFilterCount()}
            </span>
          )}
        </div>

        {/* Search Input */}
        <div className="h-full items-center flex w-full px-4">
          <input
            type="text"
            placeholder="Search by location, city, or property type..."
            className={`input w-full border-none bg-transparent ${
                isHome || isFilterOpen ? 'text-white placeholder:text-white/70' : 'text-black placeholder:text-black/70'
            } shadow-none focus:outline-none`}
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleSearchKeyPress}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-white/70 hover:text-white ml-2"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Search Button */}
        <div className="h-full flex justify-end">
          <button
            className=" btn btn-primary rounded-full h-full font-normal px-6 min-w-[100px]"
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-[-5px] text-start flex justify-center items-center inset-x-0 w-full px-0 z-40"
          >
            <div className="w-full max-w-5xl bg-white text-gray-800 rounded-4xl pt-17 pb-5 p-4 shadow-xl max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h1 className="font-semibold font-inter text-lg">
                    Property Filters
                  </h1>
                  <p className="font-inter text-xs text-gray-500">
                    Find your perfect home
                  </p>
                </div>
                <div className="flex gap-2">
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-secondary text-sm font-medium hover:underline"
                      disabled={isSearching}
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="size-5 text-secondary" />
                  </button>
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h1 className="text-secondary font-medium font-inter text-sm mb-3">
                  Price Range
                </h1>
                <div className="pt-2">
                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>{formatPrice(values[0])}</span>
                    <span>{formatPrice(values[1])}</span>
                  </div>

                  <Range
                    step={SLIDER_STEP}
                    min={SLIDER_MIN}
                    max={SLIDER_MAX}
                    values={values}
                    onChange={(vals) => setValues(vals)}
                    renderTrack={({ props: { key, ...trackProps }, children }) => (
                      <div
                        key={key}
                        {...trackProps}
                        style={{...trackProps.style, height: '36px', display: 'flex', width: '100%'}}
                      >
                        <div
                          style={{
                            height: '6px',
                            width: '100%',
                            borderRadius: '999px',
                            background: `linear-gradient(to right,
                              #e5e7eb ${((values[0] - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%,
                              var(--color-primary, #f0c710) ${((values[0] - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%,
                              var(--color-primary, #f0c710) ${((values[1] - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%,
                              #e5e7eb ${((values[1] - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%)`,
                            alignSelf: 'center',
                          }}
                        />
                        {children}
                      </div>
                    )}
                    renderThumb={({ props: { key, ...thumbProps }, isDragged }) => (
                      <div
                        key={key}
                        {...thumbProps}
                        style={{...thumbProps.style, height: '20px', width: '20px', borderRadius: '50%', backgroundColor: 'var(--color-primary, #f0c710)', border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', outline: 'none', transform: isDragged ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.15s'}}
                      />
                    )}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <h1 className=" font-medium font-inter text-sm mb-3">
                  Status
                </h1>
                <div className="flex flex-wrap gap-2">
                  {['For Sale', 'For Rent'].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => toggleSelectStatus(status)}
                        className={`btn btn-sm rounded-full font-medium transition-all ${
                          selectedStatus.includes(status)
                            ? 'bg-primary text-secondary border-primary'
                            : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Property Type */}
              <div className="mb-6">
                <h1 className="font-medium font-inter text-sm mb-3">
                  Property Type
                </h1>
                <div className="flex overflow-x-auto w-full space-x-3 pb-2">
                  {propertyTypes.map((type) => (
                    <div
                      key={type.name}
                      className={`rounded-xl border-2 p-3 flex flex-col items-center min-w-[90px] cursor-pointer transition-all ${
                        selectedType.includes(type.name)
                          ? 'bg-primary text-secondary border-primary transform'
                          : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => toggleSelectType(type.name)}
                    >
                      <type.icon className={`size-8 mb-2 transition-all ${selectedType.includes(type.name) ? '' : 'opacity-70'}`} />
                      <h1 className="text-xs font-medium">{type.name}</h1>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
               <div className="mb-6">
                <h1 className="font-medium font-inter text-sm mb-3">
                  Bedrooms
                </h1>
                <div className="flex flex-wrap gap-2">
                  {['1', '2', '3', '4', '5+'].map((num) => (
                    <button
                      key={num}
                      onClick={() => toggleSelectBedrooms(num)}
                       className={`btn btn-sm rounded-full font-medium transition-all ${
                          selectedBedrooms.includes(num)
                            ? 'bg-primary text-secondary border-primary'
                            : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50'
                        }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleSearch}
                  className="flex-1 btn btn-primary rounded-full py-3 font-medium"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Applying...
                    </>
                  ) : (
                    `Apply Filters ${
                      hasActiveFilters ? `(${getActiveFilterCount()})` : ''
                    }`
                  )}
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="btn btn-ghost rounded-full px-6"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      {(isHome || isSearched) && isSearched && (
        <div className="mt-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-md w-full max-w-5xl mx-auto">
          {searchResults.length > 0 ? (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">
                  {searchQuery ? (
                    <>
                      Showing results for "{searchQuery}" (
                      {searchResults.length} found)
                    </>
                  ) : (
                    <>Showing filtered results ({searchResults.length} found)</>
                  )}
                </span>
                <button
                  onClick={clearAllFilters}
                  className=" hover:text-primary/80 font-medium"
                >
                  Clear Search
                </button>
              </div>

              <div className="flex flex-col gap-2 mt-3 max-h-[60vh] overflow-y-auto">
                {searchResults.map((property) => (
                  <PropertyList
                    key={property.id}
                    image={property.images?.[0] || 'https://via.placeholder.com/150'}
                    title={property.title}
                    address={property.location}
                    price={property.price}
                    link={`/property/${property.id}`}
                  />
                ))}
              </div>

              <div>
                <button
                  onClick={handleListingsClick}
                  className="text-primary font-medium mt-2 hover:underline items-center justify-center flex mx-auto"
                >
                  View All Results
                  <ArrowUpRight className="size-4 inline-block ml-1" />
                </button>
              </div>
            </>
          ) : (
            <div>
              <div className="w-full flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  <X />
                </button>
              </div>
              <p className="text-gray-500 text-center">
                No properties found for your search.
              </p>
              <button
                onClick={handleListingsClick}
                className="mt-4 text-primary hover:text-primary/80 font-medium"
              >
                Browse all properties
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Searchbar;
