import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Property = sequelize.define(
  'Property',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        'House',
        'Apartment',
        'Condo',
        'Land',
        'Commercial',
        'Townhouse',
        'Villa'
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('For Sale', 'For Rent', 'Sold', 'Pending'),
      defaultValue: 'For Sale',
      allowNull: false,
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bathrooms: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    sqft: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    yearBuilt: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    features: {
      type: DataTypes.JSON, // Store array of strings like ['Pool', 'Garage']
      defaultValue: [],
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON, // Store array of image URLs
      defaultValue: [],
      allowNull: true,
    },
    condition: {
      type: DataTypes.ENUM('New', 'Used', 'Renovated', 'Under Construction'),
      defaultValue: 'Used',
    },
  },
  {
    timestamps: true,
  }
);

export default Property;
