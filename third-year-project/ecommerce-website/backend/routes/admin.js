const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, checkAdmin } = require('../middleware/auth');

// Test endpoint for admin authentication
router.get('/verify', authenticateToken, checkAdmin, (req, res) => {
  res.status(200).json({ 
    message: 'Admin authentication successful', 
    adminId: req.user.adminId,
    userId: req.user.userId
  });
});

// Add this endpoint to fetch all users with their roles

// Get all users with their roles
router.get('/users', authenticateToken, checkAdmin, (req, res) => {
    const query = `
      SELECT u.id, u.name, u.email,
        CASE 
          WHEN a.id IS NOT NULL THEN 'admin'
          WHEN s.id IS NOT NULL THEN 'seller'
          WHEN b.id IS NOT NULL THEN 'buyer'
          ELSE 'unknown'
        END as role
      FROM User u
      LEFT JOIN Admin a ON u.id = a.user_id
      LEFT JOIN Seller s ON u.id = s.user_id
      LEFT JOIN Buyer b ON u.id = b.user_id
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({ error: 'Database error while fetching users' });
      }
      res.status(200).json(results);
    });
});

// Temporary endpoint without authentication for testing
router.get('/users-test', (req, res) => {
  const query = `
    SELECT u.id, u.name, u.email,
      CASE 
        WHEN a.id IS NOT NULL THEN 'admin'
        WHEN s.id IS NOT NULL THEN 'seller'
        WHEN b.id IS NOT NULL THEN 'buyer'
        ELSE 'unknown'
      END as role
    FROM User u
    LEFT JOIN Admin a ON u.id = a.user_id
    LEFT JOIN Seller s ON u.id = s.user_id
    LEFT JOIN Buyer b ON u.id = b.user_id
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Database error while fetching users' });
    }
    res.status(200).json(results);
  });
});

module.exports = router;