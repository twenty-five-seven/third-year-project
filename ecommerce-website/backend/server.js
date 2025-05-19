const express = require('express');
const app = express();
const port = 3000;
const db = require('./db');
const { cleanupDatabase } = require('./seed');

app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const inquiryRoutes = require('./routes/inquiries');
const searchRoutes = require('./routes/search');
const dashboardRoutes = require('./routes/dashboard');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');

// Import and execute seed script
const seedData = require('./seed');
(async () => {
  console.log('Running seed script...');
  try {
    await seedData();
    console.log('Seed script completed.');
  } catch (err) {
    console.error('Seed script error:', err);
  }
})();

// Use routes
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Setup graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT signal. Shutting down gracefully...');
  
  try {
    await cleanupDatabase();
    console.log('Database cleanup completed.');
    
    // Close database connection
    db.end((err) => {
      if (err) {
        console.error('Error closing database connection:', err);
        process.exit(1);
      }
      console.log('Database connection closed.');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM signal. Shutting down gracefully...');
  
  try {
    await cleanupDatabase();
    console.log('Database cleanup completed.');
    
    // Close database connection
    db.end((err) => {
      if (err) {
        console.error('Error closing database connection:', err);
        process.exit(1);
      }
      console.log('Database connection closed.');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  
  try {
    await cleanupDatabase();
    console.log('Database cleanup completed.');
    
    // Close database connection
    db.end((err) => {
      if (err) {
        console.error('Error closing database connection:', err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('Error during cleanup after uncaught exception:', err);
    process.exit(1);
  }
});