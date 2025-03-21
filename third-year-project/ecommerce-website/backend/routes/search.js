const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/products', (req, res) => {
  const { query, category, minPrice, maxPrice } = req.query;
  let searchQuery = 'SELECT * FROM Product WHERE name LIKE ?';
  const params = [`%${query}%`];

  if (category) {
    searchQuery += ' AND category = ?';
    params.push(category);
  }

  if (minPrice) {
    searchQuery += ' AND price >= ?';
    params.push(minPrice);
  }

  if (maxPrice) {
    searchQuery += ' AND price <= ?';
    params.push(maxPrice);
  }

  db.query(searchQuery, params, (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(result);
  });
});

module.exports = router;