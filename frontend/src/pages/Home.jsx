import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Range } from 'react-range';
import { FaCheckCircle } from 'react-icons/fa';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  FilterIcon,
  MailIcon,
  Star,
  Home as HomeIcon,
  Building,
  Building2,
  LandPlot,
  Store,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import TeamCard from '../components/TeamCard';
import BlogCard from '../components/BlogCard';
import {
  Hero,
  Heromobile,
  calc,
  ceo,
  discount,
  price,
  sell,
  service,
  trusted,
} from '../config/images';
// import CarSearchBar from '../components/Searchbar';
import { usePropertyStore } from '../store/usePropertyStore';
import { useBlogStore } from '../store/useBlogStore';
import { useInteractStore } from '../store/useInteractStore';
import toast from 'react-hot-toast';
import branding from '../config/branding';
import CategoryCard from '../components/CategoryCard';
import { Datepicker } from 'flowbite-react';
import Blog from '../components/Blog';

const Home = () => {
  const [isFocusedPropertyPrice, setIsFocusedPropertyPrice] = useState(false);
  const [isFocusedTerm, setIsFocusedTerm] = useState(false);
  const [isFocusedDownPayment, setIsFocusedDownPayment] = useState(false);
  const { properties, isLoading, getProperties } = usePropertyStore();
  const { blogs, fetchBlogs, isLoading: isLoadingBlogs } = useBlogStore();
  const { reviews, getAllReviews, isFetchingReviews } = useInteractStore();
  const [formData, setFormData] = useState({
    propertyPrice: '',
    term: '',
    downPayment: '',
  });

  const [monthlyPayment, setMonthlyPayment] = useState(null);

  const calculateInstallment = () => {
    // Validate all required fields are filled
    if (!formData.propertyPrice || !formData.term || !formData.downPayment) {
      toast.error('Please fill in all fields');
      return;
    }

    const price = parseFloat(formData.propertyPrice);
    const down = parseFloat(formData.downPayment);
    const years = parseFloat(formData.term);

    // Validate values are positive numbers
    if (price <= 0 || down < 0 || years <= 0) {
      toast.error('Please enter valid positive numbers');
      return;
    }

    // Check if down payment is not greater than property price
    if (down >= price) {
      toast.error('Down payment cannot be greater than or equal to property price');
      return;
    }

    // Calculate loan amount
    const loanAmount = price - down;

    // Typical interest rate (you can make this configurable)
    const annualInterestRate = 0.05; // 5% annual interest rate
    const monthlyInterestRate = annualInterestRate / 12;
    const numberOfPayments = years * 12;

    // Calculate monthly payment using the loan payment formula
    // M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
    let monthly;

    if (monthlyInterestRate === 0) {
      // If no interest, simple division
      monthly = loanAmount / numberOfPayments;
    } else {
      const x = Math.pow(1 + monthlyInterestRate, numberOfPayments);
      monthly = (loanAmount * (monthlyInterestRate * x)) / (x - 1);
    }

    setMonthlyPayment(monthly);
  };

  useEffect(() => {
    getProperties();
    fetchBlogs();
    getAllReviews();
  }, [getProperties, fetchBlogs, getAllReviews]);

  // console.log(reviews);

  const selectType = (type) => {
    navigate('/listings', { state: { type } });
  };

  const selectCity = (city) => {
    navigate('/listings', { state: { city } });
  };

  const [activeTab, setActiveTab] = useState('Latest');

  const tabs = ['Latest Properties', 'Featured Properties', 'Popular Properties'];

  const navigate = useNavigate();

  const handleListingsClick = () => {
    navigate('/listings');
  };

  const propertyTypes = [
    { label: 'House', icon: HomeIcon },
    { label: 'Apartment', icon: Building },
    { label: 'Condo', icon: Building2 },
    { label: 'Land', icon: LandPlot },
    { label: 'Commercial', icon: Store },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

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

  // const review = reviews?.reviews[currentIndex];

  console.log(blogs);

  return (
    <div className="bg-base-200" style={{ scrollbarWidth: 'none' }}>
      <div id="mobile view" className="">
        <section
          id="hero"
          className="relative lg:hidden w-full h-screen bg-cover bg-center flex flex-col justify-between p-4"
          style={{ backgroundImage: `url(${Heromobile})` }}
        >
          {/* Middle Content */}
          <div className="relative pt-25 z-10 text-white text-left">
            <h1 className="text-2xl font-medium font-inter drop-shadow-lg">
              Luxury Villa
            </h1>
            <h1 className="text-5xl font-bold font-inter drop-shadow-lg">
              Beverly Hills
            </h1>
            <p className="text-xs mt-2 max-w-xs">
              Experience the pinnacle of luxury living. Unmatched
              elegance, breathtaking views, and pure comfort.
            </p>
          </div>

          {/* Bottom Content */}
          <div className="relative z-10 w-full">
            <div className="bg-white/3 backdrop-blur-sm rounded-none p-1 flex justify-around items-center text-white text-xs mb-2">
              <div className="flex items-center space-x-2 p-2">
                {/* <img src={mileage} alt="mileage" className="w-5 h-5 invert" /> */}
                <span className="text-lg">5 Beds</span>
              </div>
              <div className="flex items-center space-x-2 p-2">
                {/* <img
                  src={transmission}
                  alt="transmission"
                  className="w-5 h-5 invert"
                /> */}
                <span className="text-lg">6 Baths</span>
              </div>
              <div className="flex items-center space-x-2 p-2">
                {/* <img src={gas} alt="fuel" className="w-5 h-5 invert" /> */}
                <span className="text-lg">5000 sqft</span>
              </div>
            </div>
            <div className="bg-white/3 backdrop-blur-sm rounded-none p-3">
              <div className="flex justify-between items-center">
                <div className="text-white">
                  <span className="text-sm text-gray-400">Price</span>
                  <p className="font-bold text-2xl">$5.5M</p>
                </div>
                <div className="h-10 border-l border-white/50"></div>
                <div className="text-white text-center">
                  <span className="text-sm text-gray-400">Type</span>
                  <p className="font-bold text-lg">Villa</p>
                </div>
                <div className="h-10 border-l border-white/50"></div>
                <div className="text-white text-center">
                  <span className="text-sm text-gray-400">Status</span>
                  <p className="font-bold text-lg">For Sale</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 mt-3">
                <button className="btn btn-secondary sm:flex-1 rounded-none">
                  View Details
                </button>
                <button className="btn btn-primary sm:flex-1 rounded-none">
                  Browse Properties
                </button>
              </div>
            </div>
          </div>
        </section>
        <section
          id="desktop hero"
          className="relative hidden w-full h-screen bg-cover bg-center lg:flex flex-col justify-between p-12"
          style={{ backgroundImage: `url(${Heromobile})` }}
        >
          {/* Middle Content - Hero Text */}
          <div className="pt-25 relative z-10 w-full max-w-7xl mx-auto text-white">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-medium font-inter drop-shadow-lg">
                Luxury Villa
              </h2>
              <h1 className="text-7xl font-bold font-inter drop-shadow-lg">
                Beverly Hills
              </h1>
              <p className="text-base mt-4 max-w-lg">
                Experience the pinnacle of luxury living. Unmatched
                elegance, breathtaking views, and pure comfort await.
                Discover your dream home.
              </p>
            </div>
          </div>

          {/* Bottom Content - Details Card */}
          <div className="relative z-10 w-full max-w-7xl mx-auto">
            <div className="bg-white/2 backdrop-blur-sm rounded-none p-6 flex items-center justify-between">
              {/* Price */}
              <div className="text-white">
                <span className="text-sm text-gray-400">Price</span>
                <p className="font-bold text-4xl">$5.5M</p>
              </div>
              <div className="h-16 border-l border-white/30"></div>

              {/* Specs */}
              <div className="flex items-center space-x-8 text-white">
                <div className="flex items-center space-x-3">
                  <div>
                    <span className="text-xs text-gray-400">Bedrooms</span>
                    <p className="font-semibold text-lg">5 Beds</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div>
                    <span className="text-xs text-gray-400">Bathrooms</span>
                    <p className="font-semibold text-lg">6 Baths</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div>
                    <span className="text-xs text-gray-400">Area</span>
                    <p className="font-semibold text-lg">5000 sqft</p>
                  </div>
                </div>
              </div>
              <div className="h-16 border-l border-white/30"></div>

              {/* Buttons */}
              <div className="flex space-x-4">
                <button className="btn btn-secondary btn-lg rounded-none px-8">
                  View Details
                </button>
                <button className="btn btn-primary btn-lg rounded-none px-8">
                  Browse Properties
                </button>
              </div>
            </div>
          </div>
        </section>
        <section id="top categories" className="w-full max-w-7xl mx-auto py-8 px-4">
          <div className="flex justify-between items-end mb-4">
            <h1 className="text-3xl font-medium font-inter mb-2">Top Categories</h1>
            <button className="hidden sm:block btn btn-primary rounded-full">
              View all
            </button>
          </div>

          <div className="md:hidden grid grid-cols-2 gap-2">
            {propertyTypes.slice(0, 4).map((type) => (
              <div
                key={type.label}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => selectType(type.label)}
              >
                <type.icon className="w-10 h-10 text-primary mb-2" />
                <span className="text-sm font-medium">{type.label}</span>
              </div>
            ))}
          </div>
          <div
            className="hidden md:flex w-full overflow-x-auto flex-nowrap gap-4 snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none' }}
          >
            {propertyTypes.map((type) => (
              <div
                key={type.label}
                className="flex-shrink-0 w-40 flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => selectType(type.label)}
              >
                <type.icon className="w-12 h-12 text-primary mb-3" />
                <span className="text-base font-medium">{type.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 w-full flex justify-end">
            <button className="sm:hidden btn btn-primary rounded-full">
              View all
            </button>
          </div>
        </section>
        <section id="top listings" className="bg-gray-200 w-full py-12 pr-0">
          <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-medium font-inter mb-2">
              Top Listings
            </h1>
            <button
              className="btn hidden sm:block btn-primary rounded-full"
              onClick={handleListingsClick}
            >
              View All
            </button>
          </div>

          <div
            className="flex overflow-x-auto w-full max-w-7xl mx-auto space-x-2"
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="w-4"></div>
            {isLoading ? (
              <p>Loading properties...</p>
            ) : properties?.length === 0 ? (
              <p>No properties found</p>
            ) : (
              properties?.slice(0, 4).map((property) => (
                <PropertyCard
                  key={property.id}
                  className="flex-shrink-0"
                  image={property.imageUrls[0]}
                  title={property.title}
                  address={property.address}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  sqft={property.sqft}
                  price={property.price}
                  type={property.type}
                  link={`/property/${property.id}`}
                />
              ))
            )}
            <div className="w-4"></div>
          </div>
          <div className="mt-4 sm:hidden w-full max-w-7xl mx-auto flex justify-end pr-2">
            <button
              className="btn btn-primary rounded-full"
              onClick={handleListingsClick}
            >
              View All
            </button>
          </div>
        </section>
        <section
          id="form"
          className="w-full py-25 px-4 h-full"
          style={{
            backgroundImage: `url(${Hero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between items-center justify-center">
            <h1 className="text-5xl font-medium font-inter mb-2 text-white">
              Request VIP Showing
            </h1>
            <form
              action=""
              className="mt-4 md:mt-0 border border-white/50 max-w-md my-auto bg-white/10 p-4 py-6 backdrop-blur-sm"
            >
              <h1 className="text-2xl font-medium font-inter mb-2 text-white">
                Contact Information
              </h1>
              <input
                type="text"
                placeholder="Enter your name"
                className="input input-bordered border-white/50 rounded-none bg-transparent text-white  w-full mb-4"
              />
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered border-white/50 rounded-none bg-transparent text-white  w-full mb-4"
              />
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="input input-bordered border-white/50 rounded-none bg-transparent text-white placeholder:text-gray-400 w-full mb-4"
              />
              <input
                type="date"
                placeholder="Preferred Date"
                className="input input-bordered border-white/50 rounded-none bg-transparent text-white placeholder:text-gray-400 w-full mb-4"
              />
              <textarea
                placeholder="Enter your message"
                className="textarea textarea-bordered border-white/50 rounded-none bg-transparent text-white placeholder:text-gray-400 w-full mb-4"
              ></textarea>
              <button
                type="submit"
                className="btn btn-primary w-full rounded-none"
              >
                Submit
              </button>
            </form>
          </div>
        </section>
        <section
          id="Blogs"
          className="my-12 mx-auto w-full overflow-hidden flex flex-col justify-center items-center text-center border-none px-4 lg:px-12 pt-4 gap-6"
        >
          <div className="w-full flex justify-between items-center">
            <h1 className="text-3xl font-medium font-inter">Blog Posts</h1>
            <button
              className="btn hidden sm:block btn-primary rounded-full"
              onClick={handleListingsClick}
            >
              View All
            </button>
          </div>
          <div className="flex flex-col lg:flex-row lg:space-x-4 items-center justify-between w-full h-full ">
            {/* Image Section */}
            <div className="w-full lg:w-1/2 h-[240px] sm:h-[320px] lg:h-[400px] mb-4 rounded-none overflow-hidden shadow-sm">
              <img
                src={blogs[0]?.featuredImage}
                alt={blogs[0]?.title}
                className="w-full h-full object-cover rounded-none transition-transform duration-500 hover:scale-[1.02]"
              />
            </div>

            {/* Content Section */}
            <div className="flex flex-col justify-between w-full lg:w-1/2 space-y-5 text-start">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs sm:text-sm font-medium">
                    {blogs[0]?.category}
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm">
                    6 min read
                  </span>
                </div>

                <h1 className="text-2xl font-bold sm:google-headline-large">
                  {blogs[0]?.title}
                </h1>

                <p className="text-gray-600 text-sm sm:text-base mt-2 line-clamp-3">
                  {blogs[0]?.content}
                </p>
              </div>

              <div>
                <button
                  onClick={() => navigate(`/blog/${blogs[0].id}`)}
                  className="btn btn-primary  text-white px-5 py-2 rounded-full text-sm sm:text-base"
                >
                  Read Full Blog
                </button>
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
            style={{ scrollbarWidth: 'none' }}
          >
            {/* <div className="lg:hidden w-20"></div> */}
            {blogs.slice(1).map((blog) => (
              <Blog key={blog.title} item={{ ...blog }} />
            ))}
            {/* <div className="w-20"></div> */}
          </div>
        </section>
        
        <section
          id="Sell"
          className="relative w-full bg-black flex justify-center p-4"
        >
          <div className="flex items-center space-x-4 h-110  w-full max-w-6xl">
            <div className="relative w-[50vw] rounded-2xl">
              <img
                src={sell}
                alt="Sell"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div className="relative z-10 w-[50vw] px-4">
              <h1 className="text-white text-xl md:text-2xl lg:text-3xl font-bold font-inter">
                Get A Fair Price For Your Property, Sell To Us Today.
              </h1>
              <p className="text-white text-xs lg:text-sm font-inter mt-2">
                Skip the endless negotiations — we’ll value your property honestly
                and pay you on the spot.
              </p>
              <div className="flex flex-col space-y-2 mt-2 text-xs md:text-base">
                <div className="flex space-x-2 text-white">
                  <CircleCheck className="stroke-white mr-2" />
                  Fast and transparent process
                </div>
                <div className="flex space-x-2 text-white">
                  <CircleCheck className="stroke-white mr-2" />
                  Instant payment, no hidden fees
                </div>
                <div className="flex space-x-2 text-white">
                  <CircleCheck className="stroke-white mr-2" />
                  Trusted by thousands of property owners
                </div>
              </div>

              <div className="flex space-x-2 mt-4 w-full ">
                <button
                  onClick={() => navigate('/sell/form')}
                  className="flex-1 btn md:btn-lg btn-primary rounded-full font-medium w-full"
                >
                  Sell Now
                </button>
                <button
                  onClick={() => navigate('/sell')}
                  className="flex-1 btn md:btn-lg backdrop-blur-lg bg-secondary/30 border-none shadow-none text-white rounded-full font-medium"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
        <section id="listings" className="w-full p-4 pr-0">
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex w-full justify-between items-center">
              <h1 className="text-xl font-semibold font-inter mb-2">
                Explore All Properties
              </h1>
              <button
                className="btn btn-primary rounded-full"
                onClick={handleListingsClick}
              >
                View All
                <ArrowUpRight className="stroke-whitesize-5" />
              </button>
            </div>

            <div className="flex w-full justify-between">
              <div className="flex flex-shrink-0 space-x-8 border-gray-200"></div>
              <div className="w-full flex justify-end pr-2"></div>
            </div>

            <div className="flex overflow-x-auto w-full space-x-2 pl-1">
              {isLoading ? (
                <p>Loading properties...</p>
              ) : properties?.length === 0 ? (
                <p>No properties found</p>
              ) : (
                properties?.slice(0, 10).map((property) => (
                  <PropertyCard
                    key={property.id}
                    className="flex-shrink-0"
                    image={property.imageUrls[0]}
                    title={property.title}
                    address={property.address}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    sqft={property.sqft}
                    price={property.price}
                    type={property.type}
                    link={`/property/${property.id}`}
                  />
                ))
              )}
            </div>
          </div>
        </section>
        <section id="categories" className="w-full p-4 items-start justify-center">
          <div className="w-full max-w-6xl mx-auto">
            {/* <h6 className="text-primary font-inter">Top Categories</h6> */}
            <div className="flex w-full justify-between">
              <div>
                <h1 className="font-bold text-xl font-inter">
                  Explore Our Top Categories
                </h1>
              </div>
              <button
                onClick={() => navigate('/listings')}
                className="btn btn-primary rounded-full"
              >
                View All <ArrowUpRight className="size-5" />
              </button>
            </div>
            <div className="mt-2 flex overflow-x-auto w-full space-x-10">
              {propertyTypes.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className={`rounded-xl flex-shrink-0 p-2 flex flex-col justify-center items-center text-xs transition cursor-pointer`}
                  onClick={() => selectType(label)}
                >
                  <Icon className="w-20 h-20 text-primary mb-2" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          id="Why Choose Us"
          className="bg-secondary items-center justify-center py-12 flex px-4"
        >
          <div className="w-full max-w-6xl">
            <h1 className="font-bold text-white text-2xl font-inter">
              Why Choose Us?
            </h1>
            <div className="flex justify-between items-center text-center">
              <div className="flex flex-col space-y-2 items-center my-8  w-full">
                <img src={discount} alt="discount" className="size-15" />
                <h1 className="text-white font-medium">
                  Special Financing Offers
                </h1>
              </div>
              <div className="flex flex-col space-y-2 items-center my-8  w-full">
                <img src={trusted} alt="trusted" className="size-13" />
                <h1 className="text-white font-medium">Trusted by Thousands</h1>
              </div>
              <div className="flex flex-col space-y-2 items-center my-8  w-full">
                <img src={price} alt="price" className="size-13" />
                <h1 className="text-white font-medium">Competitive Pricing</h1>
              </div>
              <div className="flex flex-col space-y-2 items-center my-8  w-full">
                <img src={service} alt="service" className="size-13" />
                <h1 className="text-white font-medium">Expert Property Management</h1>
              </div>
            </div>

            <div className="flex justify-between items-center text-center">
              <div className="flex flex-col items-center w-full ">
                <h1 className="text-primary font-bold font-inter text-4xl">
                  100+
                </h1>
                <p className="text-white">Properties Sold</p>
              </div>
              <div className="flex flex-col items-center w-full ">
                <h1 className="text-primary font-bold font-inter text-4xl">
                  500+
                </h1>
                <p className="text-white">Happy Clients</p>
              </div>
              <div className="flex flex-col items-center w-full ">
                <h1 className="text-primary font-bold font-inter text-4xl">
                  10+
                </h1>
                <p className="text-white">Years Experience</p>
              </div>
              <div className="flex flex-col items-center w-full ">
                <h1 className="text-primary font-bold font-inter text-4xl">
                  50+
                </h1>
                <p className="text-white">Awards Won</p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="team"
          className="w-full p-4 py-8 items-center justify-center flex"
        >
          <div className=" w-full max-w-6xl">
            <h1 className="font-inter text-2xl font-bold my-4">
              Meet Our Team
            </h1>
            <div className="w-full flex space-x-4 overflow-x-auto">
              <TeamCard
                image={ceo}
                name={branding.company.ceo.name}
                title="CEO"
                description={branding.company.ceo.bio}
              />
              <TeamCard
                image={ceo}
                name="John Smith"
                title="CTO"
                description="Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
              />
              <TeamCard
                image={ceo}
                name="Alice Johnson"
                title="CFO"
                description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
              />
              <TeamCard
                image={ceo}
                name="Alice Johnson"
                title="CFO"
                description="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium."
              />
            </div>
          </div>
        </section>
        {branding.features.reviews &&
          reviews &&
          !isFetchingReviews &&
          reviews.reviews &&
          reviews.reviews.length > 0 && (
            <section
              id="review"
              className="w-full flex justify-center items-center p-4 py-12 bg-secondary font-inter"
            >
              <div className="w-full max-w-6xl mx-auto">
                <h1 className="font-bold text-white text-2xl">
                  What Our Clients Say
                </h1>

                <div className="flex space-x-2 my-1">
                  <Star
                    className={` stroke-0 size-8 ${
                      reviews?.averageRatings >= 1
                        ? 'fill-primary'
                        : 'fill-gray-300'
                    }`}
                  />
                  <Star
                    className={` stroke-0 size-8 ${
                      reviews?.averageRatings >= 2
                        ? 'fill-primary'
                        : 'fill-gray-300'
                    }`}
                  />
                  <Star
                    className={` stroke-0 size-8 ${
                      reviews?.averageRatings >= 3
                        ? 'fill-primary'
                        : 'fill-gray-300'
                    }`}
                  />
                  <Star
                    className={` stroke-0 size-8 ${
                      reviews?.averageRatings >= 4
                        ? 'fill-primary'
                        : 'fill-gray-300'
                    }`}
                  />
                  <Star
                    className={` stroke-0 size-8 ${
                      reviews?.averageRatings >= 5
                        ? 'fill-primary'
                        : 'fill-gray-300'
                    }`}
                  />
                </div>

                <p className="text-white mt-2">
                  <b>{reviews.averageRatings}</b> Based on{' '}
                  <b>{reviews.totalItems}</b> Reviews
                </p>

                <div className="mt-4 w-full">
                  {/* Header: Name + Nav Buttons */}
                  <div className="w-full flex justify-between items-center">
                    <div>
                      <h1 className="text-white text-lg">
                        {reviews.reviews[currentIndex]?.name}
                      </h1>
                      <p className="text-gray-400 text-sm">
                        {reviews.reviews[currentIndex]?.property?.title}
                      </p>
                    </div>

                    <div className="space-x-2 flex">
                      <button
                        onClick={handlePrev}
                        className="btn btn-primary btn-circle"
                      >
                        <ChevronLeft />
                      </button>
                      <button
                        onClick={handleNext}
                        className="btn btn-primary btn-circle"
                      >
                        <ChevronRight />
                      </button>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="mt-2">
                    <p className="text-white font-light text-sm">
                      {reviews.reviews[currentIndex]?.content}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}
        {branding.features.blog && (
          <section
            id="blogs"
            className="w-full flex justify-center items-center p-4 py-8"
          >
            <div className="w-full max-w-6xl">
              <div className="flex w-full justify-between items-center">
                <h1 className="font-inter text-2xl font-bold">Recent Blogs</h1>
                <div>
                  <button
                    onClick={() => navigate('/blogs')}
                    className="btn btn-primary rounded-full flex"
                  >
                    View All <ArrowUpRight />
                  </button>
                </div>
              </div>

              <div className="w-full flex space-x-4 overflow-x-auto ">
                {isLoadingBlogs ? (
                  <p>Loading...</p>
                ) : (
                  blogs
                    ?.slice(0, 10)
                    .map((blog) => (
                      <BlogCard
                        key={blog.id}
                        publisher={blog.publisher}
                        date={blog.date}
                        title={blog.title}
                        tagline={blog.tagline}
                        image={blog.featuredImage}
                        link={`/blog/${blog.id}`}
                      />
                    ))
                )}
              </div>
            </div>
          </section>
        )}
        {branding.features.mortgageCalculator && (
          <section id="Calc" className="relative w-full flex justify-end">
            <div className="flex items-center justify-center h-150 space-x-4  bg-black w-full">
              <img
                src={calc}
                alt="Sell"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="relative max-w-6xl  z-10 h-full w-full p-8 items-center flex justify-end">
                <div className="bg-white max-w-2xl shadow-lg rounded-3xl w-full p-8 items-center justify-center">
                  <h1 className="font-inter text-3xl font-bold">
                    Mortgage Calculator
                  </h1>
                  <p className="text-sm font-inter mt-1">
                    Use this calculator to estimate your monthly mortgage payments.
                  </p>
                  <form action="" className="my-2">
                    <div className="relative w-full">
                      <input
                        type="number"
                        value={formData.propertyPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            propertyPrice: e.target.value,
                          })
                        }
                        onFocus={() => setIsFocusedPropertyPrice(true)}
                        onBlur={() => setIsFocusedPropertyPrice(false)}
                        className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder=" " // Trick for floating label
                      />
                      <label
                        className={`absolute left-3 transition-all duration-300 
            ${
              isFocusedPropertyPrice || formData.propertyPrice
                ? 'text-xs top-2 text-gray-500'
                : 'text-gray-400 top-5 text-sm'
            } 
          `}
                      >
                        Property Price ($)
                      </label>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <div className="relative w-80">
                        <input
                          type="number"
                          value={formData.term}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              term: e.target.value,
                            })
                          }
                          onFocus={() => setIsFocusedTerm(true)}
                          onBlur={() => setIsFocusedTerm(false)}
                          className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder=" " // Trick for floating label
                        />
                        <label
                          className={`absolute left-3 transition-all duration-300 
            ${
              isFocusedTerm || formData.term
                ? 'text-xs top-2 text-gray-500'
                : 'text-gray-400 top-5 text-sm'
            } 
          `}
                        >
                          Loan Term (years)
                        </label>
                      </div>
                      <div className="relative w-80">
                        <input
                          type="number"
                          value={formData.downPayment}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              downPayment: e.target.value,
                            })
                          }
                          onFocus={() => setIsFocusedDownPayment(true)}
                          onBlur={() => setIsFocusedDownPayment(false)}
                          className="peer w-full px-3 pt-6 pb-2 text-lg font-medium border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder=" " // Trick for floating label
                        />
                        <label
                          className={`absolute left-3 transition-all duration-300 
            ${
              isFocusedDownPayment || formData.downPayment
                ? 'text-xs top-2 text-gray-500'
                : 'text-gray-400 top-5 text-sm'
            } 
          `}
                        >
                          Down Payment ($)
                        </label>
                      </div>
                    </div>
                    {monthlyPayment !== null && (
                      <div className="mt-6 p-4 bg-primary/10 rounded-2xl">
                        <p className="text-sm text-gray-600">
                          Estimated Monthly Payment
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          $
                          {monthlyPayment.toLocaleString('en-US', {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Based on {formData.term} years with{' '}
                          {(0.05 * 100).toFixed(1)}% annual interest
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={calculateInstallment}
                      className="w-full h-15 mt-2 text-white btn-primary btn-lg rounded-full"
                    >
                      Calculate
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
