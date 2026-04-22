import { Link } from 'react-router-dom';
import { ArrowUpRight, Bed, Bath, Square, MapPin, Heart } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { useFavoriteStore } from '../store/useFavoriteStore';
import { useUserAuthStore } from '../store/useUserAuthStore';

const PropertyCard = ({
  id,
  image,
  title,
  address,
  bedrooms,
  bathrooms,
  sqft,
  price,
  type,
  link = '#',
}) => {
  const { isFavorited, toggleFavorite } = useFavoriteStore();
  const { authUser } = useUserAuthStore();
  const favorited = authUser ? isFavorited(id) : false;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authUser) return;
    toggleFavorite(id);
  };

  return (
    <Link to={link} className="card rounded-none w-full bg-base-100 min-w-70 shadow-lg my-4 hover:shadow-xl transition-shadow duration-300">
      <figure className="relative">
        <img src={image} alt={title} className="w-full h-60 object-cover" />
        <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 text-xs font-bold rounded">
          {type}
        </div>
        {authUser && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 left-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`size-5 transition-colors ${favorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>
        )}
      </figure>
      <div className="px-5 py-4">
        <h2 className="card-title text-lg font-bold truncate">{title}</h2>
        <div className="flex items-center text-gray-600 text-sm mt-1 mb-3">
          <MapPin className="size-4 mr-1" />
          <p className="truncate">{address}</p>
        </div>

        {/* Info Grid */}
        <div className="flex w-full justify-between items-center my-4 text-sm text-gray-700">
          <div className="flex items-center">
            <Bed className="mr-2 size-4" />
            <span>{bedrooms} Beds</span>
          </div>
          <div className="flex items-center">
            <Bath className="mr-2 size-4" />
            <span>{bathrooms} Baths</span>
          </div>
          <div className="flex items-center">
            <Square className="mr-2 size-4" />
            <span>{sqft} sqft</span>
          </div>
        </div>

        {/* Price + Link */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <h1 className="font-bold text-xl text-primary">{formatPrice(price)}</h1>
          {/* <div className="flex items-center text-primary font-semibold text-sm">
            View Details
            <ArrowUpRight className="size-4 ml-1" />
          </div> */}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
