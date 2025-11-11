import mysql from "mysql2/promise";
import dotenv from "dotenv";

// loading environment variables (DB connection details)
dotenv.config();

// create a connection pool to the MySQL database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


export default pool;
