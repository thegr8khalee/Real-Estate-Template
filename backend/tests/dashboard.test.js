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
    literal: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/property.model.js', () => ({
  default: {
    count: jest.fn(),
    sum: jest.fn(),
    findAll: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/blog.model.js', () => ({
  default: {
    count: jest.fn(),
    sum: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/user.model.js', () => ({
  default: {
    findByPk: jest.fn(),
    count: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/comment.model.js', () => ({
  default: {
    findAll: jest.fn(),
    count: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/review.model.js', () => ({
  default: {
    findAll: jest.fn(),
    count: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/news.model.js', () => ({
  default: {
    findOne: jest.fn(),
    count: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/admin.model.js', () => ({
  default: {
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/sell.model.js', () => ({
  default: {
    count: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/lib/dashboard.utils.js', () => ({
  calculateDateRanges: jest.fn(() => ({
    thisMonth: { start: new Date(), end: new Date() },
    lastMonth: { start: new Date(), end: new Date() },
    thisYear: { start: new Date(), end: new Date() },
    lastYear: { start: new Date(), end: new Date() },
  })),
  formatCurrency: jest.fn((val) => `$${val}`),
  calculatePercentageChange: jest.fn(() => 10),
}));

const Property = (await import('../src/models/property.model.js')).default;
const Blog = (await import('../src/models/blog.model.js')).default;
const User = (await import('../src/models/user.model.js')).default;
const Comment = (await import('../src/models/comment.model.js')).default;
const Review = (await import('../src/models/review.model.js')).default;
const Newsletter = (await import('../src/models/news.model.js')).default;
const SellNow = (await import('../src/models/sell.model.js')).default;
const { getUserDetails, getDashboardStats } = await import('../src/controllers/dashboard.controller.js');

const app = express();
app.use(express.json());

// Mock admin middleware
const mockAdminMiddleware = (req, res, next) => {
  req.admin = { role: 'super_admin' };
  next();
};

app.get('/api/dashboard/user/:id', getUserDetails);
app.get('/api/dashboard/stats', mockAdminMiddleware, getDashboardStats);

describe('Dashboard Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dashboard/user/:id', () => {
    it('should return user details', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        toJSON: () => ({ id: 1, username: 'testuser', email: 'test@example.com' }),
      };
      User.findByPk.mockResolvedValue(mockUser);
      Comment.findAll.mockResolvedValue([]);
      Review.findAll.mockResolvedValue([]);
      Newsletter.findOne.mockResolvedValue(null);

      const res = await request(app).get('/api/dashboard/user/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.username).toBe('testuser');
    });

    it('should return 404 if user not found', async () => {
      User.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/api/dashboard/user/999');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard stats', async () => {
      Property.count.mockResolvedValue(10);
      Property.sum.mockResolvedValue(1000000);
      SellNow.count.mockResolvedValue(5);
      Blog.count.mockResolvedValue(3);
      Blog.sum.mockResolvedValue(100);
      User.count.mockResolvedValue(20);
      Comment.count.mockResolvedValue(15);
      Review.count.mockResolvedValue(8);
      Newsletter.count.mockResolvedValue(50);

      const res = await request(app).get('/api/dashboard/stats');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.properties.total).toBe(10);
    });
  });
});
