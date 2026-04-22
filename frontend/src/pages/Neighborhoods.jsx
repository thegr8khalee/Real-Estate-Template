import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowRight, ArrowUpRight, MapPin } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const Neighborhoods = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const navigate = useNavigate();

  const selectCity = (city) => {
    navigate('/listings', { state: { city } });
  };

  const neighborhoods = [
    {
      name: 'Ikoyi',
      slug: 'Ikoyi',
      category: 'luxury',
      properties: 62,
      description: 'Old-money Lagos address with embassies, fine dining and waterfront estates.',
    },
    {
      name: 'Victoria Island',
      slug: 'Victoria Island',
      category: 'urban',
      properties: 58,
      description: 'Lagos business district with high-rise apartments and corporate headquarters.',
    },
    {
      name: 'Lekki Phase 1',
      slug: 'Lekki Phase 1',
      category: 'luxury',
      properties: 84,
      description: 'Premium gated estates, modern duplexes and vibrant lifestyle along the Lekki-Epe corridor.',
    },
    {
      name: 'Ikeja GRA',
      slug: 'Ikeja GRA',
      category: 'urban',
      properties: 47,
      description: 'Leafy streets in Lagos mainland with easy access to the airport and business hubs.',
    },
    {
      name: 'Yaba',
      slug: 'Yaba',
      category: 'urban',
      properties: 39,
      description: 'Lagos tech hub with student-friendly apartments and fast-growing commercial activity.',
    },
    {
      name: 'Ibeju-Lekki',
      slug: 'Ibeju-Lekki',
      category: 'coastal',
      properties: 71,
      description: 'Fast-appreciating coastal corridor near the Dangote Refinery and Lekki Free Trade Zone.',
    },
    {
      name: 'Ajah',
      slug: 'Ajah',
      category: 'suburban',
      properties: 54,
      description: 'Affordable and family-friendly estates along the Lekki-Epe expressway.',
    },
    {
      name: 'Maitama',
      slug: 'Maitama',
      category: 'luxury',
      properties: 48,
      description: 'Abuja’s most prestigious district with diplomatic residences and luxury duplexes.',
    },
    {
      name: 'Asokoro',
      slug: 'Asokoro',
      category: 'luxury',
      properties: 36,
      description: 'Quiet Abuja neighborhood hosting ministers, embassies and serene private estates.',
    },
    {
      name: 'Wuse 2',
      slug: 'Wuse 2',
      category: 'urban',
      properties: 43,
      description: 'Bustling Abuja commercial district with modern apartments and shopping.',
    },
    {
      name: 'Gwarinpa',
      slug: 'Gwarinpa',
      category: 'suburban',
      properties: 61,
      description: 'One of West Africa’s largest housing estates — spacious homes and family living.',
    },
    {
      name: 'Port Harcourt GRA',
      slug: 'Port Harcourt GRA',
      category: 'luxury',
      properties: 29,
      description: 'Old GRA in Port Harcourt: mature trees, generous plots and oil-industry pedigree.',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Areas' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'urban', label: 'Urban' },
    { id: 'coastal', label: 'Coastal' },
    { id: 'suburban', label: 'Suburban' },
  ];

  const filteredNeighborhoods = neighborhoods.filter((hood) => {
    const matchesSearch = hood.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || hood.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-gray-50 to-white pt-26">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-4 text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6">
            Explore Top Neighborhoods
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the perfect location for your next home in our most popular areas.
          </p>
        </motion.div>
      </section>

      {/* Search and Filter Section */}
      <section className="w-full py-8 sticky top-20 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search neighborhoods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 w-full md:w-auto no-scrollbar">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Neighborhoods Grid */}
      <section className="w-full py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNeighborhoods.map((hood, index) => (
              <motion.div
                key={hood.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => selectCity(hood.name)}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <MapPin className="w-6 h-6 text-primary group-hover:text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 group-hover:text-primary transition-colors">
                      <span className="text-sm font-medium">View Properties</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {hood.name}
                  </h3>
                  <p className="text-gray-600 mb-4 flex-grow">
                    {hood.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {hood.category}
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {hood.properties} Listings
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredNeighborhoods.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No neighborhoods found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Neighborhoods;
