import React from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryCard from '../components/CategoryCard';
import { motion } from 'framer-motion';
import {
  Home,
  Building,
  Building2,
  LandPlot,
  Store,
} from 'lucide-react';

const Categories = () => {
  const navigate = useNavigate();

  const selectCategory = (type) => {
    navigate('/listings', { state: { type } });
  };

  const categories = [
    {
      name: 'House',
      slug: 'House',
      icon: Home,
      description: 'Find your dream home for you and your family',
    },
    {
      name: 'Apartment',
      slug: 'Apartment',
      icon: Building,
      description: 'Modern apartments in the heart of the city',
    },
    {
      name: 'Condo',
      slug: 'Condo',
      icon: Building2,
      description: 'Luxury condos with premium amenities',
    },
    {
      name: 'Land',
      slug: 'Land',
      icon: LandPlot,
      description: 'Build your own legacy on our prime lots',
    },
    {
      name: 'Commercial',
      slug: 'Commercial',
      icon: Store,
      description: 'Spaces for your business to grow',
    },
  ];

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
            Explore Our Property Categories
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect property that fits your lifestyle from our diverse
            range of categories.
          </p>
        </motion.div>
      </section>

      {/* Categories Grid */}
      <section className="w-full py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.button
                onClick={() => selectCategory(category.slug)}
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className=""
              >
                <CategoryCard label={category.name} icon={category.icon} />
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Categories;
