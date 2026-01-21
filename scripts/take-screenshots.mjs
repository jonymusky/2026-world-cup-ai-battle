import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotsDir = join(__dirname, '..', 'public', 'screenshots');

async function takeScreenshots() {
	await mkdir(screenshotsDir, { recursive: true });

	const browser = await chromium.launch();
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		deviceScaleFactor: 2,
	});
	const page = await context.newPage();

	const baseUrl = process.env.BASE_URL || 'http://localhost:3457';

	console.log('Taking screenshots...');

	// Home page
	console.log('1. Home page...');
	await page.goto(`${baseUrl}/en`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(1000);
	await page.screenshot({ path: join(screenshotsDir, 'home.png') });

	// Leaderboard
	console.log('2. Leaderboard...');
	await page.goto(`${baseUrl}/en/leaderboard`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(500);
	await page.screenshot({ path: join(screenshotsDir, 'leaderboard.png') });

	// Predictions
	console.log('3. Predictions...');
	await page.goto(`${baseUrl}/en/predictions`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(500);
	await page.screenshot({ path: join(screenshotsDir, 'predictions.png') });

	// Model predictions (Claude Opus 4.5)
	console.log('4. Model predictions (Claude Opus 4.5)...');
	await page.goto(`${baseUrl}/en/predictions/claude-opus-4.5`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(500);
	await page.screenshot({ path: join(screenshotsDir, 'model-predictions.png') });

	// Team predictions (Argentina)
	console.log('5. Team predictions (Argentina)...');
	await page.goto(`${baseUrl}/en/predictions/by-team/arg`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(500);
	await page.screenshot({ path: join(screenshotsDir, 'team-predictions.png') });

	// Click on a prediction to show modal
	console.log('6. Prediction modal...');
	try {
		// Hide NextJS dev overlay
		await page.evaluate(() => {
			const overlay = document.querySelector('nextjs-portal');
			if (overlay) overlay.style.display = 'none';
		});
		const predictionCard = page.locator('button.w-full').first();
		if (await predictionCard.isVisible({ timeout: 2000 })) {
			await predictionCard.click({ timeout: 5000 });
			await page.waitForTimeout(500);
			await page.screenshot({ path: join(screenshotsDir, 'prediction-modal.png') });
		}
	} catch (e) {
		console.log('  Modal screenshot skipped:', e.message);
	}

	// Matches
	console.log('7. Matches...');
	await page.goto(`${baseUrl}/en/matches`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(500);
	await page.screenshot({ path: join(screenshotsDir, 'matches.png') });

	await browser.close();
	console.log('Screenshots saved to public/screenshots/');
}

takeScreenshots().catch(console.error);
