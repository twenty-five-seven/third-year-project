const request = require('supertest');
const express = require('express');
const cartRouter = require('../routes/cart');

// Mock DB module
jest.mock('../db', () => {
  const mockDb = {
    query: jest.fn((query, params, callback) => {
      if (query.includes('SELECT * FROM Product')) {
        callback(null, [{ id: 'product-123', price: 29.99 }]);
      } else if (query.includes('SELECT * FROM Cart')) {
        callback(null, [{ buyer_id: 'buyer-123' }]);
      } else if (query.includes('SELECT * FROM Cart_Product WHERE cart_id =')) {
        // Return empty array to indicate product is not in cart yet
        callback(null, []);
      } else if (query.includes('INSERT INTO Cart_Product')) {
        callback(null, { affectedRows: 1 });
      } else {
        callback(null, []);
      }
    }),
    execute: jest.fn()
  };
  return mockDb;
});

describe('Cart API', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/cart', cartRouter);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Close any open connections
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  test('should add a product to the cart', async () => {
    // Configure the mock for this test case specifically
    require('../db').query.mockImplementationOnce((query, params, callback) => {
      if (query.includes('SELECT * FROM Product')) {
        callback(null, [{ id: 'product-123', price: 29.99 }]);
      }
    }).mockImplementationOnce((query, params, callback) => {
      if (query.includes('SELECT * FROM Cart')) {
        callback(null, [{ buyer_id: 'buyer-123' }]);
      }
    }).mockImplementationOnce((query, params, callback) => {
      if (query.includes('SELECT * FROM Cart_Product')) {
        // Return empty array to indicate product is not in cart yet
        callback(null, []);
      }
    }).mockImplementationOnce((query, params, callback) => {
      if (query.includes('INSERT INTO Cart_Product')) {
        callback(null, { affectedRows: 1 });
      }
    });

    const response = await request(app)
      .post('/api/cart/add')
      .send({
        buyer_id: 'buyer-123',
        product_id: 'product-123'
      });

    expect(response.status).toBe(201); // Correct status code should be 201 for created
    expect(response.body).toHaveProperty('message', 'Product added to cart successfully');
  }, 10000);
  
  test('should handle product already in cart', async () => {
    // Mock DB to simulate product already in cart
    require('../db').query.mockImplementationOnce((query, params, callback) => {
      if (query.includes('SELECT * FROM Product')) {
        callback(null, [{ id: 'product-123', price: 29.99 }]);
      }
    }).mockImplementationOnce((query, params, callback) => {
      if (query.includes('SELECT * FROM Cart')) {
        callback(null, [{ buyer_id: 'buyer-123' }]);
      }
    }).mockImplementationOnce((query, params, callback) => {
      if (query.includes('SELECT * FROM Cart_Product')) {
        // Return product already in cart
        callback(null, [{ buyer_id: 'buyer-123', product_id: 'product-123' }]);
      }
    });
    
    const response = await request(app)
      .post('/api/cart/add')
      .send({
        buyer_id: 'buyer-123',
        product_id: 'product-123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Product already in cart');
  }, 10000);
});