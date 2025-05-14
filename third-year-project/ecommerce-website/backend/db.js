const mysql = require('mysql2');

// Store the current connection promise
let currentDbPromise = null;
let currentDbName = 'ecommerce';  // Changed hyphen to underscore

let host = 'localhost';
let user = 'sqluser';
let password = 'sqlpassword';

// First create a connection without specifying a database
const initialConnection = mysql.createConnection({
  host: host,
  user: user,
  password: password,
});

// Create the database if it doesn't exist
const setupDatabase = (dbName) => {
  return new Promise((resolve, reject) => {
    // Sanitize the database name to prevent SQL syntax errors
    // Replace hyphens with underscores
    const sanitizedDbName = dbName.replace(/-/g, '_');
    
    // Use backticks to properly quote the database name
    initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${sanitizedDbName}\``, (err) => {
      if (err) {
        console.error('Error creating database:', err);
        reject(err);
        return;
      }
      
      // Close the initial connection only if it's open
      if (initialConnection.state !== 'disconnected') {
        initialConnection.end();
      }
      
      // Create a new connection with the database specified
      const connection = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: sanitizedDbName
      });
      
      connection.connect((err) => {
        if (err) {
          console.error('Error connecting to the database:', err);
          reject(err);
          return;
        }
        console.log(`Connected to the MySQL database '${sanitizedDbName}'.`);
        resolve(connection);
      });
    });
  });
};

// Get or create the connection
const getDbConnection = (dbName = null) => {
  // If dbName is provided, sanitize it and use it to create a new connection
  let sanitizedDbName = null;
  if (dbName) {
    sanitizedDbName = dbName.replace(/-/g, '_');
  }
  
  if (sanitizedDbName && sanitizedDbName !== currentDbName) {
    // Close existing connection if there is one
    if (currentDbPromise) {
      currentDbPromise.then(conn => {
        if (conn && conn.state !== 'disconnected') {
          conn.end();
        }
      }).catch(err => console.error('Error closing previous connection:', err));
    }
    
    // Set the new database name and create a new connection
    currentDbName = sanitizedDbName;
    currentDbPromise = setupDatabase(sanitizedDbName);
    return currentDbPromise;
  }
  
  // If no dbName is provided or it's the same, use current connection or create default
  if (!currentDbPromise) {
    currentDbPromise = setupDatabase(currentDbName);
  }
  
  return currentDbPromise;
};

// Add promise method for use with async/await
const executeQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    getDbConnection().then(connection => {
      connection.query(sql, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }).catch(err => {
      reject(err);
    });
  });
};

// Export a wrapper that provides connection methods and the ability to specify a database
module.exports = {
  query: (sql, params, callback) => {
    // Handle case where params is the callback (optional parameters)
    if (typeof params === 'function' && !callback) {
      callback = params;
      params = [];
    }
    
    getDbConnection().then(connection => {
      connection.query(sql, params, (err, results) => {
        if (typeof callback === 'function') {
          callback(err, results);
        }
      });
    }).catch(err => {
      if (typeof callback === 'function') {
        callback(err);
      } else {
        console.error('Database error:', err);
      }
    });
  },
  
  // Add promise-based query method
  promise: () => {
    return {
      query: executeQuery
    };
  },
  
  end: (callback) => {
    if (!currentDbPromise) {
      if (typeof callback === 'function') callback();
      return;
    }
    
    currentDbPromise.then(connection => {
      connection.end(err => {
        currentDbPromise = null;
        if (typeof callback === 'function') callback(err);
      });
    }).catch(err => {
      currentDbPromise = null;
      if (typeof callback === 'function') callback(err);
      else console.error('Error ending database connection:', err);
    });
  },
  
  // Method to allow changing the database
  useDatabase: (dbName) => {
    // Sanitize the database name before using it
    const sanitizedDbName = dbName.replace(/-/g, '_');
    return getDbConnection(sanitizedDbName);
  }
};
