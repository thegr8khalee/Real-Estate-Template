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

jest.unstable_mockModule('../src/models/admin.model.js', () => ({
  default: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
    findAndCountAll: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/lib/supabase.js', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      admin: {
        deleteUser: jest.fn(),
      },
    },
  },
}));

jest.unstable_mockModule('../src/lib/cloudinary.js', () => ({
  default: {
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

const Admin = (await import('../src/models/admin.model.js')).default;
const { supabase } = await import('../src/lib/supabase.js');
const cloudinary = (await import('../src/lib/cloudinary.js')).default;
const {
  addStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} = await import('../src/controllers/adminStaff.controller.js');

const app = express();
app.use(express.json());
app.post('/api/admin/staff', addStaff);
app.get('/api/admin/staff', getAllStaff);
app.get('/api/admin/staff/:id', getStaffById);
app.put('/api/admin/staff/:id', updateStaff);
app.delete('/api/admin/staff/:id', deleteStaff);

describe('Admin Staff Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/admin/staff', () => {
    it('should add a new staff member', async () => {
      const mockStaff = {
        username: 'teststaff',
        email: 'test@example.com',
        password: 'password123',
        role: 'editor',
        position: 'Editor',
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'supabase-id' } },
        error: null,
      });

      Admin.findOne.mockResolvedValue(null); // No existing user
      Admin.create.mockResolvedValue({ ...mockStaff, id: 1, supabaseId: 'supabase-id' });

      const res = await request(app).post('/api/admin/staff').send(mockStaff);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Staff member added successfully');
    });
  });

  describe('GET /api/admin/staff', () => {
    it('should return all staff members', async () => {
      const mockStaffList = [{ id: 1, username: 'staff1' }];
      Admin.findAndCountAll.mockResolvedValue({ count: 1, rows: mockStaffList });

      const res = await request(app).get('/api/admin/staff');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.staffs).toEqual(mockStaffList);
    });
  });

  describe('GET /api/admin/staff/:id', () => {
    it('should return a staff member by id', async () => {
      const mockStaff = { id: 1, username: 'staff1' };
      Admin.findByPk.mockResolvedValue(mockStaff);

      const res = await request(app).get('/api/admin/staff/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual(mockStaff);
    });

    it('should return 404 if staff not found', async () => {
      Admin.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/api/admin/staff/999');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/admin/staff/:id', () => {
    it('should delete a staff member', async () => {
      const mockStaff = { id: 1, username: 'staff1', supabaseId: 'supabase-id', destroy: jest.fn() };
      Admin.findByPk.mockResolvedValue(mockStaff);
      supabase.auth.admin.deleteUser.mockResolvedValue({ error: null });

      const res = await request(app).delete('/api/admin/staff/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Staff member deleted successfully');
    });
  });
});
