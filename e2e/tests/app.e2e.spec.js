import { test, expect } from '@playwright/test';
import { waitForDb, resetDb } from '../utils/resetDb.js';

test.beforeAll(async () => {
  process.env.DB_HOST = '127.0.0.1';
  process.env.DB_PORT = '3307';
  process.env.DB_USER = 'test_user';
  process.env.DB_PASSWORD = 'test_password';
  process.env.DB_NAME = 'our_shelves_test';
  await waitForDb();
});

test.beforeEach(async () => {
  await resetDb();
});

// Flow 1: Search → Add → View in Library
test('Search for a book, add it, and view it in Library', async ({ page }) => {

  await page.goto('/');
  await page.getByPlaceholder('Search by title, author, or genre...').fill('Dune');
  await page.getByRole('button', { name: /search/i }).first().click();
  await expect(page.getByText(/search results/i)).toBeVisible();

  const detail = page.getByRole('link', { name: /open book|details/i }).first()
    .or(page.getByRole('button', { name: /open book|details/i }).first());
  await detail.click();

  await page.getByRole('button', { name: /add book to library|add to library|save/i }).click();

  await page.getByRole('link', { name: /library/i }).click();

  await expect(page.getByRole('heading', { name: /dune/i }).first()).toBeVisible();
});

// Flow 2: Delete from Library
test('Delete a book from the Library', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder('Search by title, author, or genre...').fill('Dune');
  await page.getByRole('button', { name: /search/i }).first().click();
  await page.getByRole('link', { name: /open book|details/i }).first().click();
  await page.getByRole('button', { name: /add book to library|add to library|save/i }).click();
  await page.getByRole('link', { name: /library/i }).click();

  const duneCard = page.locator('[data-testid="book-card"], article, div')
    .filter({ hasText: /dune/i })
    .first();

  await expect(duneCard).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());

  await duneCard.getByRole('button', { name: /delete|remove/i }).click();

  await Promise.race([
    duneCard.waitFor({ state: 'detached', timeout: 5000 }),
    (async () => { await expect(duneCard).toBeHidden({ timeout: 5000 }); })()
  ]);

  await expect(duneCard).toHaveCount(0);
});


