import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '35.245.199.33',  
  user: 'tripapp',                    
  password: 'FinalProjectCS4750!',       
  database: 'trip_planner_db',
  ssl: {
    rejectUnauthorized: false // DEBUGGING (DELETE LATER)
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;