const mysql = require('mysql2');

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
