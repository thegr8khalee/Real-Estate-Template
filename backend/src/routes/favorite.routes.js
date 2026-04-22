import express from 'express';
import { toggleFavorite, getFavorites, checkFavorite, getFavoriteIds } from '../controllers/favorite.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.post('/:propertyId', protectRoute, toggleFavorite);
router.get('/', protectRoute, getFavorites);
router.get('/ids', protectRoute, getFavoriteIds);
router.get('/check/:propertyId', protectRoute, checkFavorite);

export default router;
