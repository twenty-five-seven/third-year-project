const mysql = require('mysql2');

// First create a connection without specifying a database
const initialConnection = mysql.createConnection({
  host: 'replace-by-your-host',
  user: 'replace-by-your-user',
  password: 'replace-by-your-user-password-for-sql'
});

// Create the database if it doesn't exist
initialConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  
  initialConnection.query('CREATE DATABASE IF NOT EXISTS ecommerce', (err) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }
    
    console.log('Database "ecommerce" is ready.');
    initialConnection.end();
    
    // Now connect to the database
    const connection = mysql.createConnection({
      host: 'replace-by-your-host',
      user: 'replace-by-your-user',
      password: 'replace-by-your-user-password-for-sql',
      database: 'ecommerce'
    });
    
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        return;
      }
      console.log('Connected to the MySQL database.');
    });
    
    module.exports = connection;
  });
});
