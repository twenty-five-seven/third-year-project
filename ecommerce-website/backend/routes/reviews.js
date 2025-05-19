const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/leave', (req, res) => {
  const { buyer_id, product_id, rating, comment } = req.body;
  const query = 'INSERT INTO Review (id, buyer_id, product_id, rating, comment) VALUES (UUID(), ?, ?, ?, ?)';
  db.query(query, [buyer_id, product_id, rating, comment], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send('Review left');
  });
});

module.exports = router;