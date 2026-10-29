import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import {
	clearAppData,
	collectCoin,
	loadSnapshot,
	purchaseItem,
	redeemVoucher,
	resetRepositoryForTests,
	revealMoment
} from '#lib/data/repository';
import { emptySnapshot } from '#lib/domain/wallet';

describe('coin repository', () => {
	beforeEach(() => {
		globalThis.indexedDB = new IDBFactory();
		resetRepositoryForTests();
	});

	it('credits a coin once and leaves progress unchanged after spending', async () => {
		const first = await collectCoin(1);
		const duplicate = await collectCoin(1);
		expect(first.status).toBe('success');
		expect(duplicate.status).toBe('duplicate');
		if (duplicate.status !== 'duplicate') return;
		expect(duplicate.snapshot.balance).toBe(1);
		expect(duplicate.snapshot.progress).toBe(1);

		for (let id = 2; id <= 10; id += 1) await collectCoin(id);
		const beforePurchase = await loadSnapshot();
		expect(beforePurchase.progress).toBe(10);
		expect(beforePurchase.pendingThresholds).toEqual([10]);

		const purchase = await purchaseItem('kiss');
		expect(purchase.status).toBe('success');
		if (purchase.status !== 'success') return;
		expect(purchase.snapshot.balance).toBe(8);
		expect(purchase.snapshot.progress).toBe(10);

		const redeemed = await redeemVoucher(purchase.voucher.id);
		expect(redeemed.status).toBe('success');
		if (redeemed.status !== 'success') return;
		expect(redeemed.snapshot.vouchers[0]?.redeemedAt).toBeTruthy();
		expect(redeemed.snapshot.balance).toBe(8);
	});

	it('rejects a second parallel scan of the same coin', async () => {
		const [first, second] = await Promise.all([collectCoin(4), collectCoin(4)]);
		const statuses = [first.status, second.status].sort();
		expect(statuses).toEqual(['duplicate', 'success']);
		expect((await loadSnapshot()).balance).toBe(1);
	});

	it('does not spend coins the wallet does not have', async () => {
		await collectCoin(1);
		const purchase = await purchaseItem('hug');
		expect(purchase.status).toBe('insufficient');
		expect((await loadSnapshot()).balance).toBe(1);
		expect((await loadSnapshot()).vouchers).toEqual([]);
	});

	it('remembers a revealed moment across reloads', async () => {
		for (let id = 1; id <= 10; id += 1) await collectCoin(id);
		await revealMoment(10);
		expect((await loadSnapshot()).pendingThresholds).toEqual([]);
		expect((await loadSnapshot()).unlockedThresholds).toEqual([10]);
	});

	it('clears coins, vouchers, and moments', async () => {
		for (let id = 1; id <= 10; id += 1) await collectCoin(id);
		await revealMoment(10);
		const purchase = await purchaseItem('kiss');
		expect(purchase.status).toBe('success');

		expect(await clearAppData()).toEqual(emptySnapshot());
		expect(await loadSnapshot()).toEqual(emptySnapshot());
	});

	it('rejects coin links outside the catalog', async () => {
		expect((await collectCoin(0)).status).toBe('invalid');
		expect((await collectCoin(51)).status).toBe('invalid');
		expect((await loadSnapshot()).progress).toBe(0);
	});
});
