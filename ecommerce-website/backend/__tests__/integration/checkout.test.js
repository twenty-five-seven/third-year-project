const request = require('supertest');
const express = require('express');
const app = express();

// Import routes
const authRoutes = require('../../routes/auth');
const cartRoutes = require('../../routes/cart');
const orderRoutes = require('../../routes/orders');
const paymentRoutes = require('../../routes/payments');

// Mock crypto for UUID generation
// Update the crypto mock to include createHash
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid'),
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocked-hash')
  }))
}));

// Mock the database module
jest.mock('../../db', () => {
  const mockDb = {
    query: jest.fn((query, params, callback) => {
      // Add to cart - product exists check
      if (query.includes('SELECT * FROM Product WHERE id =')) {
        callback(null, [{ id: 'product-123', name: 'Test Product', price: 29.99, seller_id: 'seller-123' }]);
      } 
      // Add to cart - cart exists check
      else if (query.includes('SELECT * FROM Cart WHERE buyer_id =')) {
        callback(null, [{ buyer_id: 'buyer-123' }]);
      } 
      // Add to cart - check if product is already in cart
      else if (query.includes('SELECT * FROM Cart_Product WHERE cart_id =')) {
        callback(null, []);
      } 
      // Add to cart - insert product into cart
      else if (query.includes('INSERT INTO Cart_Product')) {
        callback(null, { affectedRows: 1 });
      } 
      // Place order - product check
      else if (query.includes('SELECT id, seller_id FROM Product WHERE id IN')) {
        callback(null, [{ id: 'product-123', seller_id: 'seller-123', price: 29.99 }]);
      } 
      // Place order - create order
      else if (query.includes('INSERT INTO `Order`')) {
        callback(null, { insertId: 1 });
      } 
      // Place order - link products to order
      else if (query.includes('INSERT INTO Order_Product')) {
        callback(null, { affectedRows: 1 });
      } 
      // Place order - clear cart
      else if (query.includes('DELETE FROM Cart_Product')) {
        callback(null, { affectedRows: 1 });
      } 
      // Make payment - check order exists
      else if (query.includes('SELECT * FROM `Order` WHERE id =')) {
        callback(null, [{ id: 'test-uuid', status: 'Processing' }]);
      }
      // Make payment - process payment
      else if (query.includes('INSERT INTO Payment')) {
        callback(null, { insertId: 1 });
      } 
      // Make payment - update order status
      else if (query.includes('UPDATE `Order`')) {
        callback(null, { affectedRows: 1 });
      } 
      else {
        callback(null, []);
      }
    }),
    promise: jest.fn().mockReturnValue({
      query: jest.fn()
    })
  };
  return mockDb;
});

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-jwt-token'),
  verify: jest.fn(() => ({ userId: 'user-123', buyerId: 'buyer-123' }))
}));

// Set up the Express app for testing
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { userId: 'user-123', buyerId: 'buyer-123' };
    next();
  },
  checkAdmin: (req, res, next) => next()
}));

describe('Checkout Flow Integration Test', () => {
  let authToken = 'fake-jwt-token';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Close any open connections
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  test('complete checkout flow: add to cart, place order, make payment', async () => {
    // Step 1: Add product to cart
    const cartResponse = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        buyer_id: 'buyer-123',
        product_id: 'product-123'
      });
    
    expect(cartResponse.status).toBe(201);
    expect(cartResponse.body).toHaveProperty('message', 'Product added to cart successfully');

    // Step 2: Place order
    const orderResponse = await request(app)
      .post('/api/orders/place')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        buyer_id: 'buyer-123',
        products: [{ id: 'product-123' }]
      });
    
    expect(orderResponse.status).toBe(201);
    expect(orderResponse.body).toHaveProperty('orderId', 'test-uuid');

    // Step 3: Make payment
    const paymentResponse = await request(app)
      .post('/api/payments/make')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        order_id: 'test-uuid',
        amount: 29.99,
        method: 'Credit Card'
      });
    
    expect(paymentResponse.status).toBe(201);
    expect(paymentResponse.body).toHaveProperty('message', 'Payment processed successfully');
    // Check for UUID in payment response
    expect(paymentResponse.body).toHaveProperty('paymentId');
  }, 20000);
});