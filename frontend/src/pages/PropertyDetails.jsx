import React, { useCallback, useState, useEffect } from 'react';
import {
  ArrowUpDown,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Phone,
  Share,
  Star,
  UserRound,
  X,
  Bed,
  Bath,
  Square,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { propertyPlaceholder } from '../config/images';
import PropertyCard from '../components/PropertyCard';
import { useNavigate, useParams } from 'react-router-dom';
import { usePropertyStore } from '../store/usePropertyStore';
import Review from '../components/Review';
import toast from 'react-hot-toast';
import { useInteractStore } from '../store/useInteractStore';
import { useUserAuthStore } from '../store/useUserAuthStore';
import { useInquiryStore } from '../store/useInquiryStore';
import { formatPrice } from '../lib/utils';
import branding from '../config/branding';
import SEO from '../components/SEO';

const PropertyDetails = () => {
  const { id } = useParams();
  const { propertyDetails: currentProperty, getPropertyById, isLoading } = usePropertyStore();
  const { authUser } = useUserAuthStore();
  const { submitInquiry, isSubmitting } = useInquiryStore();

  useEffect(() => {
    getPropertyById(id);
  }, [getPropertyById, id]);

  const property = currentProperty?.property;
  const reviews = currentProperty?.reviews || [];
  const averageRatings = currentProperty?.averageRatings || {
    location: 0,
    condition: 0,
    value: 0,
    amenities: 0,
    overall: 0,
  };

  const [activeTab, setActiveTab] = useState('overview');
  const tabs = ['overview', 'description', 'features'];
  const [tourFormData, setTourFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    message: '',
  });
  const [calcFormData, setCalcFormData] = useState({
    price: '',
    years: branding.currency?.mortgageDefaults?.termYears?.toString() || '25',
    downPayment: '',
    interestRate: branding.currency?.mortgageDefaults?.interestRate?.toString() || '5',
  });

  const handleTourChange = (e) => {
    const { name, value } = e.target;
    setTourFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleTourSubmit = async () => {
    if (!tourFormData.name || !tourFormData.email) {
      toast.error('Name and email are required');
      return;
    }
    const result = await submitInquiry({
      propertyId: id,
      name: tourFormData.name,
      email: tourFormData.email,
      phone: tourFormData.phone || undefined,
      type: 'tour',
      preferredDate: tourFormData.date || undefined,
      message: tourFormData.message || undefined,
    });
    if (result) {
      setTourFormData({ name: '', email: '', phone: '', date: '', message: '' });
    }
  };

  const handleCalcChange = (e) => {
    const { name, value } = e.target;
    setCalcFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const navigate = useNavigate();

  const handleListingsClick = () => {
    navigate('/listings');
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const images = property?.imageUrls || [];

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied to clipboard!');
    });
  };

  const getRatingStatus = (score) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Average';
    return 'Needs Improvement';
  };

  const propertyId = id;

  const Star1 = ({ filled, onClick }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? '#ff0000' : 'none'}
      stroke="#ff0000"
      strokeWidth="1.5"
      className="size-5 transition-transform duration-200 cursor-pointer text-yellow-400"
      onClick={onClick}
    >
      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.6l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.6l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );

  const { reviewProperty, updateReview } = useInteractStore();

  const [formData, setFormData] = useState({
    location: 0,
    condition: 0,
    value: 0,
    amenities: 0,
    content: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRatingChange = (category, rating) => {
    setFormData((prevData) => ({
      ...prevData,
      [category]: rating,
    }));
  };

  const handleContentChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      content: e.target.value,
    }));
  };

  const userReviewed = reviews.some((review) => review.userId === authUser?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authUser) {
      toast.error('You must be logged in to submit a review.');
      return;
    }
    if (userReviewed) {
      await updateReview(
        reviews.find((review) => review.userId === authUser?.id).id,
        formData
      );
      return;
    }
    setLoading(true);

    if (Object.values(formData).some((value) => value === 0)) {
      toast.error('Please provide a rating for all categories.');
      setLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Please write a review message.');
      setLoading(false);
      return;
    }

    try {
      const response = await reviewProperty(propertyId, formData);

      if (response) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to submit review.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareClick = () => {
    navigate(`/compare?property1=${id}`, {
      state: { propertyId: id },
    });
  };

  const handleDownloadBrochure = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const brochureHtml = `
      <div style="font-family: Arial, sans-serif; padding: 40px; max-width: 800px;">
        <h1 style="color: #333; margin-bottom: 8px;">${property.title}</h1>
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">${property.address}, ${property.city}, ${property.state} ${property.zipCode}</p>
        ${images[0] ? `<img src="${images[0]}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;" crossorigin="anonymous" />` : ''}
        <div style="display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
          <div style="background: #f3f4f6; padding: 12px 20px; border-radius: 8px; flex: 1; min-width: 120px;">
            <div style="font-size: 12px; color: #666;">Price</div>
            <div style="font-size: 18px; font-weight: bold;">${formatPrice(property.price)}</div>
          </div>
          ${property.bedrooms ? `<div style="background: #f3f4f6; padding: 12px 20px; border-radius: 8px; flex: 1; min-width: 120px;"><div style="font-size: 12px; color: #666;">Bedrooms</div><div style="font-size: 18px; font-weight: bold;">${property.bedrooms}</div></div>` : ''}
          ${property.bathrooms ? `<div style="background: #f3f4f6; padding: 12px 20px; border-radius: 8px; flex: 1; min-width: 120px;"><div style="font-size: 12px; color: #666;">Bathrooms</div><div style="font-size: 18px; font-weight: bold;">${property.bathrooms}</div></div>` : ''}
          ${property.sqft ? `<div style="background: #f3f4f6; padding: 12px 20px; border-radius: 8px; flex: 1; min-width: 120px;"><div style="font-size: 12px; color: #666;">Area</div><div style="font-size: 18px; font-weight: bold;">${Number(property.sqft).toLocaleString()} sqft</div></div>` : ''}
        </div>
        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; margin-bottom: 8px;">Description</h3>
          <p style="color: #555; line-height: 1.6; font-size: 14px;">${property.description}</p>
        </div>
        ${property.features?.length ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 8px;">Features</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${property.features.map(f => `<span style="background: #e5e7eb; padding: 4px 12px; border-radius: 16px; font-size: 13px;">${f}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999; text-align: center;">
          ${branding.company?.name || 'Real Estate'} &bull; Generated on ${new Date().toLocaleDateString()}
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = brochureHtml;
    document.body.appendChild(container);

    html2pdf()
      .set({
        margin: 0,
        filename: `${property.title.replace(/[^a-zA-Z0-9]/g, '_')}_brochure.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(container)
      .save()
      .then(() => {
        document.body.removeChild(container);
        toast.success('Brochure downloaded!');
      });
  };

  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [mortgageSummary, setMortgageSummary] = useState(null);

  const calculateMortgage = () => {
    if (!calcFormData.years || !calcFormData.downPayment || !calcFormData.interestRate) {
      toast.error('Please fill in all fields');
      return;
    }

    const price = parseFloat(property?.price);
    const down = parseFloat(calcFormData.downPayment);
    const years = parseFloat(calcFormData.years);
    const rate = parseFloat(calcFormData.interestRate);

    if (price <= 0 || down < 0 || years <= 0 || rate < 0) {
      toast.error('Please enter valid positive numbers');
      return;
    }

    if (down >= price) {
      toast.error('Down payment cannot be greater than or equal to property price');
      return;
    }

    const loanAmount = price - down;
    const annualInterestRate = rate / 100;
    const monthlyInterestRate = annualInterestRate / 12;
    const numberOfPayments = years * 12;

    let monthly;

    if (monthlyInterestRate === 0) {
      monthly = loanAmount / numberOfPayments;
    } else {
      const x = Math.pow(1 + monthlyInterestRate, numberOfPayments);
      monthly = (loanAmount * (monthlyInterestRate * x)) / (x - 1);
    }

    const totalPaid = monthly * numberOfPayments;
    const totalInterest = totalPaid - loanAmount;

    setMonthlyPayment(monthly);
    setMortgageSummary({
      loanAmount,
      totalPaid,
      totalInterest,
      numberOfPayments,
    });
  };

  const ratingCategories = ['Location', 'Condition', 'Value', 'Amenities'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Property not found.</p>
      </div>
    );
  }

  return (
    <div className="pt-20 font-inter bg-base-200">
      <SEO
        title={property?.title}
        description={property?.description?.slice(0, 160)}
        image={images[0]}
        type="article"
      />
      <div className="w-full max-w-7xl mx-auto px-4 mt-2">
        <section id="hero" className="grid grid-cols-1 md:grid-cols-2 mb-6 gap-8">
          {/* Image Gallery */}
          <div className="relative h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden mt-4 cursor-pointer" onClick={() => setLightboxOpen(true)}>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={images[currentIndex] || propertyPlaceholder}
                alt={property.title}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
            >
              <ChevronLeft className="size-6 text-gray-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
            >
              <ChevronRight className="size-6 text-gray-800" />
            </button>
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {/* Property Info */}
          <div className="mt-6 md:mt-0 flex flex-col justify-center">
            <button
              onClick={handleListingsClick}
              className="flex items-center text-gray-600 hover:text-primary transition-colors mb-4"
            >
              <ChevronLeft className="size-5 mr-1" />
              Back to Listings
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {property.title}
            </h1>
            <p className="text-xl text-gray-600 mb-4 flex items-center">
              <MapPin className="size-5 mr-2" />
              {property.address}, {property.city}
            </p>
            <div className="flex items-center mb-6">
              <span className="text-3xl font-bold text-primary mr-4">
                {formatPrice(property.price)}
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {property.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                <Bed className="size-6 text-primary mb-2" />
                <span className="text-sm text-gray-500">Bedrooms</span>
                <span className="font-semibold">{property.bedrooms}</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                <Bath className="size-6 text-primary mb-2" />
                <span className="text-sm text-gray-500">Bathrooms</span>
                <span className="font-semibold">{property.bathrooms}</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm">
                <Square className="size-6 text-primary mb-2" />
                <span className="text-sm text-gray-500">Sq Ft</span>
                <span className="font-semibold">{property.sqft}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center">
                <Phone className="size-5 mr-2" />
                Contact Agent
              </button>
              <button
                onClick={handleCompareClick}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <ArrowUpDown className="size-5 mr-2" />
                Compare
              </button>
              <button
                onClick={handleShare}
                className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share className="size-5 text-gray-600" />
              </button>
              <button
                onClick={handleDownloadBrochure}
                className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Download Brochure"
              >
                <Download className="size-5 text-gray-600" />
              </button>
            </div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="mb-12">
          <div className="flex border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-6 text-sm font-medium capitalize transition-colors relative ${
                  activeTab === tab
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Type</span>
                      <span className="font-medium">{property.type}</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Year Built</span>
                      <span className="font-medium">{property.yearBuilt}</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Lot Size</span>
                      <span className="font-medium">{property.lotSize} sqft</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-600">Parking</span>
                      <span className="font-medium">{property.parkingSpaces} Spaces</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.features && property.features.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'description' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {property.description}
                </p>
              </div>
            )}

            {activeTab === 'features' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Amenities & Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities && property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-gray-600">
                      <Check className="size-4 text-green-500 mr-2" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Schedule Tour & Mortgage Calculator */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Schedule Tour Form */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Schedule a Tour</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={tourFormData.name}
                  onChange={handleTourChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={tourFormData.email}
                  onChange={handleTourChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={tourFormData.phone}
                  onChange={handleTourChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={tourFormData.date}
                  onChange={handleTourChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  name="message"
                  value={tourFormData.message}
                  onChange={handleTourChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Any specific questions or preferences?"
                />
              </div>
              <button
                type="button"
                onClick={handleTourSubmit}
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Request Tour'}
              </button>
            </form>
          </div>

          {/* Mortgage Calculator */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Mortgage Calculator</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {branding.currency?.symbol || '$'}
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={property.price}
                    disabled
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Down Payment
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {branding.currency?.symbol || '$'}
                  </span>
                  <input
                    type="number"
                    name="downPayment"
                    value={calcFormData.downPayment}
                    onChange={handleCalcChange}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  name="interestRate"
                  value={calcFormData.interestRate}
                  onChange={handleCalcChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="5"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Term (Years)
                </label>
                <input
                  type="number"
                  name="years"
                  value={calcFormData.years}
                  onChange={handleCalcChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="30"
                />
              </div>
              <button
                onClick={calculateMortgage}
                className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Calculate Payment
              </button>
              {monthlyPayment && mortgageSummary && (
                <div className="mt-4 space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
                    <p className="text-sm text-green-800 mb-1">
                      Estimated Monthly Payment
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatPrice(monthlyPayment)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Loan Amount</p>
                      <p className="font-semibold">{formatPrice(mortgageSummary.loanAmount)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Total Interest</p>
                      <p className="font-semibold">{formatPrice(mortgageSummary.totalInterest)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Total Paid</p>
                      <p className="font-semibold">{formatPrice(mortgageSummary.totalPaid)}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Payments</p>
                      <p className="font-semibold">{mortgageSummary.numberOfPayments} months</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <div className="flex items-center mb-6">
              <div className="text-4xl font-bold text-gray-900 mr-4">
                {averageRatings.overall.toFixed(1)}
              </div>
              <div>
                <div className="flex text-yellow-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-5 ${
                        i < Math.round(averageRatings.overall)
                          ? 'fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Based on {reviews.length} reviews
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {ratingCategories.map((category) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-600">{category}</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${
                            (averageRatings[category.toLowerCase()] / 5) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="font-medium text-gray-900">
                      {averageRatings[category.toLowerCase()]?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Review Form */}
            {!userReviewed && (
              <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {ratingCategories.map((category) => (
                    <div key={category}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {category}
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star1
                            key={star}
                            filled={star <= formData[category.toLowerCase()]}
                            onClick={() =>
                              handleRatingChange(category.toLowerCase(), star)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={handleContentChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Share your experience..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-white py-2 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin size-5" />
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <Review key={review.id} review={review} />
            ))}
          </div>
        </section>

        {/* Similar Properties */}
        {currentProperty?.relatedProperties && currentProperty.relatedProperties.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProperty.relatedProperties.map((relatedProperty) => (
                <PropertyCard
                  key={relatedProperty.id}
                  id={relatedProperty.id}
                  image={
                    relatedProperty.imageUrls && relatedProperty.imageUrls.length > 0
                      ? relatedProperty.imageUrls[0]
                      : propertyPlaceholder
                  }
                  title={relatedProperty.title}
                  address={relatedProperty.address}
                  bedrooms={relatedProperty.bedrooms}
                  bathrooms={relatedProperty.bathrooms}
                  sqft={relatedProperty.sqft}
                  price={relatedProperty.price}
                  type={relatedProperty.type}
                  link={`/property/${relatedProperty.id}`}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Image Lightbox Modal */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
          >
            <X className="size-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full text-white z-50"
          >
            <ChevronLeft className="size-8" />
          </button>
          <img
            src={images[currentIndex]}
            alt={`${property.title} - Image ${currentIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full text-white z-50"
          >
            <ChevronRight className="size-8" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
          {/* Thumbnail strip */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt=""
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={`w-16 h-12 object-cover rounded cursor-pointer border-2 transition-all ${
                  idx === currentIndex ? 'border-white opacity-100' : 'border-transparent opacity-60 hover:opacity-80'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OverallRatingDisplay = ({ overallRating }) => {
  const size = 180;
  const strokeWidth = 10;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallRating / 5) * circumference;

  let strokeColor = '#9CA3AF';
  let textColor = 'text-gray-500';

  if (overallRating > 0) {
    if (overallRating >= 4) {
      strokeColor = '#ff0000';
      textColor = '#f0c710';
    } else if (overallRating >= 3) {
      strokeColor = '#ff0000';
      textColor = '#f0c710';
    } else {
      strokeColor = '#ff0000';
      textColor = '#f0c710';
    }
  }

  return (
    <div className="relative w-32 h-32 sm:w-44 sm:h-44 flex-shrink-0">
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          className="text-gray-200"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
        <span className={`text-3xl sm:text-4xl font-bold text-primary`}>
          {overallRating.toFixed(1)}
        </span>
        <span className="text-xs sm:text-sm font-medium text-primary">
          Out of 5.0
        </span>
      </div>
    </div>
  );
};

export default PropertyDetails;
