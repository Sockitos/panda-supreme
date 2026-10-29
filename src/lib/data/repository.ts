import { getCoin } from '#lib/content/coins';
import { getShopItem } from '#lib/content/shop';
import type {
	CollectResult,
	Milestone,
	PersistedState,
	PurchaseResult,
	RedeemResult
} from '#lib/domain/types';
import { balanceOf, EMPTY_STATE, emptySnapshot, toSnapshot } from '#lib/domain/wallet';
import { migrate } from './migrate';

const DB_NAME = 'panda-supreme';
const DB_VERSION = 1;
const STORE = 'state';
const KEY = 'app';

let databasePromise: Promise<IDBDatabase> | null = null;
let queue: Promise<unknown> = Promise.resolve();

type Mutation<T> = {
	state: PersistedState;
	result: T;
	write: boolean;
};

export function resetRepositoryForTests(): void {
	databasePromise = null;
	queue = Promise.resolve();
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
	const run = queue.then(task, task);
	queue = run.then(
		() => undefined,
		() => undefined
	);
	return run;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
	});
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onerror = () =>
			reject(transaction.error ?? new Error('IndexedDB transaction failed'));
		transaction.onabort = () =>
			reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
	});
}

function openDatabase(): Promise<IDBDatabase> {
	if (databasePromise) return databasePromise;
	const pending = createDatabase().catch((error: unknown): never => {
		databasePromise = null;
		throw error;
	});
	databasePromise = pending;
	return pending;
}

function createDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		if (typeof indexedDB === 'undefined') {
			reject(new Error('Storage is not available on this phone.'));
			return;
		}
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onupgradeneeded = () => {
			const database = request.result;
			if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE);
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? new Error('Could not open saved coins.'));
	});
}

async function mutate<T>(change: (state: PersistedState) => Mutation<T>): Promise<T> {
	return enqueue(async () => {
		const database = await openDatabase();
		const transaction = database.transaction(STORE, 'readwrite');
		const store = transaction.objectStore(STORE);
		const current = migrate(await requestToPromise(store.get(KEY)));
		try {
			const outcome = change(current);
			if (outcome.write) store.put(outcome.state, KEY);
			await transactionDone(transaction);
			return outcome.result;
		} catch (error) {
			transaction.abort();
			throw error;
		}
	});
}

function createId(): string {
	return crypto.randomUUID();
}

export async function clearAppData() {
	return enqueue(async () => {
		const database = await openDatabase();
		const transaction = database.transaction(STORE, 'readwrite');
		try {
			transaction.objectStore(STORE).put(structuredClone(EMPTY_STATE), KEY);
			await transactionDone(transaction);
			return emptySnapshot();
		} catch (error) {
			transaction.abort();
			throw error;
		}
	});
}

export async function loadSnapshot() {
	const database = await openDatabase();
	const transaction = database.transaction(STORE, 'readonly');
	const state = migrate(await requestToPromise(transaction.objectStore(STORE).get(KEY)));
	await transactionDone(transaction);
	return toSnapshot(state);
}

export async function collectCoin(coinId: number): Promise<CollectResult> {
	if (!getCoin(coinId)) return { status: 'invalid' };
	try {
		return await mutate((state): Mutation<CollectResult> => {
			if (state.collections.some((entry) => entry.coinId === coinId)) {
				return {
					state,
					write: false,
					result: { status: 'duplicate', snapshot: toSnapshot(state) }
				};
			}
			const collectedAt = new Date().toISOString();
			const next: PersistedState = {
				...state,
				collections: [...state.collections, { coinId, collectedAt }],
				transactions: [
					...state.transactions,
					{ id: createId(), type: 'earn', amount: 1, coinId, createdAt: collectedAt }
				]
			};
			return {
				state: next,
				write: true,
				result: { status: 'success', snapshot: toSnapshot(next) }
			};
		});
	} catch (error) {
		return { status: 'error', message: errorMessage(error) };
	}
}

export async function purchaseItem(itemId: string): Promise<PurchaseResult> {
	const item = getShopItem(itemId);
	if (!item) return { status: 'missing' };
	try {
		return await mutate((state): Mutation<PurchaseResult> => {
			const snapshot = toSnapshot(state);
			if (balanceOf(state.transactions) < item.cost) {
				return { state, write: false, result: { status: 'insufficient', snapshot } };
			}
			const purchasedAt = new Date().toISOString();
			const voucher = {
				id: createId(),
				shopItemId: item.id,
				cost: item.cost,
				purchasedAt,
				redeemedAt: null
			};
			const next: PersistedState = {
				...state,
				vouchers: [...state.vouchers, voucher],
				transactions: [
					...state.transactions,
					{
						id: createId(),
						type: 'spend',
						amount: item.cost,
						shopItemId: item.id,
						voucherId: voucher.id,
						createdAt: purchasedAt
					}
				]
			};
			return {
				state: next,
				write: true,
				result: { status: 'success', snapshot: toSnapshot(next), voucher }
			};
		});
	} catch (error) {
		return { status: 'error', message: errorMessage(error) };
	}
}

export async function redeemVoucher(voucherId: string): Promise<RedeemResult> {
	try {
		return await mutate((state): Mutation<RedeemResult> => {
			const voucher = state.vouchers.find((entry) => entry.id === voucherId);
			if (!voucher) return { state, write: false, result: { status: 'missing' } };
			if (voucher.redeemedAt) {
				return { state, write: false, result: { status: 'already', snapshot: toSnapshot(state) } };
			}
			const next: PersistedState = {
				...state,
				vouchers: state.vouchers.map((entry) =>
					entry.id === voucherId ? { ...entry, redeemedAt: new Date().toISOString() } : entry
				)
			};
			return {
				state: next,
				write: true,
				result: { status: 'success', snapshot: toSnapshot(next) }
			};
		});
	} catch (error) {
		return { status: 'error', message: errorMessage(error) };
	}
}

export async function revealMoment(threshold: Milestone) {
	return mutate((state) => {
		if (state.revealedThresholds.includes(threshold)) {
			return { state, write: false, result: toSnapshot(state) };
		}
		const next: PersistedState = {
			...state,
			revealedThresholds: [...state.revealedThresholds, threshold]
		};
		return { state: next, write: true, result: toSnapshot(next) };
	});
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : 'Could not save on this phone.';
}
