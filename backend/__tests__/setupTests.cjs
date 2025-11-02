const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.test' });

function loadSql() {
  const dir = path.join(__dirname, '..', 'init', 'sql'); // backend/init/sql
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.sql'))
    .sort(); // optional, but nice for deterministic order
  if (files.length === 0) throw new Error(`No .sql files found in ${dir}`);
  return files.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n;\n');
}

async function waitForDb(retries = 30, delayMs = 500) {
  while (retries-- > 0) {
    try {
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });
      await conn.end();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('MySQL did not become ready in time');
}

async function resetDb() {
  const sql = loadSql();
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });
  await conn.query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\`; CREATE DATABASE \`${process.env.DB_NAME}\`;`);
  await conn.changeUser({ database: process.env.DB_NAME });
  await conn.query(sql);
  await conn.end();
}

beforeAll(async () => { await waitForDb(); });
beforeEach(async () => { await resetDb(); });
