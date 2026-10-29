export type Coin = {
	id: number;
	image: string;
	audio?: string;
};

export type Moment = {
	threshold: Milestone;
	title: string;
	message: string;
	emoji: string;
};

export type ShopItem = {
	id: string;
	name: string;
	description: string;
	cost: number;
};

export type CollectionEntry = {
	coinId: number;
	collectedAt: string;
};

export type WalletTransaction = {
	id: string;
	type: 'earn' | 'spend';
	amount: number;
	coinId?: number;
	shopItemId?: string;
	voucherId?: string;
	createdAt: string;
};

export type Voucher = {
	id: string;
	shopItemId: string;
	cost: number;
	purchasedAt: string;
	redeemedAt: string | null;
};

export type PersistedState = {
	version: 1;
	collections: CollectionEntry[];
	transactions: WalletTransaction[];
	vouchers: Voucher[];
	revealedThresholds: Milestone[];
};

export const MILESTONES = [10, 20, 30, 40, 50] as const;
export type Milestone = (typeof MILESTONES)[number];

export type AppSnapshot = PersistedState & {
	balance: number;
	progress: number;
	unlockedThresholds: Milestone[];
	pendingThresholds: Milestone[];
};

export type CollectResult =
	| { status: 'invalid' }
	| { status: 'duplicate'; snapshot: AppSnapshot }
	| { status: 'success'; snapshot: AppSnapshot }
	| { status: 'error'; message: string };

export type PurchaseResult =
	| { status: 'success'; snapshot: AppSnapshot; voucher: Voucher }
	| { status: 'insufficient'; snapshot: AppSnapshot }
	| { status: 'missing' }
	| { status: 'error'; message: string };

export type RedeemResult =
	| { status: 'success'; snapshot: AppSnapshot }
	| { status: 'missing' }
	| { status: 'already'; snapshot: AppSnapshot }
	| { status: 'error'; message: string };
