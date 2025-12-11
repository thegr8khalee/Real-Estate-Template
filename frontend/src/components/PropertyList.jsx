import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { formatPrice } from '../lib/utils';

const PropertyList = ({
  image,
  title,
  address,
  price,
  link = '#',
}) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(link)}
      className="flex bg-base-100 rounded-lg w-full text-left hover:shadow-md transition-shadow duration-300 mb-4 border border-gray-100">
      <figure className='w-[30%] min-w-[120px]'>
        <img src={image} alt={title} className="w-full h-full object-cover rounded-l-lg" />
      </figure>
      <div className="w-[70%] px-5 py-3 flex flex-col justify-between">
        <div>
          <h2 className="card-title text-lg">{title}</h2>
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <MapPin className="size-3 mr-1" />
            <p className="truncate">{address}</p>
          </div>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center mt-2">
          <h1 className="font-semibold text-xl text-primary">{formatPrice(price)}</h1>
        </div>
      </div>
    </button>
  );
};

export default PropertyList;
