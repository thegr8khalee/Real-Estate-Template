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

jest.unstable_mockModule('../src/models/property.model.js', () => ({
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/blog.model.js', () => ({
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/news.model.js', () => ({
  default: {
    count: jest.fn(),
    findAll: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/broadcast.model.js', () => ({
  default: {
    count: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/lib/cloudinary.js', () => ({
  default: {
    uploader: {
      upload: jest.fn(),
    },
    api: {
      delete_resources: jest.fn(),
    },
  },
}));

jest.unstable_mockModule('../src/services/gmail.service.js', () => ({
  sendEmail: jest.fn(),
}));

// Import mocked modules
const Property = (await import('../src/models/property.model.js')).default;
const Blog = (await import('../src/models/blog.model.js')).default;
const Newsletter = (await import('../src/models/news.model.js')).default;
const NewsletterBroadcast = (await import('../src/models/broadcast.model.js')).default;
const cloudinary = (await import('../src/lib/cloudinary.js')).default;
const { sendEmail } = await import('../src/services/gmail.service.js');
const { 
  addProperty, 
  updateProperty, 
  deleteProperty,
  addBlog,
  updateBlog,
  deleteBlog,
  getNewsletterStats,
  getRecentBroadcasts,
  sendNewsletter
} = await import('../src/controllers/admin.operations.controller.js');

const app = express();
app.use(express.json());

// Mock admin middleware
const mockAdminMiddleware = (req, res, next) => {
  req.admin = { id: 'admin123', role: 'super_admin' };
  next();
};

app.post('/api/admin/properties', addProperty);
app.put('/api/admin/properties/:id', updateProperty);
app.delete('/api/admin/properties/:id', deleteProperty);
app.post('/api/admin/blogs', addBlog);
app.put('/api/admin/blogs/:id', updateBlog);
app.delete('/api/admin/blogs/:id', deleteBlog);
app.get('/api/admin/newsletter/stats', getNewsletterStats);
app.get('/api/admin/newsletter/broadcasts', getRecentBroadcasts);
app.post('/api/admin/newsletter/send', mockAdminMiddleware, sendNewsletter);

describe('Admin Operations Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /properties', () => {
    it('should add a new property', async () => {
      const mockProperty = {
        title: 'Test Property',
        description: 'Desc',
        price: 100000,
        address: '123 Main St',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        type: 'House',
      };

      Property.create.mockResolvedValue({ ...mockProperty, id: 1 });
      cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'url', public_id: 'id' });

      const res = await request(app).post('/api/admin/properties').send({
        ...mockProperty,
        images: ['data:image/png;base64,abc'],
      });

      expect(res.statusCode).toBe(201);
      expect(Property.create).toHaveBeenCalled();
    });
  });

  describe('PUT /properties/:id', () => {
    it('should update a property', async () => {
      const mockProperty = { id: 1, update: jest.fn(), images: [] };
      Property.findByPk.mockResolvedValue(mockProperty);

      const res = await request(app).put('/api/admin/properties/1').send({ title: 'New Title' });

      expect(res.statusCode).toBe(200);
      expect(mockProperty.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /properties/:id', () => {
    it('should delete a property', async () => {
      Property.destroy.mockResolvedValue(1);

      const res = await request(app).delete('/api/admin/properties/1');

      expect(res.statusCode).toBe(200);
    });
  });

  describe('POST /blogs', () => {
    it('should add a new blog', async () => {
      Blog.create.mockResolvedValue({ id: 1, title: 'Blog' });
      cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'url' });

      const res = await request(app).post('/api/admin/blogs').send({ title: 'Blog' });

      expect(res.statusCode).toBe(201);
    });
  });

  describe('GET /newsletter/stats', () => {
    it('should return newsletter stats', async () => {
      Newsletter.count.mockResolvedValue(10);
      NewsletterBroadcast.count.mockResolvedValue(5);

      const res = await request(app).get('/api/admin/newsletter/stats');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalSubscribers).toBe(10);
    });
  });

  describe('POST /newsletter/send', () => {
    it('should send newsletter', async () => {
      Newsletter.findAll.mockResolvedValue([{ email: 'test@example.com' }]);
      NewsletterBroadcast.create.mockResolvedValue({ id: 1, update: jest.fn() });
      sendEmail.mockResolvedValue(true);

      const res = await request(app).post('/api/admin/newsletter/send').send({
        subject: 'Subject',
        content: 'Content',
      });

      expect(res.statusCode).toBe(200);
      expect(sendEmail).toHaveBeenCalled();
    });
  });
});
