import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e/tests',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:5173', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: 'cd backend && docker compose -f docker-compose.test.yml up -d', reuseExistingServer: true, timeout: 120000 },
    {
      command: 'cd backend && node server.js',
      env: {
        NODE_ENV: 'test',
        DB_HOST: '127.0.0.1',
        DB_PORT: '3307',
        DB_USER: 'test_user',
        DB_PASSWORD: 'test_password',
        DB_NAME: 'our_shelves_test',
        HOST: 'localhost',
        PORT: '3001',
      },
      port: 3001,
      reuseExistingServer: !process.env.CI,
      timeout: 90000,
    },
    {
      command: 'cd frontend && npm run dev',
      env: { VITE_API_URL: 'http://localhost:3001' },
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 90000,
    },
  ],
});
