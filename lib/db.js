import mysql from 'mysql2/promise';

// Check if we're running in Cloud Run (production)
const isProduction = process.env.NODE_ENV === 'production';

const pool = mysql.createPool(
  isProduction
    ? {
        // Cloud Run: Use Unix socket
        socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      }
    : {
        // Local development: Use public IP
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
          rejectUnauthorized: false
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      }
);

export default pool;