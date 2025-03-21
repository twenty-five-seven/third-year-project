const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/seller/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM Product WHERE seller_id = ?) AS productCount,
      (SELECT COUNT(*) FROM \`Order\` WHERE seller_id = ?) AS orderCount,
      (SELECT AVG(rating) FROM Review WHERE product_id IN (SELECT id FROM Product WHERE seller_id = ?)) AS averageRating
  `;
  db.query(query, [id, id, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(result[0]);
  });
});

router.get('/buyer/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM \`Order\` WHERE buyer_id = ?) AS orderCount,
      (SELECT COUNT(*) FROM Review WHERE buyer_id = ?) AS reviewCount
  `;
  db.query(query, [id, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(result[0]);
  });
});

module.exports = router;