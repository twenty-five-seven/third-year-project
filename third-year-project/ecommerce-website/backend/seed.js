const db = require('./db');
const bcrypt = require('bcrypt');

const seedData = async () => {
  try {
    // Create database tables if they don't exist
    console.log('Creating database schema...');
    
    // Use standard callback approach since the db connection is already established
    await new Promise((resolve, reject) => {
      db.query('CREATE TABLE IF NOT EXISTS User (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL)', 
        (err) => err ? reject(err) : resolve());
    });

    // Add Admin table creation after User table creation
    await new Promise((resolve, reject) => {
      db.query('CREATE TABLE IF NOT EXISTS Admin (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255) NOT NULL, FOREIGN KEY (user_id) REFERENCES User(id))', 
        (err) => err ? reject(err) : resolve());
    });
    
    await new Promise((resolve, reject) => {
      db.query('CREATE TABLE IF NOT EXISTS Seller (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255) NOT NULL, FOREIGN KEY (user_id) REFERENCES User(id))', 
        (err) => err ? reject(err) : resolve());
    });
    
    await new Promise((resolve, reject) => {
      db.query('CREATE TABLE IF NOT EXISTS Buyer (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255) NOT NULL, FOREIGN KEY (user_id) REFERENCES User(id))', 
        (err) => err ? reject(err) : resolve());
    });
    
    await new Promise((resolve, reject) => {
      db.query('CREATE TABLE IF NOT EXISTS Product (id VARCHAR(255) PRIMARY KEY, seller_id VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, description TEXT, price DOUBLE NOT NULL, category VARCHAR(255), FOREIGN KEY (seller_id) REFERENCES Seller(id))', 
        (err) => err ? reject(err) : resolve());
    });
    
    // In the function where you create the Order table, update it to include created_at:
    await new Promise((resolve, reject) => {
      db.query('CREATE TABLE IF NOT EXISTS `Order` (id VARCHAR(255) PRIMARY KEY, buyer_id VARCHAR(255) NOT NULL, seller_id VARCHAR(255) NOT NULL, status VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (buyer_id) REFERENCES Buyer(id), FOREIGN KEY (seller_id) REFERENCES Seller(id))', 
        (err) => err ? reject(err) : resolve());
    });
    
    await new Promise((resolve, reject) => {
      db.query('CREATE TABLE IF NOT EXISTS Order_Product (order_id VARCHAR(255) NOT NULL, product_id VARCHAR(255) NOT NULL, PRIMARY KEY (order_id, product_id), FOREIGN KEY (order_id) REFERENCES `Order`(id), FOREIGN KEY (product_id) REFERENCES Product(id))', 
        (err) => err ? reject(err) : resolve());
    });
    
    await new Promise((resolve, reject) => {
      db.query('CREATE TABLE IF NOT EXISTS Payment (id VARCHAR(255) PRIMARY KEY, order_id VARCHAR(255) NOT NULL, amount DOUBLE NOT NULL, method VARCHAR(255) NOT NULL, FOREIGN KEY (order_id) REFERENCES `Order`(id))', 
        (err) => err ? reject(err) : resolve());
    });
    
    await new Promise((resolve, reject) => {
      db.query('CREATE TABLE IF NOT EXISTS Review (id VARCHAR(255) PRIMARY KEY, buyer_id VARCHAR(255) NOT NULL, product_id VARCHAR(255) NOT NULL, rating INT NOT NULL, comment TEXT, FOREIGN KEY (buyer_id) REFERENCES Buyer(id), FOREIGN KEY (product_id) REFERENCES Product(id))', 
        (err) => err ? reject(err) : resolve());
    });
    
    await new Promise((resolve, reject) => {
      db.query('CREATE TABLE IF NOT EXISTS Inquiry (id VARCHAR(255) PRIMARY KEY, buyer_id VARCHAR(255) NOT NULL, seller_id VARCHAR(255) NOT NULL, message TEXT NOT NULL, FOREIGN KEY (buyer_id) REFERENCES Buyer(id), FOREIGN KEY (seller_id) REFERENCES Seller(id))', 
        (err) => err ? reject(err) : resolve());
    });
    
    await new Promise((resolve, reject) => {
      db.query('CREATE TABLE IF NOT EXISTS Cart (buyer_id VARCHAR(255) PRIMARY KEY, FOREIGN KEY (buyer_id) REFERENCES Buyer(id))', 
        (err) => err ? reject(err) : resolve());
    });
    
    await new Promise((resolve, reject) => {
      db.query('CREATE TABLE IF NOT EXISTS Cart_Product (cart_id VARCHAR(255) NOT NULL, product_id VARCHAR(255) NOT NULL, PRIMARY KEY (cart_id, product_id), FOREIGN KEY (cart_id) REFERENCES Cart(buyer_id), FOREIGN KEY (product_id) REFERENCES Product(id))', 
        (err) => err ? reject(err) : resolve());
    });
    
    await new Promise((resolve, reject) => {
      db.query('CREATE TABLE IF NOT EXISTS Image (id VARCHAR(255) PRIMARY KEY, product_id VARCHAR(255) NOT NULL, url TEXT NOT NULL, FOREIGN KEY (product_id) REFERENCES Product(id))', 
        (err) => err ? reject(err) : resolve());
    });
    
    console.log('Schema created successfully');

    // Check if we already have seed data
    let hasData = false;
    await new Promise((resolve, reject) => {
      db.query('SELECT COUNT(*) as count FROM User', (err, result) => {
        if (err) {
          reject(err);
        } else {
          hasData = result[0].count > 0;
          resolve();
        }
      });
    });

    if (hasData) {
      console.log('Database already has seed data. Skipping seeding process.');
      return;
    }

    // Step 2: Populate the Database
    console.log('Populating database with seed data...');
    
    // Hash passwords
    const hashedPassword1 = await bcrypt.hash("password123", 10);
    const hashedPassword2 = await bcrypt.hash("password123", 10);

    // Then in the populate section, after inserting users:
    // Insert users
    const johnId = await executeQueryAndGetId(
      'INSERT INTO User (id, name, email, password) VALUES (UUID(), ?, ?, ?)',
      ["John Doe", "john@example.com", hashedPassword1]
    );

    const janeId = await executeQueryAndGetId(
      'INSERT INTO User (id, name, email, password) VALUES (UUID(), ?, ?, ?)',
      ["Jane Smith", "jane@example.com", hashedPassword2]
    );

    // Add admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminId = await executeQueryAndGetId(
      'INSERT INTO User (id, name, email, password) VALUES (UUID(), ?, ?, ?)',
      ["Admin User", "admin@admin", adminPassword]
    );

    // Add admin record
    const adminRoleId = await executeQueryAndGetId(
      'INSERT INTO Admin (id, user_id) VALUES (UUID(), ?)', 
      [adminId]
    );

    // Insert seller and buyer
    const johnSellerId = await executeQueryAndGetId(
      'INSERT INTO Seller (id, user_id) VALUES (UUID(), ?)', 
      [johnId]
    );

    const janeBuyerId = await executeQueryAndGetId(
      'INSERT INTO Buyer (id, user_id) VALUES (UUID(), ?)', 
      [janeId]
    );

    // Insert cart for the buyer
    await executeQuery(
      'INSERT INTO Cart (buyer_id) VALUES (?)', 
      [janeBuyerId]
    );

    // Insert products
    const product1Id = await executeQueryAndGetId(
      'INSERT INTO Product (id, seller_id, name, description, price, category) VALUES (UUID(), ?, ?, ?, ?, ?)',
      [johnSellerId, "Product 1", "Description for product 1", 10.0, "Category 1"]
    );
    
    const product2Id = await executeQueryAndGetId(
      'INSERT INTO Product (id, seller_id, name, description, price, category) VALUES (UUID(), ?, ?, ?, ?, ?)',
      [johnSellerId, "Product 2", "Description for product 2", 20.0, "Category 2"]
    );
    
    const product3Id = await executeQueryAndGetId(
      'INSERT INTO Product (id, seller_id, name, description, price, category) VALUES (UUID(), ?, ?, ?, ?, ?)',
      [johnSellerId, "Product 3", "Description for product 3", 30.0, "Category 3"]
    );

    // Add a product to the cart
    await executeQuery(
      'INSERT INTO Cart_Product (cart_id, product_id) VALUES (?, ?)', 
      [janeBuyerId, product1Id]
    );

    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Error during database operations:', error);
    throw error; // Rethrow to handle in caller
  }
};

// Helper function to execute query and get ID of inserted record
async function executeQueryAndGetId(sql, params) {
  return new Promise((resolve, reject) => {
    // Generate a UUID beforehand so we know exactly what we're inserting
    const uuid = require('crypto').randomUUID();
    
    // Replace UUID() in the SQL with our specific UUID
    const modifiedSql = sql.replace('UUID()', '?');
    const modifiedParams = [uuid, ...params];
    
    db.query(modifiedSql, modifiedParams, (err, result) => {
      if (err) {
        reject(err);
      } else {
        // Simply return the UUID we generated and used
        resolve(uuid);
      }
    });
  });
}

// Helper function to execute a query
async function executeQuery(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Function to clean database
async function cleanupDatabase() {
  try {
    // Drop tables in reverse order of dependencies
    const tables = [
      'Cart_Product', 
      'Image',
      'Payment',
      'Order_Product',
      'Review',
      'Inquiry',
      'Cart',
      '`Order`',
      'Product',
      'Seller',
      'Buyer',
      'Admin', // Added Admin table here
      'User'
    ];

    console.log('Cleaning up database...');
    
    for (const table of tables) {
      await new Promise((resolve, reject) => {
        db.query(`DROP TABLE IF EXISTS ${table}`, (err) => {
          if (err) {
            console.error(`Error dropping ${table}:`, err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    
    console.log('Database cleanup complete!');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  }
}

// Export the functions
module.exports = seedData;
module.exports.cleanupDatabase = cleanupDatabase;

// Execute if this file is run directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('Seed operation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed operation failed:', error);
      process.exit(1);
    });
}