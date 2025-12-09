const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// SSL configuration for remote databases
const sslConfig = process.env.DB_SSL === 'true' ? {
    ca: fs.readFileSync(path.join(__dirname, '..', 'ca.pem'))
} : undefined;

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'restaurant_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,  // 10 seconds
    ssl: sslConfig
});

// Test connection on startup
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        console.error('Please check your database credentials and network connectivity');
    });

module.exports = pool;
