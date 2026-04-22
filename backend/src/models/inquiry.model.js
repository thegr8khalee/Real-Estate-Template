import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';

const Inquiry = sequelize.define(
  'Inquiry',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
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
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true, notEmpty: true },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('tour', 'question', 'offer'),
      defaultValue: 'tour',
      allowNull: false,
    },
    preferredDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    preferredTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'contacted', 'scheduled', 'completed', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ['propertyId'] },
      { fields: ['userId'] },
      { fields: ['status'] },
    ],
  }
);

export default Inquiry;
