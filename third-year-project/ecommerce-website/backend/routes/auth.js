const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid'); // Make sure to install uuid package

const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a secure key

// Helper function to execute DB queries as promises
const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    // Fetch user by email
    const [user] = await executeQuery('SELECT * FROM User WHERE email = ?', [email])
      .then(results => results.length ? results : [null]);
    
    if (!user) {
      console.log('Login failed: Invalid email');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password with hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is an admin
    const [adminResults] = await db.promise().query('SELECT id FROM Admin WHERE user_id = ?', [user.id]);
    const adminId = adminResults.length > 0 ? adminResults[0].id : null;

    // Check if user is a seller
    const sellerResults = await executeQuery('SELECT id FROM Seller WHERE user_id = ?', [user.id]);
    const sellerId = sellerResults.length > 0 ? sellerResults[0].id : null;
    
    // Check if user is a buyer
    const buyerResults = await executeQuery('SELECT id FROM Buyer WHERE user_id = ?', [user.id]);
    const buyerId = buyerResults.length > 0 ? buyerResults[0].id : null;
    
    // In the login route, after checking for user roles:

    // Update userType determination
    const userType = adminId ? 'admin' : (sellerId ? 'seller' : (buyerId ? 'buyer' : null));

    // Generate a JWT token
    // Update token payload
    const tokenPayload = { 
      userId: user.id, 
      email: user.email,
      name: user.name,
      sellerId,
      buyerId,
      adminId,
      userType
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    // Update response data
    res.status(200).json({ 
      message: 'Login successful', 
      token,
      user: {
        userId: user.id,
        name: user.name,
        email: user.email,
        userType,
        sellerId,
        buyerId,
        adminId
      }
    });

  } catch (error) {
    console.error('Server error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Registration route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    
    // Check if user with this email already exists
    const existingUsers = await executeQuery('SELECT * FROM User WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate UUIDs
    const userId = uuidv4();
    const sellerId = userType === 'seller' ? uuidv4() : null;
    const buyerId = uuidv4(); // All users get a buyer ID
    
    // Start a transaction to ensure data consistency
    await executeQuery('START TRANSACTION');
    
    try {
      // Insert user
      await executeQuery(
        'INSERT INTO User (id, name, email, password) VALUES (?, ?, ?, ?)', 
        [userId, name, email, hashedPassword]
      );
      
      // Create buyer record for all users
      await executeQuery(
        'INSERT INTO Buyer (id, user_id) VALUES (?, ?)',
        [buyerId, userId]
      );
      
      // Create cart for the buyer
      await executeQuery(
        'INSERT INTO Cart (buyer_id) VALUES (?)',
        [buyerId]
      );
      
      // If registering as a seller, create seller record
      if (userType === 'seller') {
        await executeQuery(
          'INSERT INTO Seller (id, user_id) VALUES (?, ?)',
          [sellerId, userId]
        );
      }
      
      // Commit transaction
      await executeQuery('COMMIT');
      
      // Generate token for auto-login
      const tokenPayload = {
        userId,
        name,
        email,
        sellerId,
        buyerId,
        adminId: null, // Add adminId (null for regular registrations)
        userType
      };
      
      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });
      
      res.status(201).json({
        message: `${userType === 'seller' ? 'Seller' : 'Buyer'} registered successfully`,
        token,
        user: {
          userId,
          name,
          email,
          userType,
          sellerId,
          buyerId,
          adminId: null
        }
      });
    } catch (error) {
      // Rollback transaction on error
      await executeQuery('ROLLBACK');
      throw error; // Rethrow to be caught by outer catch block
    }
  } catch (error) {
    console.error('Server error during registration:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Add this diagnostic endpoint
router.get('/check-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Find the user
    const [users] = await db.promise().query('SELECT id, name, email FROM User WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Check roles
    const [adminResults] = await db.promise().query('SELECT id FROM Admin WHERE user_id = ?', [user.id]);
    const [sellerResults] = await db.promise().query('SELECT id FROM Seller WHERE user_id = ?', [user.id]);
    const [buyerResults] = await db.promise().query('SELECT id FROM Buyer WHERE user_id = ?', [user.id]);
    
    res.json({
      user,
      roles: {
        isAdmin: adminResults.length > 0,
        isSeller: sellerResults.length > 0,
        isBuyer: buyerResults.length > 0
      }
    });
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;