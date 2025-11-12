import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.test' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wait for MySQL to accept connections (helpful right after docker compose up)
async function waitForDb(retries = 40, delayMs = 500) {
  while (retries-- > 0) {
    try {
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3307,
        user: process.env.DB_USER || 'test_user',
        password: process.env.DB_PASSWORD || 'test_password',
      });
      await conn.end();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('MySQL did not become ready in time');
}

// Read and concatenate all .sql files in backend/init/sql (sorted)
function loadSql() {
  const sqlDir = path.join(__dirname, '..', 'init', 'sql'); // backend/init/sql
  if (!fs.existsSync(sqlDir) || !fs.statSync(sqlDir).isDirectory()) {
    throw new Error(`Expected SQL folder at: ${sqlDir}`);
  }
  const files = fs
    .readdirSync(sqlDir)
    .filter((f) => f.toLowerCase().endsWith('.sql'))
    .sort();
  if (files.length === 0) {
    throw new Error(`No .sql files found in ${sqlDir}`);
  }
  return files
    .map((f) => fs.readFileSync(path.join(sqlDir, f), 'utf8'))
    .join('\n;\n');
}

async function resetDb() {
  const sql = loadSql();
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER || 'test_user',
    password: process.env.DB_PASSWORD || 'test_password',
    multipleStatements: true,
  });
  const dbName = process.env.DB_NAME || 'our_shelves_test';
  await conn.query(
    `DROP DATABASE IF EXISTS \`${dbName}\`; CREATE DATABASE \`${dbName}\`;`
  );
  await conn.changeUser({ database: dbName });
  await conn.query(sql);
  await conn.end();
}

beforeAll(async () => {
  await waitForDb();
});

beforeEach(async () => {
  await resetDb();
});
