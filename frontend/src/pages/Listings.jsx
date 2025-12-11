import { ChevronLeft, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom'; // Add this import
import { motion } from 'framer-motion';
import {
  m4,
} from '../config/images';
import PropertyCard from '../components/PropertyCard';
import { usePropertyStore } from '../store/usePropertyStore';
import { useEffect } from 'react';
// import CarSearchBar from '../components/Searchbar';

const Listings = () => {
  const location = useLocation(); // Get navigation state
  const {
    properties,
    isLoading,
    getProperties,
    pagination,
    searchResults,
    clearSearchResults,
  } = usePropertyStore();

  console.log(searchResults);

  useEffect(() => {
    // Check if we navigated here with filters
    const navigationState = location.state;

    if (navigationState && Object.keys(navigationState).length > 0) {
      // Call getProperties with the filters from navigation state
      getProperties(navigationState);
    } else {
      // Only fetch all properties if no search results and no filters
      getProperties();
    }
  }, [getProperties, location.state]);

  // Format as currency
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const handlePageChange = (page) => {
    // Preserve type filter when paginating
    const params = { page };
    if (location.state?.type) {
      params.type = location.state.type;
    } else if (location.state?.city) {
      params.city = location.state.city;
    }
    getProperties(params);
  };

  // Clear navigation-applied filter and show all properties
  const clearNavigationFilter = () => {
    // Clear the navigation state
    window.history.replaceState({}, document.title, '/listings');
    location.state = {};
    // Fetch all properties
    getProperties();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  console.log(searchResults.length);

  // Determine what to display based on state
  const getDisplayTitle = () => {
    if (searchResults.length > 0) {
      return `Search Results (${searchResults.length})`;
    } else if (location.state?.type) {
      return `${location.state.type} Properties (${properties.length})`;
    } else if (location.state?.city) {
      return `Properties in ${location.state.city} (${properties.length})`;
    } else {
      return 'Listings';
    }
  };

  const renderProperties = () => {
    const propertiesToRender = searchResults.length > 0 ? searchResults : properties;

    if (propertiesToRender.length === 0 && !isLoading) {
      return (
        <section className="w-full justify-center flex">
          <div className="w-full max-w-6xl px-4 text-center py-12">
            <h2 className="text-xl text-gray-600">No properties found</h2>
            <p className="text-gray-500 mt-2">
              {location.state?.type
                ? `No ${location.state.type} properties available.`
                : location.state?.city
                ? `No properties available in ${location.state.city}.`
                : 'Try adjusting your search criteria.'}
            </p>
          </div>
        </section>
      );
    }

    return (
      <section id="listings" className="w-full justify-center flex">
        <div className="w-full max-w-6xl px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <p>Loading properties...</p>
          ) : (
            propertiesToRender.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <PropertyCard
                  image={
                    property.imageUrls && property.imageUrls.length > 0
                      ? property.imageUrls[0]
                      : m4
                  }
                  title={property.title}
                  address={property.address}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  sqft={property.sqft}
                  price={property.price}
                  type={property.type}
                  link={`/property/${property.id}`}
                />
              </motion.div>
            ))
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="pt-26 font-inter bg-base-200">
      <div id="mobile" className="w-full">
        {/* <section className="w-full bg-secondary pt-16 px-4 h-40 sticky top-0 z-50">
          <hr className="border-t border-gray-500" />
          <CarSearchBar />
        </section> */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full p-4"
        >
          <div className="w-full max-w-6xl mx-auto">
            <div className="w-full flex justify-between items-end">
              <h1 className="text-xl sm:text-3xl font-bold">
                {getDisplayTitle()}
              </h1>
              <div className="flex flex-shrink-0 items-center">
                <p className="text-sm text-gray-600 flex-shrink-0 pr-1">
                  Sort by
                </p>
                <select className="select border-0 bg-gray-200 select-xs max-w-30 sm:max-w-50">
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="date-asc">Date: Oldest to Newest</option>
                  <option value="date-desc">Date: Newest to Oldest</option>
                </select>
              </div>
            </div>

            {/* Show clear buttons for different filter states */}
            <div className="flex gap-2 mt-2">
              {searchResults.length > 0 && (
                <button
                  onClick={clearSearchResults}
                  className="text-primary hover:text-primary/80 font-medium text-sm"
                >
                  Clear Search
                </button>
              )}
              {location.state?.type ||
              location.state?.city ? (
                <button
                  onClick={clearNavigationFilter}
                  className="text-primary hover:text-primary/80 font-medium text-sm"
                >
                  Clear{' '}
                  {location.state.type ||
                    location.state.city}{' '}
                  Filter
                </button>
              ) : null}
            </div>
          </div>
        </motion.section>
        {renderProperties()}
        <section className="w-full py-8 flex justify-center">
          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center gap-2">
              {/* Go to Page 1 button */}
              {pagination.totalPages > 3 && pagination.currentPage > 3 && (
                <button
                  onClick={() => handlePageChange(1)}
                  className="btn btn-circle btn-primary"
                >
                  1
                </button>
              )}
              {/* Prev Button */}
              {pagination.currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className="btn btn-circle btn-primary"
                >
                  <ChevronLeft className="size-5 text-white" />
                </button>
              )}
              {/* Page Numbers */}
              {[...Array(pagination.totalPages)]
                .map((_, index) => index + 1)
                .filter(
                  (page) =>
                    page >= pagination.currentPage - 2 &&
                    page <= pagination.currentPage + 2
                )
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`btn btn-circle ${
                      page === pagination.currentPage
                        ? 'btn-primary text-white btn-circle'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              {/* Next Button */}
              {pagination.currentPage < pagination.totalPages && (
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className="btn rounded-full btn-primary"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Listings;
