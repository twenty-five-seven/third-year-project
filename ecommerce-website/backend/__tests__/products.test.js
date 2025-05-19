const request = require('supertest');
const express = require('express');
const productRoutes = require('../routes/products');

// Mock the database module
jest.mock('../db', () => ({
  query: jest.fn()
}));

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch products with search query', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', price: 10.99 },
      { id: '2', name: 'Product 2', price: 19.99 }
    ];

    // Mock db response
    const db = require('../db');
    db.query.mockImplementation((query, params, callback) => {
      callback(null, mockProducts);
    });

    const response = await request(app)
      .get('/api/products')
      .query({ query: 'Product' });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockProducts);
    expect(db.query).toHaveBeenCalledTimes(1);
    
    // Check SQL includes the search term
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('name LIKE ?');
    expect(params[0]).toBe('%Product%');
  });

  test('should fetch products filtered by seller_id', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', seller_id: 'seller-123' },
    ];

    // Mock db response
    const db = require('../db');
    db.query.mockImplementation((query, params, callback) => {
      callback(null, mockProducts);
    });

    const response = await request(app)
      .get('/api/products')
      .query({ seller_id: 'seller-123' });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockProducts);
    
    // Verify query includes seller_id
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('seller_id = ?');
    expect(params).toContain('seller-123');
  });
});