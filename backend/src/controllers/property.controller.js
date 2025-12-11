import Property from '../models/property.model.js';
import { Op } from 'sequelize';
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

    // Search query
    if (req.query.query) {
        const search = `%${req.query.query}%`;
        where[Op.or] = [
            { title: { [Op.like]: search } },
            { address: { [Op.like]: search } },
            { city: { [Op.like]: search } },
            { description: { [Op.like]: search } }
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
    const relatedProperties = await Property.findAll({
      where: {
        id: { [Op.ne]: property.id }, // Exclude the current property
        [Op.or]: [
          { city: property.city },
          { type: property.type },
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
            attributes: ['fullName', 'profilePic'],
        }
      ]
    });

    res.status(200).json({
      property,
      relatedProperties,
      reviews,
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

        res.status(200).json(properties);
    } catch (error) {
        console.error("Error in Search controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
