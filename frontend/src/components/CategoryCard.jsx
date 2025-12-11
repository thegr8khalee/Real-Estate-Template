import { ArrowUpRight } from 'lucide-react';
import React from 'react';

const CategoryCard = ({ img, icon: Icon, label }) => {
  return (
    <div className="relative aspect-9/12 w-full bg-gray-100 flex items-center justify-center overflow-hidden rounded-2xl">
      {img ? (
        <img
          src={img}
          alt={label}
          className="absolute w-full h-full object-cover"
        />
      ) : Icon ? (
        <Icon className="w-20 h-20 text-gray-400" />
      ) : null}

      <h1 className="absolute text-secondary top-4 left-4 text-2xl drop-shadow-3xl  font-montserrat font-light z-10">
        {label}
      </h1>
      <button className="absolute bottom-2 right-2 btn btn-circle btn-secondary z-10">
        <ArrowUpRight className="text-white" />
      </button>
      {/* Overlay for better text visibility if image is present */}
      {img && <div className="absolute inset-0 bg-black/20"></div>}
    </div>
  );
};

export default CategoryCard;
