const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/message', (req, res) => {
  const { buyer_id, seller_id, message } = req.body;
  const query = 'INSERT INTO Inquiry (id, buyer_id, seller_id, message) VALUES (UUID(), ?, ?, ?)';
  db.query(query, [buyer_id, seller_id, message], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).send('Message sent');
  });
});

module.exports = router;