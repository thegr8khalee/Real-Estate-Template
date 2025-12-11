import express from 'express';
import { getAllProperties, getPropertyById, Search } from '../controllers/property.controller.js';

const router = express.Router();

router.get('/get-all', getAllProperties);
router.get('/get/:id', getPropertyById);
router.get('/search', Search);

export default router;
