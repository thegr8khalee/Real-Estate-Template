import express from 'express';
import { submitInquiry, getInquiries, updateInquiryStatus, deleteInquiry } from '../controllers/inquiry.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
import { protectAdminRoute } from '../middleware/protectAdminRoute.js';

const router = express.Router();

// Public/authenticated user routes
router.post('/', submitInquiry);

// Admin routes
router.get('/', protectAdminRoute, getInquiries);
router.patch('/:id/status', protectAdminRoute, updateInquiryStatus);
router.delete('/:id', protectAdminRoute, deleteInquiry);

export default router;
