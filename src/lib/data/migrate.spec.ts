import { describe, expect, it } from 'vitest';
import { migrate } from '#lib/data/migrate';

describe('storage migrations', () => {
	it('starts from an empty version 1 state', () => {
		expect(migrate(undefined)).toEqual({
			version: 1,
			collections: [],
			transactions: [],
			vouchers: [],
			revealedThresholds: []
		});
	});

	it('upgrades an unversioned saved coin into version 1', () => {
		expect(
			migrate({
				collections: [
					{ coinId: 5, collectedAt: '2026-10-29T00:00:00.000Z' },
					{ coinId: 5, collectedAt: 'later' }
				],
				transactions: [
					{ id: 'earn', type: 'earn', amount: 1, createdAt: '2026-10-29T00:00:00.000Z' }
				],
				revealedThresholds: [10, 15, 20]
			})
		).toMatchObject({
			version: 1,
			collections: [{ coinId: 5, collectedAt: '2026-10-29T00:00:00.000Z' }],
			revealedThresholds: [10, 20]
		});
	});

	it('drops an unknown future version instead of guessing', () => {
		expect(
			migrate({ version: 2, collections: [{ coinId: 1, collectedAt: 't' }] }).collections
		).toEqual([]);
	});
});
