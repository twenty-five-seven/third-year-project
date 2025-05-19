const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/make', (req, res) => {
  const { order_id, amount, method } = req.body;
  
  if (!order_id || !amount || !method) {
    return res.status(400).json({ error: 'Missing required payment information' });
  }
  
  // First verify the order exists
  const checkOrderQuery = 'SELECT * FROM `Order` WHERE id = ?';
  db.query(checkOrderQuery, [order_id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error checking order:', checkErr);
      return res.status(500).json({ error: 'Database error while checking order' });
    }
    
    if (checkResult.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Now process the payment
    const query = 'INSERT INTO Payment (id, order_id, amount, method) VALUES (UUID(), ?, ?, ?)';
    db.query(query, [order_id, amount, method], (err, result) => {
      if (err) {
        console.error('Error processing payment:', err);
        return res.status(500).json({ error: 'Database error while processing payment' });
      }
      
      // Update order status to Paid
      const updateOrderQuery = 'UPDATE `Order` SET status = "Paid" WHERE id = ?';
      // In the payments handler, update the response to include paymentId
      db.query(query, [order_id, amount, method], (err, result) => {
        if (err) return res.status(500).send(err);
        
        // Generate a UUID for the payment
        const paymentId = require('uuid').v4();
        
        res.status(201).json({ 
          message: 'Payment processed successfully',
          paymentId: paymentId
        });
      });
    });
  });
});

module.exports = router;