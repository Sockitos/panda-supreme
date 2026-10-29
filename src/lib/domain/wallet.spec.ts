import { describe, expect, it } from 'vitest';
import { coins } from '#lib/content/coins';
import { moments } from '#lib/content/moments';
import { shopItems } from '#lib/content/shop';
import { MILESTONES } from '#lib/domain/types';
import { balanceOf, parseCoinId, unlockedThresholds } from '#lib/domain/wallet';

describe('coin catalog', () => {
	it('contains coins 1 through 50 exactly once', () => {
		expect(coins.map((coin) => coin.id)).toEqual(
			Array.from({ length: 50 }, (_, index) => index + 1)
		);
	});

	it('attaches audio only to every fifth coin', () => {
		for (const coin of coins) {
			if (coin.id % 5 === 0) {
				expect(coin.audio, String(coin.id)).toBeTruthy();
			} else {
				expect(coin.audio, String(coin.id)).toBeUndefined();
			}
		}
	});

	it('defines the five moments without describing the gifts', () => {
		expect(moments.map((moment) => moment.threshold)).toEqual([...MILESTONES]);
		expect(moments.map((moment) => moment.title)).toEqual([
			'Sleep',
			'Good Morning',
			'Mesh',
			'Dinner at Come Prima',
			'Christmas Is Coming'
		]);
		const copy = moments.map((moment) => `${moment.title} ${moment.message}`).join(' ');
		expect(copy).not.toMatch(/eye mask|flowers|candle|bracelet|present|gift/i);
	});

	it('prices the shop rewards', () => {
		expect(shopItems.map((item) => [item.id, item.cost])).toEqual([
			['kiss', 2],
			['hug', 3],
			['cuddle', 5],
			['movie', 6],
			['breakfast', 8],
			['massage', 10],
			['dessert', 12],
			['date-night', 15],
			['surprise-date', 20]
		]);
	});
});

describe('wallet rules', () => {
	it('parses only coin ids 1 to 50', () => {
		expect(parseCoinId('1')).toBe(1);
		expect(parseCoinId('50')).toBe(50);
		expect(parseCoinId('0')).toBeNull();
		expect(parseCoinId('01')).toBeNull();
		expect(parseCoinId('51')).toBeNull();
		expect(parseCoinId('foo')).toBeNull();
	});

	it('keeps spending separate from collection progress', () => {
		expect(
			balanceOf([
				{ id: 'a', type: 'earn', amount: 10, createdAt: 't' },
				{ id: 'b', type: 'spend', amount: 4, createdAt: 't' }
			])
		).toBe(6);
		expect(unlockedThresholds(9)).toEqual([]);
		expect(unlockedThresholds(10)).toEqual([10]);
		expect(unlockedThresholds(50)).toEqual([10, 20, 30, 40, 50]);
	});
});
