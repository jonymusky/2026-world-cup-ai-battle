import { expect, test } from '@playwright/test';

test('homepage loads', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: /2026 World Cup AI Battle/i })).toBeVisible();
});

test('leaderboard page loads', async ({ page }) => {
	await page.goto('/en/leaderboard');
	await expect(page.getByText('Claude Opus 4')).toBeVisible();
});

test('matches page loads', async ({ page }) => {
	await page.goto('/en/matches');
	await expect(page.getByText('Group Stage')).toBeVisible();
});

test('predictions page loads', async ({ page }) => {
	await page.goto('/en/predictions');
	await expect(page.getByText('GPT-4o')).toBeVisible();
});

test('language switcher works', async ({ page }) => {
	await page.goto('/en');
	await page.selectOption('select', 'es');
	await expect(page).toHaveURL(/\/es/);
});
