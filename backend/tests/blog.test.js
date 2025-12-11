import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock dependencies
jest.unstable_mockModule('../src/lib/db.js', () => ({
  default: {
    define: jest.fn(() => ({
      belongsTo: jest.fn(),
      hasMany: jest.fn(),
    })),
    sync: jest.fn(),
    authenticate: jest.fn(),
    fn: jest.fn(),
    col: jest.fn(),
    where: jest.fn(),
    literal: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/blog.model.js', () => ({
  default: {
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/comment.model.js', () => ({
  default: {},
}));

jest.unstable_mockModule('../src/models/property.model.js', () => ({
  default: {
    findAll: jest.fn(),
  },
}));

const Blog = (await import('../src/models/blog.model.js')).default;
const {
  getAllBlogs,
  getBlogById,
  searchBlogs,
  getRelatedBlogsById,
} = await import('../src/controllers/blog.controller.js');

const app = express();
app.use(express.json());
app.get('/api/blogs/search', searchBlogs); // Search must be before :id
app.get('/api/blogs/related/:id', getRelatedBlogsById);
app.get('/api/blogs/:id', getBlogById);
app.get('/api/blogs', getAllBlogs);

describe('Blog Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/blogs', () => {
    it('should return all published blogs', async () => {
      const mockBlogs = [{ id: 1, title: 'Blog 1', status: 'published' }];
      Blog.findAndCountAll.mockResolvedValue({ count: 1, rows: mockBlogs });

      const res = await request(app).get('/api/blogs');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual(mockBlogs);
    });
  });

  describe('GET /api/blogs/:id', () => {
    it('should return a blog by id', async () => {
      const mockBlog = { 
        id: 1, 
        title: 'Blog 1', 
        carIds: [],
        index: 1
      };
      Blog.findByPk.mockResolvedValue(mockBlog);
      Blog.findOne.mockResolvedValue(null); // For prev/next blog

      const res = await request(app).get('/api/blogs/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.currentBlog).toEqual(mockBlog);
    });

    it('should return 404 if blog not found', async () => {
      Blog.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/api/blogs/999');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/blogs/search', () => {
    it('should search blogs', async () => {
      const mockBlogs = [{ id: 1, title: 'Search Result' }];
      Blog.findAll.mockResolvedValue(mockBlogs);

      const res = await request(app).get('/api/blogs/search?query=test');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual(mockBlogs);
    });
  });
});
