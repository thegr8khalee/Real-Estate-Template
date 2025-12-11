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

jest.unstable_mockModule('../src/models/blog.model.js', () => ({
  default: {
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/property.model.js', () => ({
  default: {
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/comment.model.js', () => ({
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/review.model.js', () => ({
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule('../src/models/user.model.js', () => ({
  default: {
    findByPk: jest.fn(),
  },
}));

// Import mocked modules
const Blog = (await import('../src/models/blog.model.js')).default;
const Comment = (await import('../src/models/comment.model.js')).default;
const { viewBlog, commentBlog, updateComment } = await import('../src/controllers/interactions.controller.js');

const app = express();
app.use(express.json());

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 'user123', username: 'User' };
  next();
};

app.get('/api/blogs/:id/view', viewBlog);
app.post('/api/blogs/:id/comments', mockAuthMiddleware, commentBlog);
app.put('/api/comments/:id', mockAuthMiddleware, updateComment);

describe('Interactions Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /blogs/:id/view', () => {
    it('should increment view count', async () => {
      const mockBlog = { id: 1, viewCount: 0, save: jest.fn() };
      Blog.findByPk.mockResolvedValue(mockBlog);

      const res = await request(app).get('/api/blogs/1/view');

      expect(res.statusCode).toBe(200);
      expect(mockBlog.viewCount).toBe(1);
      expect(mockBlog.save).toHaveBeenCalled();
    });
  });

  describe('POST /blogs/:id/comments', () => {
    it('should add a comment', async () => {
      Blog.findByPk.mockResolvedValue({ id: 1 });
      Comment.create.mockResolvedValue({ id: 1, content: 'Comment' });

      const res = await request(app).post('/api/blogs/1/comments').send({ content: 'Comment' });

      expect(res.statusCode).toBe(201);
      expect(Comment.create).toHaveBeenCalled();
    });
  });

  describe('PUT /comments/:id', () => {
    it('should update a comment', async () => {
      const mockComment = { id: 1, userId: 'user123', update: jest.fn() };
      Comment.findByPk.mockResolvedValue(mockComment);

      const res = await request(app).put('/api/comments/1').send({ content: 'Updated' });

      expect(res.statusCode).toBe(200);
      expect(mockComment.update).toHaveBeenCalled();
    });
  });
});
