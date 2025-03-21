const request = require('supertest');
const express = require('express');
const paymentsRouter = require('../routes/payments');

// Mock UUID generation
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-payment-uuid')
}));

// Update the mock implementation to include the paymentId
jest.mock('../db', () => {
  const mockDb = {
    query: jest.fn((query, params, callback) => {
      if (query.includes('SELECT * FROM `Order` WHERE id')) {
        callback(null, [{ id: 'order-123', status: 'Processing' }]);
      } else if (query.includes('INSERT INTO Payment')) {
        callback(null, { insertId: 1, paymentId: 'test-payment-uuid' });
      } else if (query.includes('UPDATE `Order`')) {
        callback(null, { affectedRows: 1 });
      } else {
        callback(null, []);
      }
    }),
    execute: jest.fn()
  };
  return mockDb;
});

describe('Payment API', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/payments', paymentsRouter);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Close any open connections
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  test('should process payment successfully', async () => {
    const response = await request(app)
      .post('/api/payments/make')
      .send({
        order_id: 'order-123',
        amount: 99.99,
        method: 'Credit Card'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Payment processed successfully');
    expect(response.body).toHaveProperty('paymentId', 'test-payment-uuid');
  }, 10000); // Increase timeout to 10 seconds
});