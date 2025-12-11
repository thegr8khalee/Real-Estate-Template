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

jest.unstable_mockModule('../src/models/broadcast.model.js', () => ({
  default: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/news.model.js', () => ({
  default: {
    findAll: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/admin.model.js', () => ({
  default: {
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/lib/cloudinary.js', () => ({
  default: {
    uploader: {
      upload: jest.fn(),
    },
  },
}));

jest.unstable_mockModule('../src/services/zoho.service.js', () => ({
  default: {
    sendBroadcastEmail: jest.fn(),
  },
}));

// Import mocked modules
const Broadcast = (await import('../src/models/broadcast.model.js')).default;
const Newsletter = (await import('../src/models/news.model.js')).default;
const Admin = (await import('../src/models/admin.model.js')).default;
const cloudinary = (await import('../src/lib/cloudinary.js')).default;
const zohoMailService = (await import('../src/services/zoho.service.js')).default;
const { createBroadcast } = await import('../src/controllers/broadcast.controller.js');

const app = express();
app.use(express.json());
app.post('/api/broadcasts', createBroadcast);

describe('Broadcast Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/broadcasts', () => {
    it('should create and send a broadcast', async () => {
      const mockBroadcast = {
        id: 1,
        update: jest.fn(),
      };

      Newsletter.findAll.mockResolvedValue([{ email: 'test@example.com', userName: 'User' }]);
      Admin.findByPk.mockResolvedValue({ username: 'Admin' });
      Broadcast.create.mockResolvedValue(mockBroadcast);
      zohoMailService.sendBroadcastEmail.mockResolvedValue(true);

      const res = await request(app).post('/api/broadcasts').send({
        title: 'Test Broadcast',
        content: 'Content',
        sentById: 1,
      });

      expect(res.statusCode).toBe(201);
      expect(Broadcast.create).toHaveBeenCalled();
      expect(zohoMailService.sendBroadcastEmail).toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app).post('/api/broadcasts').send({});
      expect(res.statusCode).toBe(400);
    });
  });
});
