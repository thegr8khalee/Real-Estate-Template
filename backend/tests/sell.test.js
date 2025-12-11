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
  },
}));

jest.unstable_mockModule('../src/models/sell.model.js', () => ({
  default: {
    create: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/lib/cloudinary.js', () => ({
  default: {
    uploader: {
      upload: jest.fn(),
    },
  },
}));

// Import mocked modules
const SellNow = (await import('../src/models/sell.model.js')).default;
const cloudinary = (await import('../src/lib/cloudinary.js')).default;
const { submitSellForm } = await import('../src/controllers/sell.controller.js');

const app = express();
app.use(express.json());
app.post('/api/sell', submitSellForm);

describe('Sell Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/sell', () => {
    it('should submit sell form', async () => {
      const mockSubmission = {
        id: 1,
        emailAddress: 'test@example.com',
        propertyType: 'House',
        address: '123 Main St',
        condition: 'Good',
      };

      SellNow.create.mockResolvedValue(mockSubmission);
      cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'url' });

      const res = await request(app).post('/api/sell').send({
        fullName: 'Test User',
        phoneNumber: '1234567890',
        emailAddress: 'test@example.com',
        propertyType: 'House',
        address: '123 Main St',
        condition: 'Good',
        uploadPhotos: ['data:image/png;base64,abc'],
      });

      expect(res.statusCode).toBe(201);
      expect(SellNow.create).toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app).post('/api/sell').send({});
      expect(res.statusCode).toBe(400);
    });
  });
});
