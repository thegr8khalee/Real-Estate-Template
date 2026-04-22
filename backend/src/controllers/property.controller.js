import Property from '../models/property.model.js';
import { Op } from 'sequelize';
import sequelize from '../lib/db.js';
import Review from '../models/review.model.js';

export const getAllProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    // Dynamically build the where clause based on query parameters
    const where = {};
    
    // Exact matches or lists
    if (req.query.type) {
        const types = req.query.type.split(',');
        if (types.length > 1) {
            where.type = { [Op.in]: types };
        } else {
            where.type = req.query.type;
        }
    }
    if (req.query.status) where.status = req.query.status;
    if (req.query.city) where.city = req.query.city;
    if (req.query.state) where.state = req.query.state;
    if (req.query.zipCode) where.zipCode = req.query.zipCode;
    if (req.query.condition) where.condition = req.query.condition;

    // Search query (case-insensitive)
    if (req.query.query) {
        const search = `%${req.query.query}%`;
        where[Op.or] = [
            { title: { [Op.iLike]: search } },
            { address: { [Op.iLike]: search } },
            { city: { [Op.iLike]: search } },
            { state: { [Op.iLike]: search } },
            { zipCode: { [Op.iLike]: search } },
            { description: { [Op.iLike]: search } }
        ];
    }

    // Range filters
    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};
      if (req.query.minPrice) where.price[Op.gte] = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) where.price[Op.lte] = parseFloat(req.query.maxPrice);
    }

    if (req.query.minBedrooms) {
      where.bedrooms = { [Op.gte]: parseInt(req.query.minBedrooms, 10) };
    }
    if (req.query.bedrooms) {
        const beds = req.query.bedrooms.split(',');
        if (beds.length > 1) {
             // Handle "5+" case if present, usually handled by frontend logic but here we just take numbers
             // If "5+" is passed, it might be "5" or "5+" string.
             // Assuming frontend sends numbers.
             where.bedrooms = { [Op.in]: beds.map(b => parseInt(b, 10)) };
        } else {
             where.bedrooms = parseInt(req.query.bedrooms, 10);
        }
    }

    if (req.query.minBathrooms) {
      where.bathrooms = { [Op.gte]: parseFloat(req.query.minBathrooms) };
    }
    if (req.query.bathrooms) {
        where.bathrooms = parseFloat(req.query.bathrooms);
    }

    if (req.query.minSqft) {
        where.sqft = { [Op.gte]: parseInt(req.query.minSqft, 10) };
    }

    // Use findAndCountAll to get both the data and the total count for pagination
    const { count, rows: properties } = await Property.findAndCountAll({
      where: where,
      limit: limit,
      offset: offset,
      order: [['createdAt', 'DESC']], // Default ordering
    });

    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      properties: properties,
    });
  } catch (error) {
    console.error('Error in getAllProperties controller:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error while retrieving properties.' });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the primary property by ID
    const property = await Property.findByPk(id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Find up to 4 related properties that share similar attributes.
    // Prioritize same city + type, then same city, then same type with similar price
    const priceRange = parseFloat(property.price) * 0.3; // 30% price range
    const minPrice = parseFloat(property.price) - priceRange;
    const maxPrice = parseFloat(property.price) + priceRange;

    const relatedProperties = await Property.findAll({
      where: {
        id: { [Op.ne]: property.id },
        status: { [Op.in]: ['For Sale', 'For Rent'] },
        [Op.or]: [
          { city: property.city, type: property.type },
          { city: property.city },
          { type: property.type, price: { [Op.between]: [minPrice, maxPrice] } },
          { zipCode: property.zipCode },
        ],
      },
      limit: 4,
    });

    // Find all approved reviews for the primary property
    const reviews = await Review.findAll({
      where: {
        propertyId: id,
        status: 'approved', 
      },
      include: [
        {
            model: Review.sequelize.models.User,
            as: 'user',
            attributes: ['id', 'username', 'email'],
        }
      ]
    });

    // Compute average ratings from approved reviews
    const averageRatings = { location: 0, condition: 0, value: 0, amenities: 0, overall: 0 };
    if (reviews.length > 0) {
      let totals = { location: 0, condition: 0, value: 0, amenities: 0 };
      let counts = { location: 0, condition: 0, value: 0, amenities: 0 };
      for (const r of reviews) {
        if (r.locationRating) { totals.location += r.locationRating; counts.location++; }
        if (r.conditionRating) { totals.condition += r.conditionRating; counts.condition++; }
        if (r.valueRating) { totals.value += r.valueRating; counts.value++; }
        if (r.amenitiesRating) { totals.amenities += r.amenitiesRating; counts.amenities++; }
      }
      averageRatings.location = counts.location ? totals.location / counts.location : 0;
      averageRatings.condition = counts.condition ? totals.condition / counts.condition : 0;
      averageRatings.value = counts.value ? totals.value / counts.value : 0;
      averageRatings.amenities = counts.amenities ? totals.amenities / counts.amenities : 0;
      const allRatings = [averageRatings.location, averageRatings.condition, averageRatings.value, averageRatings.amenities].filter(v => v > 0);
      averageRatings.overall = allRatings.length ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;
    }

    res.status(200).json({
      property,
      relatedProperties,
      reviews,
      averageRatings,
    });
  } catch (error) {
    console.error('Error in getPropertyById controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const Search = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const properties = await Property.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${query}%` } },
                    { description: { [Op.iLike]: `%${query}%` } },
                    { address: { [Op.iLike]: `%${query}%` } },
                    { city: { [Op.iLike]: `%${query}%` } },
                    { zipCode: { [Op.iLike]: `%${query}%` } },
                ]
            },
            limit: 20
        });

        res.status(200).json({
            totalItems: properties.length,
            properties,
        });
    } catch (error) {
        console.error("Error in Search controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
