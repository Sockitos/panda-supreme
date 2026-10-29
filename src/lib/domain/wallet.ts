import {
	MILESTONES,
	type AppSnapshot,
	type Milestone,
	type PersistedState,
	type WalletTransaction
} from './types';

export const EMPTY_STATE: PersistedState = {
	version: 1,
	collections: [],
	transactions: [],
	vouchers: [],
	revealedThresholds: []
};

export function parseCoinId(value: string): number | null {
	if (!/^[1-9]\d?$/.test(value)) return null;
	const id = Number(value);
	return id >= 1 && id <= 50 ? id : null;
}

export function balanceOf(transactions: WalletTransaction[]): number {
	return transactions.reduce(
		(total, transaction) =>
			total + (transaction.type === 'earn' ? transaction.amount : -transaction.amount),
		0
	);
}

export function unlockedThresholds(progress: number): Milestone[] {
	return MILESTONES.filter((threshold) => progress >= threshold);
}

export function toSnapshot(state: PersistedState): AppSnapshot {
	const progress = state.collections.length;
	const unlocked = unlockedThresholds(progress);
	return {
		...state,
		balance: balanceOf(state.transactions),
		progress,
		unlockedThresholds: unlocked,
		pendingThresholds: unlocked.filter((threshold) => !state.revealedThresholds.includes(threshold))
	};
}

export function emptySnapshot(): AppSnapshot {
	return toSnapshot(EMPTY_STATE);
}

export function coinLabel(count: number): string {
	return `${count} ${count === 1 ? 'coin' : 'coins'}`;
}
