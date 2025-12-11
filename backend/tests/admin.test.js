import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

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
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/lib/supabase.js', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
  },
}));

jest.unstable_mockModule('../src/lib/cloudinary.js', () => ({
  default: {
    uploader: {
      upload: jest.fn(),
    },
  },
}));

jest.unstable_mockModule('../src/lib/dashboard.utils.js', () => ({
  hasPermission: jest.fn(),
  sanitizeQueryParams: jest.fn(() => ({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'DESC' })),
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));

// Import mocked modules
const Admin = (await import('../src/models/admin.model.js')).default;
const { supabase } = await import('../src/lib/supabase.js');
const { hasPermission } = await import('../src/lib/dashboard.utils.js');
const bcrypt = (await import('bcryptjs')).default;
const { 
  adminSignup, 
  adminLogin, 
  adminLogout,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  changePassword,
  deleteAdmin
} = await import('../src/controllers/admin.controller.js');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Mock middleware
const mockAdminMiddleware = (req, res, next) => {
  req.admin = { id: 'admin123', role: 'super_admin' };
  next();
};

app.post('/api/admin/signup', adminSignup);
app.post('/api/admin/login', adminLogin);
app.post('/api/admin/logout', adminLogout);
app.get('/api/admin', mockAdminMiddleware, getAllAdmins);
app.get('/api/admin/:id', mockAdminMiddleware, getAdminById);
app.put('/api/admin/:id', mockAdminMiddleware, updateAdmin);
app.put('/api/admin/:id/password', mockAdminMiddleware, changePassword);
app.delete('/api/admin/:id', mockAdminMiddleware, deleteAdmin);

describe('Admin Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /signup', () => {
    it('should create a new admin successfully', async () => {
      const mockAdmin = {
        id: 'admin123',
        username: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'admin123' }, session: { access_token: 'token' } },
        error: null,
      });

      Admin.create.mockResolvedValue(mockAdmin);
      Admin.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/admin/signup')
        .send({
          username: 'Admin User',
          email: 'admin@example.com',
          password: 'password123',
          position: 'Manager',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.email).toBe('admin@example.com');
    });
  });

  describe('POST /login', () => {
    it('should login admin successfully', async () => {
      const mockAdmin = {
        id: 'admin123',
        username: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { 
          user: { id: 'admin123' },
          session: { access_token: 'valid-token' }
        },
        error: null,
      });

      Admin.findByPk.mockResolvedValue(mockAdmin);

      const res = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  describe('GET /api/admin', () => {
    it('should return all admins', async () => {
      hasPermission.mockReturnValue(true);
      Admin.findAndCountAll.mockResolvedValue({ count: 1, rows: [{ id: 'admin123' }] });

      const res = await request(app).get('/api/admin');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.admins).toHaveLength(1);
    });
  });

  describe('GET /api/admin/:id', () => {
    it('should return admin by id', async () => {
      hasPermission.mockReturnValue(true);
      Admin.findByPk.mockResolvedValue({ id: 'admin123', username: 'admin' });

      const res = await request(app).get('/api/admin/admin123');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.admin.username).toBe('admin');
    });
  });

  describe('PUT /api/admin/:id', () => {
    it('should update admin', async () => {
      hasPermission.mockReturnValue(true);
      const mockAdmin = { id: 'admin123', update: jest.fn() };
      Admin.findByPk.mockResolvedValue(mockAdmin);

      const res = await request(app)
        .put('/api/admin/admin123')
        .send({ username: 'New Name' });

      expect(res.statusCode).toBe(200);
      expect(mockAdmin.update).toHaveBeenCalled();
    });
  });

  describe('PUT /api/admin/:id/password', () => {
    it('should change password', async () => {
      const mockAdmin = { 
        id: 'admin123', 
        passwordHash: 'hashed', 
        update: jest.fn() 
      };
      Admin.findByPk.mockResolvedValue(mockAdmin);
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('newhashed');

      const res = await request(app)
        .put('/api/admin/admin123/password')
        .send({ currentPassword: 'old', newPassword: 'newpassword123' });

      expect(res.statusCode).toBe(200);
      expect(mockAdmin.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/admin/:id', () => {
    it('should delete admin', async () => {
      hasPermission.mockReturnValue(true);
      const mockAdmin = { id: 'otheradmin', destroy: jest.fn() };
      Admin.findByPk.mockResolvedValue(mockAdmin);

      const res = await request(app).delete('/api/admin/otheradmin');

      expect(res.statusCode).toBe(200);
      expect(mockAdmin.destroy).toHaveBeenCalled();
    });
  });
});
