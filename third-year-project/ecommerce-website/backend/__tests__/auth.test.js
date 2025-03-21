const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRoutes = require('../routes/auth');

// Mock the database module
jest.mock('../db', () => ({
  query: jest.fn(),
  promise: jest.fn().mockReturnValue({
    query: jest.fn()
  })
}));

// Mock UUID generation
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid')
}));

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication API', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should register a new user successfully', async () => {
    // Mock bcrypt hash
    bcrypt.hash = jest.fn().mockResolvedValue('hashed-password');
    
    // Mock db responses for user creation
    const db = require('../db');
    db.query
      // Check email exists query
      .mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      })
      // Start transaction
      .mockImplementationOnce((query, params, callback) => {
        callback(null, {});
      })
      // Insert user
      .mockImplementationOnce((query, params, callback) => {
        callback(null, { insertId: 1 });
      })
      // Insert buyer
      .mockImplementationOnce((query, params, callback) => {
        callback(null, { insertId: 1 });
      })
      // Insert cart
      .mockImplementationOnce((query, params, callback) => {
        callback(null, { insertId: 1 });
      })
      // Commit transaction
      .mockImplementationOnce((query, params, callback) => {
        callback(null, {});
      });

    // Mock JWT sign
    jwt.sign = jest.fn().mockReturnValue('test-token');

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        userType: 'buyer'
      });

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token', 'test-token');
    expect(response.body).toHaveProperty('message');
    expect(response.body.user).toHaveProperty('name', 'Test User');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
  });
});