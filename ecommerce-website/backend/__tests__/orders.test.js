const request = require('supertest');
const express = require('express');
const ordersRouter = require('../routes/orders');

// Update the crypto mock to include createHash
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'test-order-uuid'),
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocked-hash')
  }))
}));

// Mock DB module
jest.mock('../db', () => {
  const mockDb = {
    query: jest.fn((query, params, callback) => {
      if (query.includes('SELECT id, seller_id FROM Product WHERE id IN')) {
        callback(null, [{ id: 'product-1', seller_id: 'seller-123' }]);
      } else if (query.includes('INSERT INTO `Order`')) {
        callback(null, { insertId: 1 });
      } else if (query.includes('INSERT INTO Order_Product')) {
        callback(null, { affectedRows: 1 });
      } else if (query.includes('DELETE FROM Cart_Product')) {
        callback(null, { affectedRows: 1 });
      } else {
        callback(null, []);
      }
    }),
    execute: jest.fn()
  };
  return mockDb;
});

describe('Order API', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/orders', ordersRouter);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Close any open connections
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  // Make sure the routes endpoints match the actual routes in the application
  test('should place an order successfully', async () => {
    const response = await request(app)
      .post('/api/orders/place') // Make sure this matches your actual route path
      .send({
        buyer_id: 'buyer-123',
        products: [{ id: 'product-1' }]
      });

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Order placed successfully');
    expect(response.body).toHaveProperty('orderId', 'test-order-uuid');
  });

  test('should return 400 if products array is empty', async () => {
    const response = await request(app)
      .post('/api/orders/place') // Make sure this matches your actual route path
      .send({
        buyer_id: 'buyer-123',
        products: []
      });

    // Assertions
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'No products in cart');
  });
});