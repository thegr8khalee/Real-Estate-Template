import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Review = sequelize.define(
  'Review',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100],
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000],
        notEmpty: true,
      },
    },
    locationRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    conditionRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    valueRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    amenitiesRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    propertyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Properties',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'spam'),
      defaultValue: 'approved',
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ['propertyId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default Review;
