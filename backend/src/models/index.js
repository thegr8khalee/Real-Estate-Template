import sequelize from '../lib/db.js';
import User from './user.model.js';
import Admin from './admin.model.js';
import Property from './property.model.js';
import Blog from './blog.model.js';
import Comment from './comment.model.js';
import Newsletter from './news.model.js';
import { initializeAssociations, BlogProperty } from './associations.js';
import Review from './review.model.js';
import NewsletterBroadcast from './broadcast.model.js';
import SellNow from './sell.model.js';
import { seedData } from './seed.js';

// Initialize associations
initializeAssociations();

// Models object for easy access
const models = {
  User,
  Admin,
  Property,
  Blog,
  Comment,
  Newsletter,
  BlogProperty,
  NewsletterBroadcast,
  sequelize,
  seedData,
};


// Database synchronization function
export const syncDatabase = async (options = {}) => {
  try {
    const { force = false, alter = false } = options;

    if (force) {
      console.log('⚠️  WARNING: This will drop all existing tables!');
    }

    await sequelize.sync({ force, alter });

    if (force || alter) {
      console.log('✅ Database synchronized successfully');
    } else {
      console.log('✅ Database connection verified');
    }

    return true;
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    throw error;
  }
};

export { seedData };
export default models;
