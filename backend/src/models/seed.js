import Property from './property.model.js';

export const seedData = async () => {
  try {
    const count = await Property.count();
    if (count > 0) {
      console.log('Properties already exist, skipping seed.');
      return;
    }

    const properties = [
      {
        title: 'Modern Villa in Beverly Hills',
        description: 'A stunning modern villa with breathtaking views.',
        price: 5000000,
        address: '123 Beverly Dr',
        city: 'Beverly Hills',
        state: 'CA',
        zipCode: '90210',
        type: 'Villa',
        status: 'For Sale',
        bedrooms: 5,
        bathrooms: 6,
        sqft: 5000,
        yearBuilt: 2020,
        features: ['Pool', 'Garage', 'Garden', 'Smart Home'],
        images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'],
        condition: 'New',
      },
      {
        title: 'Cozy Apartment in NYC',
        description: 'A cozy apartment in the heart of Manhattan.',
        price: 1200000,
        address: '456 Broadway',
        city: 'New York',
        state: 'NY',
        zipCode: '10012',
        type: 'Apartment',
        status: 'For Rent',
        bedrooms: 2,
        bathrooms: 1,
        sqft: 900,
        yearBuilt: 1950,
        features: ['Elevator', 'Doorman', 'Gym'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'],
        condition: 'Renovated',
      },
    ];

    await Property.bulkCreate(properties);
    console.log('✅ Seed data created successfully');
  } catch (error) {
    console.error('❌ Failed to seed data:', error);
  }
};
