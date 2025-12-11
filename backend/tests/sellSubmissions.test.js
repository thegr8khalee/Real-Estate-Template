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
    count: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/services/zoho.service.js', () => ({
  default: {
    createLead: jest.fn(),
  },
}));

// Import mocked modules
const SellNow = (await import('../src/models/sell.model.js')).default;
const { 
  getSellSubmissionsStats, 
  getSellSubmissions, 
  updateSellSubmissionStatus 
} = await import('../src/controllers/sellSubmissions.controller.js');

const app = express();
app.use(express.json());

// Mock admin middleware
const mockAdminMiddleware = (req, res, next) => {
  req.admin = { id: 'admin123', role: 'super_admin' };
  next();
};

app.get('/api/admin/sell/stats', mockAdminMiddleware, getSellSubmissionsStats);
app.get('/api/admin/sell/submissions', mockAdminMiddleware, getSellSubmissions);
app.put('/api/admin/sell/submissions/:id', mockAdminMiddleware, updateSellSubmissionStatus);

describe('Sell Submissions Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /stats', () => {
    it('should return submission stats', async () => {
      SellNow.count.mockResolvedValue(5);

      const res = await request(app).get('/api/admin/sell/stats');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalSubmissions).toBe(5);
    });
  });

  describe('GET /submissions', () => {
    it('should return paginated submissions', async () => {
      SellNow.findAndCountAll.mockResolvedValue({ count: 1, rows: [{ id: 1 }] });

      const res = await request(app).get('/api/admin/sell/submissions');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.submissions).toHaveLength(1);
    });
  });

  describe('PUT /submissions/:id', () => {
    it('should update submission status', async () => {
      const mockSubmission = { id: 1, update: jest.fn(), save: jest.fn() };
      SellNow.findByPk.mockResolvedValue(mockSubmission);

      const res = await request(app)
        .put('/api/admin/sell/submissions/1')
        .send({ status: 'Accepted' });

      expect(res.statusCode).toBe(200);
      expect(mockSubmission.save).toHaveBeenCalled();
    });

    it('should return 400 for invalid status', async () => {
      const res = await request(app)
        .put('/api/admin/sell/submissions/1')
        .send({ status: 'Invalid' });

      expect(res.statusCode).toBe(400);
    });
  });
});
