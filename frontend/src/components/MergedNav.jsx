import {
  LogOut,
  Menu,
  User2,
  ChevronDown,
  X,
  Search,
  Loader2,
  SearchIcon,
  FilterIcon,
  Home,
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Range } from 'react-range';
import { useUserAuthStore } from '../store/useUserAuthStore';
import { useAdminAuthStore } from '../store/useAdminAuthStore';
import { usePropertyStore } from '../store/usePropertyStore';
import toast from 'react-hot-toast';
import branding from '../config/branding';

const MergedNavbar = ({ className = '' }) => {
  const { adminLogout } = useAdminAuthStore();
  const { logout, authUser, isAdmin } = useUserAuthStore();
  const { getProperties, isLoading } = usePropertyStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const filterRef = useRef(null);

  // Price range state
  const SLIDER_MIN = 100000;
  const SLIDER_MAX = 10000000;
  const SLIDER_STEP = 50000;
  const [values, setValues] = useState([SLIDER_MIN, SLIDER_MAX]);

  // Filter states
  const [selectedPropertyType, setSelectedPropertyType] = useState([]);
  const [selectedBedrooms, setSelectedBedrooms] = useState([]);

  const propertyTypes = ['House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Commercial'];
  const bedroomOptions = ['1', '2', '3', '4', '5+'];

  const isListings = location.pathname === '/listings';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    const hasFilters =
      values[0] > SLIDER_MIN ||
      values[1] < SLIDER_MAX ||
      selectedPropertyType.length > 0 ||
      selectedBedrooms.length > 0;

    setHasActiveFilters(hasFilters);
  }, [values, selectedPropertyType, selectedBedrooms]);

  const toggleMobileMenu = () => setIsMobileMenuOpen((s) => !s);

  const closeDrawer = () => {
    setIsMobileMenuOpen(false);
  };

  const handleAdminLogOut = () => {
    adminLogout();
    closeDrawer();
  };

  const handleLogOut = () => {
    logout();
    closeDrawer();
  };

  const handleSignIn = () => {
    navigate('/profile');
    closeDrawer();
  };

  const handleProfile = () => {
    navigate('/profile');
    closeDrawer();
  };

  const toggleSelectPropertyType = (type) => {
    setSelectedPropertyType((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const toggleSelectBedrooms = (beds) => {
    setSelectedBedrooms((prev) =>
      prev.includes(beds)
        ? prev.filter((b) => b !== beds)
        : [...prev, beds]
    );
  };

  const buildSearchParams = () => {
    const params = { page: 1, limit: 50 };

    if (searchQuery.trim()) params.query = searchQuery.trim();
    if (values[0] > SLIDER_MIN) params.minPrice = values[0];
    if (values[1] < SLIDER_MAX) params.maxPrice = values[1];

    if (selectedPropertyType.length > 0) {
      params.type = selectedPropertyType.join(',');
    }

    if (selectedBedrooms.length > 0) {
      params.bedrooms = selectedBedrooms.join(',');
    }

    return params;
  };

  const handleSearch = async () => {
    try {
      const searchParams = buildSearchParams();
      
      // Navigate to listings with search params in state
      // The Listings page will handle the fetching via useEffect
      navigate('/listings', { state: searchParams });

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
      setValues([SLIDER_MIN, SLIDER_MAX]);
      setSelectedPropertyType([]);
      setSelectedBedrooms([]);
      setSearchQuery('');
      
      if (isListings) {
        navigate('/listings', { state: {} });
      } else {
        await getProperties(); // Reset to all properties if not navigating
      }
      
      toast.success('All filters cleared');
    } catch (error) {
      console.error('Clear filters error:', error);
      toast.error('Failed to clear filters');
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (values[0] > SLIDER_MIN || values[1] < SLIDER_MAX) count++;
    if (selectedPropertyType.length > 0) count++;
    if (selectedBedrooms.length > 0) count++;
    return count;
  };

  const getButtonClass = (path) =>
    `font-normal btn text-base bg-transparent border-0 shadow-0 hover:bg-transparent hover:shadow-none text-start justify-start ${
      location.pathname === path ? 'font-bold text-primary' : ''
    }`;

  return (
    <>
      <nav
        className={`navbar bg-base-100 sticky top-0 z-50 shadow-sm px-4 md:px-8 h-20 ${className}`}
      >
        <div className="navbar-start w-full md:w-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            {branding.company.logo ? (
              <img
                src={branding.company.logo}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span className="text-xl font-bold text-primary">
                {branding.company.name}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            <button
              className="btn btn-ghost btn-circle"
              onClick={() => setIsFilterOpen(true)}
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="btn btn-ghost btn-circle"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="navbar-center hidden md:flex items-center gap-1">
          <Link to="/" className={getButtonClass('/')}>
            Home
          </Link>
          <Link to="/listings" className={getButtonClass('/listings')}>
            Listings
          </Link>
          {branding.features.neighborhoods && (
            <Link to="/neighborhoods" className={getButtonClass('/neighborhoods')}>
              Neighborhoods
            </Link>
          )}
          {branding.features.sell && (
            <Link to="/sell" className={getButtonClass('/sell')}>
              Sell
            </Link>
          )}
          {branding.features.blog && (
            <Link to="/blogs" className={getButtonClass('/blogs')}>
              Blog
            </Link>
          )}
          <Link to="/contact" className={getButtonClass('/contact')}>
            Contact
          </Link>
        </div>

        <div className="navbar-end hidden md:flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search properties..."
              className="input input-bordered w-64 pr-10 rounded-full"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleSearchKeyPress}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
              onClick={handleSearch}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          <button
            className="btn btn-ghost btn-circle"
            onClick={() => setIsFilterOpen(true)}
          >
            <div className="indicator">
              <FilterIcon className="h-5 w-5" />
              {hasActiveFilters && (
                <span className="badge badge-xs badge-primary indicator-item"></span>
              )}
            </div>
          </button>

          {authUser ? (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User2 className="h-6 w-6" />
                </div>
              </label>
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li>
                  <a onClick={handleProfile}>Profile</a>
                </li>
                {isAdmin && (
                  <li>
                    <Link to="/admin/dashboard">Dashboard</Link>
                  </li>
                )}
                <li>
                  <a onClick={handleLogOut}>Logout</a>
                </li>
              </ul>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="btn btn-primary rounded-full px-6"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-80 bg-base-100 z-50 shadow-xl overflow-y-auto"
            >
              <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-lg font-bold">Menu</h2>
                <button
                  onClick={closeDrawer}
                  className="btn btn-ghost btn-circle btn-sm"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex flex-col gap-2">
                  <Link
                    to="/"
                    className={`btn btn-ghost justify-start ${
                      location.pathname === '/' ? 'bg-base-200' : ''
                    }`}
                    onClick={closeDrawer}
                  >
                    Home
                  </Link>
                  <Link
                    to="/listings"
                    className={`btn btn-ghost justify-start ${
                      location.pathname === '/listings' ? 'bg-base-200' : ''
                    }`}
                    onClick={closeDrawer}
                  >
                    Listings
                  </Link>
                  {branding.features.neighborhoods && (
                    <Link
                      to="/neighborhoods"
                      className={`btn btn-ghost justify-start ${
                        location.pathname === '/neighborhoods' ? 'bg-base-200' : ''
                      }`}
                      onClick={closeDrawer}
                    >
                      Neighborhoods
                    </Link>
                  )}
                  {branding.features.sell && (
                    <Link
                      to="/sell"
                      className={`btn btn-ghost justify-start ${
                        location.pathname === '/sell' ? 'bg-base-200' : ''
                      }`}
                      onClick={closeDrawer}
                    >
                      Sell
                    </Link>
                  )}
                  {branding.features.blog && (
                    <Link
                      to="/blogs"
                      className={`btn btn-ghost justify-start ${
                        location.pathname === '/blogs' ? 'bg-base-200' : ''
                      }`}
                      onClick={closeDrawer}
                    >
                      Blog
                    </Link>
                  )}
                  <Link
                    to="/contact"
                    className={`btn btn-ghost justify-start ${
                      location.pathname === '/contact' ? 'bg-base-200' : ''
                    }`}
                    onClick={closeDrawer}
                  >
                    Contact
                  </Link>
                </div>

                <div className="divider"></div>

                {authUser ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-2 bg-base-200 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User2 className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium">{authUser.fullName}</p>
                        <p className="text-xs text-gray-500">{authUser.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleProfile}
                      className="btn btn-ghost w-full justify-start"
                    >
                      Profile
                    </button>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="btn btn-ghost w-full justify-start"
                        onClick={closeDrawer}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogOut}
                      className="btn btn-ghost w-full justify-start text-error"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="btn btn-primary w-full rounded-full"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full md:w-96 bg-base-100 z-50 shadow-xl overflow-y-auto"
            >
              <div className="p-4 flex justify-between items-center border-b sticky top-0 bg-base-100 z-10">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">Filters</h2>
                  {hasActiveFilters && (
                    <span className="badge badge-primary badge-sm">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="btn btn-ghost btn-circle btn-sm"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Search Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Search</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by address, city..."
                      className="input input-bordered w-full pr-10"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onKeyPress={handleSearchKeyPress}
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Price Range</span>
                    <span className="label-text-alt text-primary font-medium">
                      {formatPrice(values[0])} - {formatPrice(values[1])}
                    </span>
                  </label>
                  <Range
                    step={SLIDER_STEP}
                    min={SLIDER_MIN}
                    max={SLIDER_MAX}
                    values={values}
                    onChange={(values) => setValues(values)}
                    renderTrack={({ props, children }) => (
                      <div
                        {...props}
                        className="h-2 w-full bg-base-200 rounded-full"
                      >
                        <div
                          ref={props.ref}
                          className="h-full bg-primary rounded-full"
                          style={{
                            background: `linear-gradient(to right, 
                              #e5e7eb ${((values[0] - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%, 
                              var(--p) ${((values[0] - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%, 
                              var(--p) ${((values[1] - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%, 
                              #e5e7eb ${((values[1] - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%)`
                          }}
                        >
                          {children}
                        </div>
                      </div>
                    )}
                    renderThumb={({ props }) => (
                      <div
                        {...props}
                        className="h-5 w-5 bg-white border-2 border-primary rounded-full shadow-md focus:outline-none"
                      />
                    )}
                  />
                </div>

                {/* Property Type */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Property Type</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleSelectPropertyType(type)}
                        className={`btn btn-sm rounded-full ${
                          selectedPropertyType.includes(type)
                            ? 'btn-primary'
                            : 'btn-outline'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Bedrooms</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {bedroomOptions.map((beds) => (
                      <button
                        key={beds}
                        onClick={() => toggleSelectBedrooms(beds)}
                        className={`btn btn-sm rounded-full ${
                          selectedBedrooms.includes(beds)
                            ? 'btn-primary'
                            : 'btn-outline'
                        }`}
                      >
                        {beds} Beds
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 space-y-3">
                  <button
                    onClick={handleSearch}
                    className="btn btn-primary w-full rounded-full"
                  >
                    Apply Filters
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="btn btn-ghost w-full rounded-full text-error"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MergedNavbar;
