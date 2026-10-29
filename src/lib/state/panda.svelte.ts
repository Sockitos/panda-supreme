import { createContext } from 'svelte';
import { getMoment } from '#lib/content/moments';
import type {
	AppSnapshot,
	CollectResult,
	Milestone,
	Moment,
	PurchaseResult,
	RedeemResult
} from '#lib/domain/types';
import { emptySnapshot } from '#lib/domain/wallet';
import {
	clearAppData,
	collectCoin,
	loadSnapshot,
	purchaseItem,
	redeemVoucher,
	revealMoment
} from '#lib/data/repository';

export class PandaStore {
	snapshot = $state<AppSnapshot>(emptySnapshot());
	ready = $state(false);
	storageError = $state<string | null>(null);
	coinCelebrationOpen = $state(false);
	#loading: Promise<void> | null = null;

	init(): Promise<void> {
		this.#loading ??= this.#load();
		return this.#loading;
	}

	async collect(coinId: number): Promise<CollectResult> {
		const result = await collectCoin(coinId);
		this.#apply(result);
		return result;
	}

	async purchase(itemId: string): Promise<PurchaseResult> {
		const result = await purchaseItem(itemId);
		this.#apply(result);
		return result;
	}

	async redeem(voucherId: string): Promise<RedeemResult> {
		const result = await redeemVoucher(voucherId);
		this.#apply(result);
		return result;
	}

	async clear(): Promise<boolean> {
		try {
			this.snapshot = await clearAppData();
			this.storageError = null;
			this.coinCelebrationOpen = false;
			return true;
		} catch (error) {
			this.storageError = error instanceof Error ? error.message : 'Could not delete saved data.';
			return false;
		}
	}

	async reveal(threshold: Milestone): Promise<void> {
		try {
			this.snapshot = await revealMoment(threshold);
			this.storageError = null;
		} catch (error) {
			this.storageError = error instanceof Error ? error.message : 'Could not save this moment.';
		}
	}

	pendingMoment(): Moment | null {
		const threshold = this.snapshot.pendingThresholds[0];
		return threshold ? (getMoment(threshold) ?? null) : null;
	}

	async #load(): Promise<void> {
		try {
			this.snapshot = await loadSnapshot();
			this.storageError = null;
		} catch (error) {
			this.storageError =
				error instanceof Error ? error.message : 'Saved coins could not be opened.';
		} finally {
			this.ready = true;
		}
	}

	#apply(result: CollectResult | PurchaseResult | RedeemResult): void {
		if ('snapshot' in result && result.snapshot) this.snapshot = result.snapshot;
		this.storageError = result.status === 'error' ? result.message : null;
	}
}

export const [getPandaStore, setPandaStore] = createContext<PandaStore>();
