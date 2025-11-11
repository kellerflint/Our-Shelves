import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  throw new Error('Database not ready for E2E tests');
}

function readSqlFolder(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  if (!files.length) throw new Error(`No .sql files found in ${dir}`);
  return files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n;\n');
}

export async function resetDb() {
  const sqlDir = path.resolve(__dirname, '../../backend/init/sql');
  const sql = readSqlFolder(sqlDir);
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER || 'test_user',
    password: process.env.DB_PASSWORD || 'test_password',
    multipleStatements: true,
  });
  const dbName = process.env.DB_NAME || 'our_shelves_test';
  await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\`; CREATE DATABASE \`${dbName}\`;`);
  await conn.changeUser({ database: dbName });
  await conn.query(sql);
  await conn.end();
}

export { waitForDb };
