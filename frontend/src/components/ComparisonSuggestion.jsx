import { BedDouble, Bath, Maximize, Home } from 'lucide-react';

const PropertyCardSuggestion = ({
  image,
  title,
  description,
  sqft,
  bedrooms,
  bathrooms,
  type,
  price,
  link = '#',
}) => {
  return (
    <button 
    onClick={link}
    className="card rounded-2xl bg-base-100 min-w-70 shadow-lg my-4">
      <figure>
        <img src={image} alt={title} className="w-full h-40 object-cover" />
      </figure>
      <div className="px-5 py-4">
        <h2 className="card-title">{title}</h2>
        <p className="text-gray-600 text-sm truncate whitespace-nowrap overflow-hidden">
          {description}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 my-4 text-sm">
          <div className="flex items-center">
            <BedDouble className="mr-2 size-5 text-gray-500" />
            <span>{bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}</span>
          </div>
          <div className="flex items-center">
            <Bath className="mr-2 size-5 text-gray-500" />
            <span>{bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}</span>
          </div>
          <div className="flex items-center">
            <Maximize className="mr-2 size-5 text-gray-500" />
            <span>{sqft} sqft</span>
          </div>
          <div className="flex items-center">
            <Home className="mr-2 size-5 text-gray-500" />
            <span className="capitalize">{type}</span>
          </div>
        </div>

        <hr className="border-t border-gray-300 my-2" />

        {/* Price */}
        <div className="flex justify-between items-center">
          <h1 className="font-semibold">N{price}</h1>
        </div>
      </div>
    </button>
  );
};

export default PropertyCardSuggestion;
