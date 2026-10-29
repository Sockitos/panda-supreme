import { expect, test } from '@playwright/test';

test('collects a coin from the home query only once', async ({ page }) => {
	await page.goto('/?coin=1');
	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByTestId('scanned-coin-dialog')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Flip coin 1 to show the front' })).toBeVisible();
	await page.getByRole('button', { name: 'Close' }).click();

	await page.goto('/?coin=1');
	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByText('Coin 1 is already in your collection.')).toBeVisible();
	await expect(page.getByTestId('balance')).toContainText('1');

	await page.goto('/');
	await expect(page.getByTestId('balance')).toContainText('1');
});

test('rejects a coin query outside 1 to 50 with a toast', async ({ page }) => {
	await page.goto('/?coin=99');
	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByText('That coin number is not valid.')).toBeVisible();
	await expect(page.getByTestId('scanned-coin-dialog')).toHaveCount(0);
});

test('opens collected coins in a flipping dialog and keeps unfound coins locked', async ({
	page
}) => {
	await page.goto('/?coin=2');
	await expect(page.getByTestId('scanned-coin-dialog')).toBeVisible();
	await page.getByRole('button', { name: 'Close' }).click();

	await page.goto('/collection');
	await page.getByTestId('coin-link-2').click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Coin 2' })).toBeAttached();
	await expect(page.getByRole('button', { name: 'Flip coin 2 to show the front' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Play coin 2' })).toHaveCount(0);

	await page.getByRole('button', { name: 'Close' }).click();
	await expect(page.getByTestId('coin-link-3')).toBeDisabled();
});

test('offers audio on every fifth coin', async ({ page }) => {
	await page.goto('/?coin=5');
	await expect(page.getByTestId('scanned-coin-dialog')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Play coin 5' })).toBeVisible();
});

test('opens the first moment and spends coins without losing progress', async ({ page }) => {
	for (let id = 1; id <= 10; id += 1) {
		await page.goto(`/?coin=${id}`);
		await expect(page.getByTestId('scanned-coin-dialog')).toBeVisible();
		await page.getByRole('button', { name: 'Close' }).click();
	}

	await expect(page.getByTestId('moment-title')).toHaveText('Sleep');
	await page.getByRole('button', { name: 'Enjoy moment' }).click();
	await expect(page.getByTestId('moment-reveal')).toHaveCount(0);

	await page.goto('/');
	await expect(page.getByText('Sleep', { exact: true })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Panda moment' }).first()).toBeVisible();

	await page.goto('/shop');
	await page.getByTestId('buy-kiss').click();
	await page.getByTestId('confirm-purchase').click();
	await expect(page.getByTestId('balance')).toContainText('8');

	await page.goto('/vouchers');
	await page.getByTestId('redeem-voucher').click();
	await page.getByTestId('confirm-redeem').click();
	await expect(page.getByText('Enjoyed', { exact: true })).toBeVisible();

	await page.goto('/');
	await expect(page.getByText('10 of 50 coins')).toBeVisible();
});

test('asks before deleting app data from a balance long press', async ({ page }) => {
	await page.goto('/?coin=1');
	await expect(page.getByTestId('scanned-coin-dialog')).toBeVisible();
	await page.getByRole('button', { name: 'Close' }).click();
	await expect(page.getByTestId('balance')).toContainText('1');

	await page.getByTestId('balance').click();
	await expect(page).toHaveURL(/\/collection$/);

	await page.goto('/');
	await page.getByTestId('balance').click({ delay: 700 });
	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByRole('heading', { name: 'Delete app data?' })).toBeVisible();
	await page.getByRole('button', { name: 'Keep it' }).click();
	await expect(page.getByRole('heading', { name: 'Delete app data?' })).toHaveCount(0);
	await expect(page.getByTestId('balance')).toContainText('1');

	await page.getByTestId('balance').click({ delay: 700 });
	await page.getByTestId('confirm-delete-data').click();
	await expect(page.getByTestId('balance')).toContainText('0');

	await page.goto('/?coin=1');
	await expect(page.getByTestId('scanned-coin-dialog')).toBeVisible();
});
