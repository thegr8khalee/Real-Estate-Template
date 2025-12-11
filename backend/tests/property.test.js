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

jest.unstable_mockModule('../src/models/property.model.js', () => ({
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/review.model.js', () => ({
  default: {
    findAll: jest.fn(),
    sequelize: {
        models: {
            User: {}
        }
    }
  },
}));

const Property = (await import('../src/models/property.model.js')).default;
const Review = (await import('../src/models/review.model.js')).default;
const { getAllProperties, getPropertyById } = await import('../src/controllers/property.controller.js');

const app = express();
app.use(express.json());
app.get('/api/properties', getAllProperties);
app.get('/api/properties/:id', getPropertyById);

describe('Property Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/properties', () => {
    it('should return all properties', async () => {
      const mockProperties = [{ id: 1, title: 'Luxury Villa', city: 'Beverly Hills' }];
      Property.findAndCountAll.mockResolvedValue({ count: 1, rows: mockProperties });

      const res = await request(app).get('/api/properties');

      expect(res.statusCode).toBe(200);
      expect(res.body.properties).toEqual(mockProperties);
    });
  });

  describe('GET /api/properties/:id', () => {
    it('should return a property by id', async () => {
      const mockProperty = { id: 1, title: 'Luxury Villa', city: 'Beverly Hills' };
      Property.findByPk.mockResolvedValue(mockProperty);
      Property.findAll.mockResolvedValue([]); // For related properties
      Review.findAll.mockResolvedValue([]); // For reviews

      const res = await request(app).get('/api/properties/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.property).toEqual(mockProperty);
    });

    it('should return 404 if property not found', async () => {
      Property.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/api/properties/999');

      expect(res.statusCode).toBe(404);
    });
  });
});
