import { EMPTY_STATE } from '#lib/domain/wallet';
import {
	MILESTONES,
	type CollectionEntry,
	type Milestone,
	type PersistedState,
	type Voucher,
	type WalletTransaction
} from '#lib/domain/types';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function sanitizeCollections(value: unknown): CollectionEntry[] {
	if (!Array.isArray(value)) return [];
	const seen = new Set<number>();
	const collections: CollectionEntry[] = [];
	for (const entry of value) {
		if (
			!isRecord(entry) ||
			typeof entry.coinId !== 'number' ||
			typeof entry.collectedAt !== 'string'
		) {
			continue;
		}
		if (
			!Number.isInteger(entry.coinId) ||
			entry.coinId < 1 ||
			entry.coinId > 50 ||
			seen.has(entry.coinId)
		) {
			continue;
		}
		seen.add(entry.coinId);
		collections.push({ coinId: entry.coinId, collectedAt: entry.collectedAt });
	}
	return collections;
}

function sanitizeTransactions(value: unknown): WalletTransaction[] {
	if (!Array.isArray(value)) return [];
	const transactions: WalletTransaction[] = [];
	for (const entry of value) {
		if (!isRecord(entry)) continue;
		if (typeof entry.id !== 'string' || (entry.type !== 'earn' && entry.type !== 'spend')) continue;
		if (typeof entry.amount !== 'number' || !Number.isFinite(entry.amount) || entry.amount < 0)
			continue;
		if (typeof entry.createdAt !== 'string') continue;
		transactions.push({
			id: entry.id,
			type: entry.type,
			amount: entry.amount,
			createdAt: entry.createdAt,
			...(typeof entry.coinId === 'number' ? { coinId: entry.coinId } : {}),
			...(typeof entry.shopItemId === 'string' ? { shopItemId: entry.shopItemId } : {}),
			...(typeof entry.voucherId === 'string' ? { voucherId: entry.voucherId } : {})
		});
	}
	return transactions;
}

function sanitizeVouchers(value: unknown): Voucher[] {
	if (!Array.isArray(value)) return [];
	const vouchers: Voucher[] = [];
	for (const entry of value) {
		if (!isRecord(entry)) continue;
		if (typeof entry.id !== 'string' || typeof entry.shopItemId !== 'string') continue;
		if (typeof entry.cost !== 'number' || typeof entry.purchasedAt !== 'string') continue;
		if (entry.redeemedAt !== null && typeof entry.redeemedAt !== 'string') continue;
		vouchers.push({
			id: entry.id,
			shopItemId: entry.shopItemId,
			cost: entry.cost,
			purchasedAt: entry.purchasedAt,
			redeemedAt: entry.redeemedAt
		});
	}
	return vouchers;
}

function sanitizeThresholds(value: unknown): Milestone[] {
	if (!Array.isArray(value)) return [];
	return MILESTONES.filter((threshold) => value.includes(threshold));
}

export function migrate(raw: unknown): PersistedState {
	if (!isRecord(raw)) return structuredClone(EMPTY_STATE);
	if (raw.version !== undefined && raw.version !== 0 && raw.version !== 1) {
		return structuredClone(EMPTY_STATE);
	}

	return {
		version: 1,
		collections: sanitizeCollections(raw.collections),
		transactions: sanitizeTransactions(raw.transactions),
		vouchers: sanitizeVouchers(raw.vouchers),
		revealedThresholds: sanitizeThresholds(raw.revealedThresholds)
	};
}
