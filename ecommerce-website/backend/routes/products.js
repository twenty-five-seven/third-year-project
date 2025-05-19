const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { query, seller_id } = req.query;
  const searchQuery = query ? `%${query}%` : '%';
  
  // Different SQL based on whether we're filtering by seller_id
  let sql, params;
  
  if (seller_id) {
    // For sellers, only return their own products
    sql = 'SELECT * FROM Product WHERE name LIKE ? AND seller_id = ?';
    params = [searchQuery, seller_id];
  } else {
    // For buyers or admins, return all products
    sql = 'SELECT * FROM Product WHERE name LIKE ?';
    params = [searchQuery];
  }
  
  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).send('Error fetching products');
    res.status(200).send(result);
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM Product WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(result[0]);
  });
});

router.post('/add_product', (req, res) => {
  const { seller_id, name, description, price, category } = req.body;
  const query = 'INSERT INTO Product (id, seller_id, name, description, price, category) VALUES (UUID(), ?, ?, ?, ?, ?)';
  db.query(query, [seller_id, name, description, price, category], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send('Product added');
  });
});

router.put('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, seller_id } = req.body;
  
  // Require seller_id in the request
  if (!seller_id) {
    return res.status(400).json({ error: 'Missing seller_id in request' });
  }
  
  // First verify this seller owns the product
  const verifyOwnerQuery = 'SELECT seller_id FROM Product WHERE id = ?';
  db.query(verifyOwnerQuery, [id], (verifyErr, verifyResults) => {
    if (verifyErr) {
      return res.status(500).json({ error: 'Database error while verifying product ownership' });
    }
    
    if (verifyResults.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const productOwnerId = verifyResults[0].seller_id;
    
    // Check if the requester is the product owner
    if (productOwnerId !== seller_id) {
      return res.status(403).json({ error: 'Permission denied: You can only edit your own products' });
    }
    
    // Proceed with update if authorized
    const query = 'UPDATE Product SET name = ?, description = ?, price = ?, category = ? WHERE id = ?';
    db.query(query, [name, description, price, category, id], (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(200).send('Product updated');
    });
  });
});

// Similarly update the delete product route
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const { seller_id } = req.body; // Require seller_id in the request
  
  // First verify this seller owns the product
  const verifyOwnerQuery = 'SELECT seller_id FROM Product WHERE id = ?';
  db.query(verifyOwnerQuery, [id], (verifyErr, verifyResults) => {
    if (verifyErr) {
      return res.status(500).json({ error: 'Database error while verifying product ownership' });
    }
    
    if (verifyResults.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const productOwnerId = verifyResults[0].seller_id;
    
    // Check if the requester is the product owner
    if (productOwnerId !== seller_id) {
      return res.status(403).json({ error: 'Permission denied: You can only delete your own products' });
    }
    
    // Proceed with delete if authorized
    const query = 'DELETE FROM Product WHERE id = ?';
    db.query(query, [id], (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(200).send('Product deleted');
    });
  });
});

module.exports = router;