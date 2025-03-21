const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper function to execute DB queries as promises
const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Get cart items
router.get('/:buyer_id', async (req, res) => {
  try {
    const { buyer_id } = req.params;
    
    if (!buyer_id) {
      return res.status(400).json({ error: 'Missing buyer_id parameter' });
    }
    
    // First check if cart exists
    const cartCheck = await executeQuery('SELECT * FROM Cart WHERE buyer_id = ?', [buyer_id]);
    
    if (cartCheck.length === 0) {
      // Create a cart if it doesn't exist
      await executeQuery('INSERT INTO Cart (buyer_id) VALUES (?)', [buyer_id]);
      console.log(`Created cart for buyer ${buyer_id}`);
      return res.status(200).json([]); // Return empty cart
    }
    
    // Get cart items
    const items = await executeQuery(`
      SELECT p.id, p.name, p.description, p.price, p.category
      FROM Cart_Product cp
      JOIN Product p ON cp.product_id = p.id
      WHERE cp.cart_id = ?
    `, [buyer_id]);
    
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { buyer_id, product_id } = req.body;
    
    // Validate required fields
    if (!buyer_id || !product_id) {
      return res.status(400).json({ error: 'Missing required fields: buyer_id and product_id are required' });
    }

    // Check if product exists
    const productCheck = await executeQuery('SELECT * FROM Product WHERE id = ?', [product_id]);
    if (productCheck.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // First check if a cart exists for this buyer
    const cartCheck = await executeQuery('SELECT * FROM Cart WHERE buyer_id = ?', [buyer_id]);
    
    // If no cart exists yet, create one
    if (cartCheck.length === 0) {
      await executeQuery('INSERT INTO Cart (buyer_id) VALUES (?)', [buyer_id]);
      console.log(`Created cart for buyer ${buyer_id}`);
    }
    
    // Check if the product is already in the cart
    const existingItem = await executeQuery(
      'SELECT * FROM Cart_Product WHERE cart_id = ? AND product_id = ?',
      [buyer_id, product_id]
    );
    
    if (existingItem.length > 0) {
      return res.status(200).json({ message: 'Product already in cart' });
    }
    
    // Add the product to the cart
    await executeQuery(
      'INSERT INTO Cart_Product (cart_id, product_id) VALUES (?, ?)',
      [buyer_id, product_id]
    );
    
    res.status(201).json({ message: 'Product added to cart successfully' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add product to cart' });
  }
});

// Remove item from cart
router.delete('/remove', async (req, res) => {
  try {
    const { buyer_id, product_id } = req.body;
    
    if (!buyer_id || !product_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    await executeQuery(
      'DELETE FROM Cart_Product WHERE cart_id = ? AND product_id = ?',
      [buyer_id, product_id]
    );
    
    res.status(200).json({ message: 'Product removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove product from cart' });
  }
});

module.exports = router;