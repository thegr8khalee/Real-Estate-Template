// models/associations.js
import { DataTypes } from 'sequelize';
import sequelize from '../lib/db.js';
import User from './user.model.js';
import Admin from './admin.model.js';
import Property from './property.model.js';
import Blog from './blog.model.js';
import Comment from './comment.model.js';
import Newsletter from './news.model.js';
import Review from './review.model.js';
import Broadcast from './broadcast.model.js';

Admin.hasMany(Broadcast, {
  foreignKey: 'sentById',
  as: 'broadcastsSent',
});

Broadcast.belongsTo(Admin, {
  foreignKey: 'sentById',
  as: 'sender',
});

// Blog associations - Changed alias from 'author' to 'adminAuthor'
Blog.belongsTo(Admin, {
  foreignKey: 'authorId',
  as: 'adminAuthor', // Changed from 'author' to avoid collision
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Admin.hasMany(Blog, {
  foreignKey: 'authorId',
  as: 'blogs',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// Many-to-Many association between Blog and Property (using propertyIds array)
const BlogProperty = sequelize.define(
  'BlogProperty',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    blogId: {
      type: DataTypes.UUID,
      references: {
        model: 'Blogs',
        key: 'id',
      },
    },
    propertyId: {
      type: DataTypes.UUID,
      references: {
        model: 'Properties',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['blogId', 'propertyId'],
      },
    ],
  }
);

Blog.belongsToMany(Property, {
  through: BlogProperty,
  foreignKey: 'blogId',
  otherKey: 'propertyId',
  as: 'properties',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Property.belongsToMany(Blog, {
  through: BlogProperty,
  foreignKey: 'propertyId',
  otherKey: 'blogId',
  as: 'blogs',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Comment associations
Comment.belongsTo(Blog, {
  foreignKey: 'blogId',
  as: 'blog',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Blog.hasMany(Comment, {
  foreignKey: 'blogId',
  as: 'comments',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Comment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

User.hasMany(Comment, {
  foreignKey: 'userId',
  as: 'comments',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Property and Review associations
Property.hasMany(Review, {
  foreignKey: 'propertyId',
  as: 'reviews', // This alias allows us to include reviews when querying a Property
  onDelete: 'CASCADE', // Optional: if a Property is deleted, all its Reviews are also deleted
});

// A Review belongs to a Property
Review.belongsTo(Property, {
  foreignKey: 'propertyId',
  as: 'property', // This alias allows us to include the property when querying a Review
});

// User and Review associations (added for dashboard functionality)
User.hasMany(Review, {
  foreignKey: 'userId',
  as: 'reviews',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Review.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Additional associations for dashboard analytics

// Admin activity tracking associations (if you want to track which admin created what)
Admin.hasMany(Property, {
  foreignKey: 'createdBy', // You might want to add this field to Property model
  as: 'createdProperties',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

// Newsletter associations (if you want to track subscription sources)
// Newsletter doesn't need direct associations since it's standalone

// Export all models and the junction table
export { User, Admin, Property, Blog, Comment, Newsletter, Review, BlogProperty };

// Export a function to initialize all associations
export const initializeAssociations = () => {
  console.log('All model associations have been initialized');

  // Log association summary for debugging
  console.log('Association Summary:');
  console.log('- Admin hasMany Blogs, Blogs belongsTo Admin');
  console.log('- Blog belongsToMany Property through BlogProperty');
  console.log('- Blog hasMany Comments, Comment belongsTo Blog');
  console.log('- User hasMany Comments, Comment belongsTo User');
  console.log('- Property hasMany Reviews, Review belongsTo Property');
  console.log('- User hasMany Reviews, Review belongsTo User');
  console.log('- Admin hasMany Properties (for tracking creator)');
};

// Export models with their associations for easy access
export const Models = {
  User,
  Admin,
  Property,
  Blog,
  Comment,
  Newsletter,
  Review,
  BlogProperty,
};

export default {
  User,
  Admin,
  Property,
  Blog,
  Comment,
  Newsletter,
  Review,
  BlogProperty,
  initializeAssociations,
  Models,
};
