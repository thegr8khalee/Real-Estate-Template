import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Star,
  Home as HomeIcon,
  Building,
  Building2,
  LandPlot,
  Store,
  Search,
  MapPin,
  Shield,
  Handshake,
  TrendingUp,
  Clock,
  Phone,
  Mail,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import BlogCard from '../components/BlogCard';
import {
  heroSlides,
  sell,
  calc,
  ctaBg,
  house,
  apartment,
  villa,
  commercial,
  condo,
  land,
} from '../config/images';
import { usePropertyStore } from '../store/usePropertyStore';
import { useBlogStore } from '../store/useBlogStore';
import { useInteractStore } from '../store/useInteractStore';
import toast from 'react-hot-toast';
import branding from '../config/branding';
import { formatPrice } from '../lib/utils';

const Home = () => {
  const { properties, isLoading, getProperties } = usePropertyStore();
  const { blogs, fetchBlogs, isLoading: isLoadingBlogs } = useBlogStore();
  const { reviews, getAllReviews, isFetchingReviews } = useInteractStore();

  // Hero slideshow
  const [heroIndex, setHeroIndex] = useState(0);

  // Quick search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStatus, setSearchStatus] = useState('For Sale');

  // Mortgage calculator
  const [formData, setFormData] = useState({
    propertyPrice: '',
    term: '',
    downPayment: '',
  });
  const [monthlyPayment, setMonthlyPayment] = useState(null);

  // Reviews carousel
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    getProperties();
    fetchBlogs();
    getAllReviews();
  }, [getProperties, fetchBlogs, getAllReviews]);

  // Auto-advance hero slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const selectType = (type) => {
    navigate('/listings', { state: { type } });
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    navigate('/listings', {
      state: { query: searchQuery, status: searchStatus },
    });
  };

  const calculateInstallment = () => {
    if (!formData.propertyPrice || !formData.term || !formData.downPayment) {
      toast.error('Please fill in all fields');
      return;
    }
    const price = parseFloat(formData.propertyPrice);
    const down = parseFloat(formData.downPayment);
    const years = parseFloat(formData.term);

    if (price <= 0 || down < 0 || years <= 0) {
      toast.error('Please enter valid positive numbers');
      return;
    }
    if (down >= price) {
      toast.error('Down payment must be less than property price');
      return;
    }

    const loanAmount = price - down;
    const rate = (branding.currency?.mortgageDefaults?.interestRate || 5) / 100;
    const monthlyRate = rate / 12;
    const n = years * 12;

    const monthly =
      monthlyRate === 0
        ? loanAmount / n
        : (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
          (Math.pow(1 + monthlyRate, n) - 1);
    setMonthlyPayment(monthly);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? reviews.reviews.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === reviews.reviews.length - 1 ? 0 : prev + 1
    );
  };

  const propertyTypes = [
    { label: 'House', icon: HomeIcon, image: house },
    { label: 'Apartment', icon: Building, image: apartment },
    { label: 'Condo', icon: Building2, image: condo },
    { label: 'Land', icon: LandPlot, image: land },
    { label: 'Commercial', icon: Store, image: commercial },
    { label: 'Villa', icon: Building2, image: villa },
  ];

  const stats = [
    { value: '500+', label: 'Properties Listed' },
    { value: '1,200+', label: 'Happy Clients' },
    { value: '10+', label: 'Years Experience' },
    { value: '98%', label: 'Client Satisfaction' },
  ];

  const whyUs = [
    {
      icon: Shield,
      title: 'Trusted & Verified',
      desc: 'Every property is verified by our expert team before listing.',
    },
    {
      icon: TrendingUp,
      title: 'Best Market Value',
      desc: 'Get competitive pricing with transparent market analysis.',
    },
    {
      icon: Handshake,
      title: 'Expert Guidance',
      desc: 'Our experienced agents guide you through every step.',
    },
    {
      icon: Clock,
      title: 'Fast Process',
      desc: 'Streamlined buying and selling with minimal paperwork.',
    },
  ];

  return (
    <div className="bg-base-100" style={{ scrollbarWidth: 'none' }}>
      <SEO
        title="Home"
        description={`${branding.company.name} â€” ${branding.company.tagline}. Browse premium properties for sale and rent.`}
      />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO SECTION
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
        {/* Slideshow Background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img
              src={heroSlides[heroIndex]}
              alt="Featured property"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-4xl"
          >
            <span className="inline-block px-4 py-1.5 bg-primary/20 backdrop-blur-sm text-primary border border-primary/30 rounded-full text-sm font-medium mb-6">
              {branding.company.tagline}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Find Your Perfect
              <span className="text-primary"> Home</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
              Discover exceptional properties tailored to your lifestyle. From
              cozy apartments to luxury estates, your dream home awaits.
            </p>

            {/* Quick Search Bar */}
            <form
              onSubmit={handleQuickSearch}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 max-w-3xl mx-auto"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Status Toggle */}
                <div className="flex bg-white/10 rounded-xl p-1">
                  {['For Sale', 'For Rent'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSearchStatus(status)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        searchStatus === status
                          ? 'bg-primary text-white shadow-lg'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="flex-1 flex items-center bg-white/10 rounded-xl px-4">
                  <MapPin className="size-5 text-white/50 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by city, neighborhood, or postal code..."
                    className="w-full bg-transparent text-white placeholder:text-white/50 px-3 py-2.5 focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="btn btn-primary rounded-xl px-8 h-12"
                >
                  <Search className="size-5 mr-2" />
                  Search
                </button>
              </div>
            </form>
          </motion.div>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 flex gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === heroIndex ? 'w-8 bg-primary' : 'w-4 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          STATS BAR
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="bg-secondary py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-white/70 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PROPERTY TYPES
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-primary font-semibold text-sm mb-1">
                BROWSE BY TYPE
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-base-content">
                Explore Property Types
              </h2>
            </div>
            <button
              onClick={() => navigate('/categories')}
              className="hidden sm:flex btn btn-outline btn-primary rounded-full"
            >
              View All <ArrowUpRight className="size-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {propertyTypes.map((type, i) => (
              <motion.div
                key={type.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-[3/4] shadow-md hover:shadow-xl transition-all duration-300"
                onClick={() => selectType(type.label)}
              >
                <img
                  src={type.image}
                  alt={type.label}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <type.icon className="size-8 text-primary mb-2" />
                  <h3 className="text-white font-semibold text-lg">
                    {type.label}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex justify-center sm:hidden">
            <button
              onClick={() => navigate('/categories')}
              className="btn btn-outline btn-primary rounded-full"
            >
              View All Categories <ArrowUpRight className="size-4 ml-1" />
            </button>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FEATURED PROPERTIES
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-16 px-4 bg-base-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-primary font-semibold text-sm mb-1">
                CURATED FOR YOU
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-base-content">
                Featured Properties
              </h2>
            </div>
            <button
              onClick={() => navigate('/listings')}
              className="hidden sm:flex btn btn-primary rounded-full"
            >
              View All <ArrowUpRight className="size-4 ml-1" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : properties?.length === 0 ? (
            <p className="text-center text-base-content/60 py-12">
              No properties available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties?.slice(0, 8).map((property, i) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PropertyCard
                    id={property.id}
                    image={property.imageUrls?.[0]}
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
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-center sm:hidden">
            <button
              onClick={() => navigate('/listings')}
              className="btn btn-primary rounded-full"
            >
              Browse All Properties
            </button>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          WHY CHOOSE US
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold text-sm mb-1">
              WHY CHOOSE US
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-base-content">
              Your Trusted Real Estate Partner
            </h2>
            <p className="text-base-content/60 mt-3 max-w-2xl mx-auto">
              We combine expertise, integrity, and technology to deliver an
              unmatched property experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-base-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-base-200 text-center group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="size-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-base-content mb-2">
                  {item.title}
                </h3>
                <p className="text-base-content/60 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CTA â€” SELL YOUR PROPERTY
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {branding.features.sell && (
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2"
              >
                <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
                  <img
                    src={sell}
                    alt="Sell your property"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2"
              >
                <p className="text-primary font-semibold text-sm mb-2">
                  SELL WITH CONFIDENCE
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-base-content mb-4">
                  Get A Fair Price For Your Property
                </h2>
                <p className="text-base-content/60 mb-6">
                  Skip the hassle of traditional selling. Our streamlined process
                  ensures you get top value with minimal stress.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    'Free professional property valuation',
                    'Transparent process with no hidden fees',
                    'Trusted by thousands of property owners',
                    'Dedicated support from listing to closing',
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <CircleCheck className="size-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-base-content/80">{point}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/sell/form')}
                    className="btn btn-primary rounded-full px-8"
                  >
                    Sell Now <ArrowRight className="size-4 ml-1" />
                  </button>
                  <button
                    onClick={() => navigate('/sell')}
                    className="btn btn-outline rounded-full px-8"
                  >
                    Learn More
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CTA BANNER â€” SCHEDULE A VISIT
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section
        className="relative py-24 px-4"
        style={{
          backgroundImage: `url(${ctaBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-secondary/80" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Schedule a private showing or speak with one of our property
              experts. We&apos;re here to make your real estate journey seamless.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate('/listings')}
                className="btn btn-primary btn-lg rounded-full px-10"
              >
                Browse Properties
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="btn btn-outline btn-lg rounded-full px-10 text-white border-white/50 hover:bg-white hover:text-secondary"
              >
                <Phone className="size-5 mr-2" /> Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CLIENT REVIEWS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {branding.features.reviews &&
        reviews &&
        !isFetchingReviews &&
        reviews.reviews &&
        reviews.reviews.length > 0 && (
          <section className="py-16 px-4 bg-base-200">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-10 items-start">
                {/* Left â€” Summary */}
                <div className="lg:w-1/3">
                  <p className="text-primary font-semibold text-sm mb-1">
                    TESTIMONIALS
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-bold text-base-content mb-4">
                    What Our Clients Say
                  </h2>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`size-6 stroke-0 ${
                          reviews.averageRatings >= star
                            ? 'fill-primary'
                            : 'fill-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-base-content/60">
                    <span className="font-bold text-base-content">
                      {reviews.averageRatings}
                    </span>{' '}
                    average from{' '}
                    <span className="font-bold text-base-content">
                      {reviews.totalItems}
                    </span>{' '}
                    reviews
                  </p>
                </div>

                {/* Right â€” Review Card */}
                <div className="lg:w-2/3 w-full">
                  <div className="bg-base-100 rounded-2xl p-8 shadow-sm relative">
                    <div className="text-5xl text-primary/20 absolute top-4 left-6 font-serif">
                      &ldquo;
                    </div>
                    <p className="text-base-content/80 text-lg italic mt-6 mb-6">
                      {reviews.reviews[currentIndex]?.content}
                    </p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="font-bold text-base-content">
                          {reviews.reviews[currentIndex]?.name}
                        </p>
                        <p className="text-sm text-base-content/50">
                          {reviews.reviews[currentIndex]?.property?.title}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handlePrev}
                          className="btn btn-circle btn-sm btn-outline"
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                        <button
                          onClick={handleNext}
                          className="btn btn-circle btn-sm btn-primary"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MORTGAGE CALCULATOR
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {branding.features.mortgageCalculator && (
        <section className="relative py-20 px-4 overflow-hidden">
          <img
            src={calc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 max-w-7xl mx-auto flex justify-end">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-lg shadow-2xl"
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                Mortgage Calculator
              </h2>
              <p className="text-base-content/60 text-sm mb-6">
                Estimate your monthly payments in seconds.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-base-content/70 mb-1 block">
                    Property Price ({branding.currency?.symbol || '$'})
                  </label>
                  <input
                    type="number"
                    value={formData.propertyPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, propertyPrice: e.target.value })
                    }
                    className="input input-bordered w-full rounded-xl"
                    placeholder="e.g. 50,000,000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-base-content/70 mb-1 block">
                      Loan Term (years)
                    </label>
                    <input
                      type="number"
                      value={formData.term}
                      onChange={(e) =>
                        setFormData({ ...formData, term: e.target.value })
                      }
                      className="input input-bordered w-full rounded-xl"
                      placeholder="e.g. 20"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-base-content/70 mb-1 block">
                      Down Payment ({branding.currency?.symbol || '$'})
                    </label>
                    <input
                      type="number"
                      value={formData.downPayment}
                      onChange={(e) =>
                        setFormData({ ...formData, downPayment: e.target.value })
                      }
                      className="input input-bordered w-full rounded-xl"
                      placeholder="e.g. 10,000,000"
                    />
                  </div>
                </div>

                {monthlyPayment !== null && (
                  <div className="bg-primary/10 rounded-2xl p-4 mt-2">
                    <p className="text-sm text-base-content/60">
                      Estimated Monthly Payment
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {formatPrice(monthlyPayment)}
                    </p>
                    <p className="text-xs text-base-content/50 mt-1">
                      {formData.term} years at{' '}
                      {branding.currency?.mortgageDefaults?.interestRate || 5}%
                      annual interest
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={calculateInstallment}
                  className="btn btn-primary w-full rounded-full h-12 text-base"
                >
                  Calculate
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          RECENT BLOGS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {branding.features.blog && blogs.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-primary font-semibold text-sm mb-1">
                  FROM OUR BLOG
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-base-content">
                  Latest Real Estate Insights
                </h2>
              </div>
              <button
                onClick={() => navigate('/blogs')}
                className="hidden sm:flex btn btn-outline btn-primary rounded-full"
              >
                All Articles <ArrowUpRight className="size-4 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {blogs.slice(0, 4).map((blog) => (
                <BlogCard
                  key={blog.id}
                  publisher={blog.publisher}
                  date={blog.date}
                  title={blog.title}
                  tagline={blog.tagline}
                  image={blog.featuredImage}
                  link={`/blog/${blog.id}`}
                />
              ))}
            </div>

            <div className="mt-6 flex justify-center sm:hidden">
              <button
                onClick={() => navigate('/blogs')}
                className="btn btn-outline btn-primary rounded-full"
              >
                View All <ArrowUpRight className="size-4 ml-1" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          NEWSLETTER CTA
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {branding.features.newsletter && (
        <section className="bg-secondary py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Mail className="size-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Stay Updated on New Listings
            </h2>
            <p className="text-white/60 mb-8">
              Subscribe to get notified about new properties, market insights,
              and exclusive deals.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success('Subscribed successfully!');
              }}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="input input-bordered flex-1 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/40"
                required
              />
              <button
                type="submit"
                className="btn btn-primary rounded-full px-8"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
