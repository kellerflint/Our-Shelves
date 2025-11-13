import mysql from "mysql2/promise";
import dotenv from "dotenv";

// loading environment variables (DB connection details)
dotenv.config();

// create a connection pool to the MySQL database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || process.env.MYSQL_USER,
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// test the database connection
pool.getConnection()
  .then(() => console.log("Database connected successfully"))
  .catch((err) => {
    console.error("Failed to connect to the database:", err.message);
    process.exit(1);
  });

export default pool;
