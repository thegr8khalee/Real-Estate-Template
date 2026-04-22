import Favorite from '../models/favorite.model.js';
import Property from '../models/property.model.js';

export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const existing = await Favorite.findOne({ where: { userId, propertyId } });

    if (existing) {
      await existing.destroy();
      return res.status(200).json({ success: true, favorited: false, message: 'Removed from favorites' });
    }

    // Verify property exists
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    await Favorite.create({ userId, propertyId });
    return res.status(201).json({ success: true, favorited: true, message: 'Added to favorites' });
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Favorite.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Property,
          as: 'property',
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      favorites: rows.map((f) => f.property),
    });
  } catch (error) {
    console.error('Error in getFavorites:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const existing = await Favorite.findOne({ where: { userId, propertyId } });
    res.status(200).json({ success: true, favorited: !!existing });
  } catch (error) {
    console.error('Error in checkFavorite:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getFavoriteIds = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.findAll({
      where: { userId },
      attributes: ['propertyId'],
    });

    res.status(200).json({
      success: true,
      propertyIds: favorites.map((f) => f.propertyId),
    });
  } catch (error) {
    console.error('Error in getFavoriteIds:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
