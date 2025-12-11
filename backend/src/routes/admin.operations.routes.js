import express from 'express';
import { protectAdminRoute } from '../middleware/protectAdminRoute.js';
import { addBlog, addProperty, deleteBlog, deleteProperty, getNewsletterStats, getRecentBroadcasts, sendNewsletter, updateBlog, updateProperty } from '../controllers/admin.operations.controller.js';

const router = express.Router();

router.post('/add-property', protectAdminRoute, addProperty);
router.put('/update-property/:id', protectAdminRoute, updateProperty);
router.delete('/delete-property/:id', protectAdminRoute, deleteProperty);

router.post('/add-blog', protectAdminRoute, addBlog);
router.put('/update-blog/:id', protectAdminRoute, updateBlog);
router.delete('/delete-blog/:id', protectAdminRoute, deleteBlog);
router.get('/newsletter/stats', protectAdminRoute, getNewsletterStats);
router.get('/newsletter/broadcasts', protectAdminRoute, getRecentBroadcasts);
router.post('/newsletter/send', protectAdminRoute, sendNewsletter);

export default router;
