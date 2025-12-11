import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/db.js'; // Assuming this is your configured Sequelize instance

class SellNow extends Model {}

SellNow.init({
    // --- Contact Information ---
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Full Name is required.' },
        },
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Phone Number is required.' },
            // Basic pattern for numbers
            is: {
                args: /^\+?\d{10,15}$/,
                msg: 'Please enter a valid phone number.',
            },
        },
    },
    emailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false, // Could be true, but often users resubmit. Set to false for flexibility.
        validate: {
            isEmail: { msg: 'Please enter a valid email address.' },
        },
    },

    // --- Property Details ---
    propertyType: {
        type: DataTypes.STRING,
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
    bedrooms: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 0,
        },
    },
    bathrooms: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            isFloat: true,
            min: 0,
        },
    },
    sqft: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 0,
        },
    },
    askingPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
    condition: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    images: {
        type: DataTypes.JSON,
        defaultValue: [],
        allowNull: true,
    },
    additionalNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    
    // --- Additional Info ---
    status: {
        type: DataTypes.ENUM('Pending', 'Reviewed', 'Contacted', 'Rejected', 'Accepted'),
        defaultValue: 'Pending',
    },
}, {
    sequelize,
    modelName: 'SellNow',
    tableName: 'SellNowRequests', // Optional: customize table name
    timestamps: true, // Adds createdAt and updatedAt
});

export default SellNow;
