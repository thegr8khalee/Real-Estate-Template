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

jest.unstable_mockModule('../src/models/user.model.js', () => ({
  default: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/admin.model.js', () => ({
  default: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/lib/supabase.js', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn(),
  },
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
    genSalt: jest.fn(),
  },
}));

jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: jest.fn(() => ({
      sendMail: jest.fn((mailOptions, callback) => callback(null, { messageId: '123' })),
    })),
  },
}));

jest.unstable_mockModule('crypto', () => ({
  default: {
    randomBytes: jest.fn(() => ({ toString: () => 'randomToken' })),
    createHash: jest.fn(() => ({
      update: jest.fn(() => ({
        digest: jest.fn(() => 'hashedToken'),
      })),
    })),
  },
}));

// Import mocked modules
const User = (await import('../src/models/user.model.js')).default;
const Admin = (await import('../src/models/admin.model.js')).default;
const { supabase } = await import('../src/lib/supabase.js');
const jwt = (await import('jsonwebtoken')).default;
const bcrypt = (await import('bcryptjs')).default;
const { 
  signup, 
  login, 
  logout, 
  checkAuth, 
  updateProfile, 
  deleteAccount 
} = await import('../src/controllers/auth.controller.js');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Mock middleware to populate req.user
const mockAuthMiddleware = (req, res, next) => {
  if (req.headers['authorization']) {
    req.user = { id: '123' };
  }
  next();
};

app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.post('/api/auth/logout', logout);
app.get('/api/auth/check', checkAuth);
app.put('/api/auth/profile', mockAuthMiddleware, updateProfile);
app.delete('/api/auth/account', mockAuthMiddleware, deleteAccount);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';
  });

  describe('POST /signup', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        id: '123',
        username: 'Test User',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      });

      User.create.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          phoneNumber: '1234567890',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.email).toBe('test@example.com');
    });
  });

  describe('POST /login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: '123',
        username: 'Test User',
        email: 'test@example.com',
      };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { 
          user: { id: '123' },
          session: { access_token: 'valid-token' }
        },
        error: null,
      });

      User.findByPk.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  describe('GET /check', () => {
    it('should return user info if authenticated', async () => {
      const mockUser = {
        id: '123',
        username: 'Test User',
        email: 'test@example.com',
        role: 'user'
      };

      jwt.verify.mockReturnValue({ userId: '123', role: 'user' });
      User.findByPk.mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/api/auth/check')
        .set('Cookie', ['jwt=valid-token']);

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('test@example.com');
    });

    it('should return 401 if no token', async () => {
      const res = await request(app).get('/api/auth/check');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /profile', () => {
    it('should update user profile', async () => {
      const mockUser = {
        id: '123',
        username: 'Old Name',
        email: 'old@example.com',
        save: jest.fn(),
      };

      User.findByPk.mockResolvedValue(mockUser);

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer token') // Trigger mock middleware
        .send({
          username: 'New Name',
        });

      expect(res.statusCode).toBe(200);
      expect(mockUser.username).toBe('New Name');
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('DELETE /account', () => {
    it('should delete user account', async () => {
      const mockUser = {
        id: '123',
        destroy: jest.fn(),
      };

      User.findByPk.mockResolvedValue(mockUser);

      const res = await request(app)
        .delete('/api/auth/account')
        .set('Authorization', 'Bearer token'); // Trigger mock middleware

      expect(res.statusCode).toBe(200);
      expect(mockUser.destroy).toHaveBeenCalled();
    });
  });
});
