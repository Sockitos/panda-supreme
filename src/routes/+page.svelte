<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import CoinFireworks from '#lib/components/coin-fireworks.svelte';
	import CoinMedia from '#lib/components/coin-media.svelte';
	import MomentPath from '#lib/components/moment-path.svelte';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { getCoin } from '#lib/content/coins';
	import { parseCoinId } from '#lib/domain/wallet';
	import type { Coin } from '#lib/domain/types';
	import { getPandaStore } from '#lib/state/panda.svelte';

	const store = getPandaStore();
	let scannedCoin = $state<Coin | null>(null);
	let scanOpen = $state(false);
	let scanDialog = $state<HTMLElement | null>(null);
	let processingQuery: string | null = null;
	let scanGeneration = 0;

	async function stripConsumedCoin(raw: string): Promise<void> {
		const next = new URL(page.url.href);
		if (next.searchParams.get('coin') !== raw) return;
		next.searchParams.delete('coin');
		await goto(next, { replace: true, reset: false, state: page.state });
	}

	async function consumeCoinQuery(raw: string): Promise<void> {
		const generation = ++scanGeneration;
		await stripConsumedCoin(raw);
		if (generation !== scanGeneration) return;

		const id = parseCoinId(raw);
		if (id === null) {
			toast.error('That coin number is not valid.');
			return;
		}

		await store.init();
		if (generation !== scanGeneration) return;
		const result = await store.collect(id);
		if (generation !== scanGeneration) return;

		if (result.status === 'success') {
			scannedCoin = getCoin(id) ?? null;
			store.coinCelebrationOpen = scannedCoin !== null;
			scanOpen = scannedCoin !== null;
		} else if (result.status === 'duplicate') {
			toast.info(`Coin ${id} is already in your collection.`);
		} else if (result.status === 'error') {
			toast.error(result.message);
		} else {
			toast.error('That coin could not be found.');
		}
	}

	function onScanOpenChange(next: boolean): void {
		scanOpen = next;
		if (!next) {
			scannedCoin = null;
			store.coinCelebrationOpen = false;
		}
	}

	function focusScanDialog(event: Event): void {
		event.preventDefault();
		queueMicrotask(() => {
			scanDialog?.focus({ preventScroll: true });
		});
	}

	afterNavigate(() => {
		const raw = page.url.searchParams.get('coin');
		if (raw === null || raw === processingQuery) return;

		processingQuery = raw;
		void consumeCoinQuery(raw).finally(() => {
			if (processingQuery === raw) processingQuery = null;
		});
	});

	onDestroy(() => {
		store.coinCelebrationOpen = false;
	});
</script>

<svelte:head>
	<title>Home · Panda Supreme</title>
	<meta
		name="description"
		content="Follow your personal 50-coin supreme adventure and unlock milestone moments."
	/>
</svelte:head>

<div class="home">
	{#if store.ready}
		<section class="hero" aria-labelledby="home-title">
			<div class="panda-focal" aria-hidden="true">
				<span>🐼</span>
			</div>
			<div class="hero-copy">
				<h1 id="home-title">Your supreme adventure</h1>
				<p class="lede">Collect coins as you go, and little gifts will open along the way</p>
				<p class="progress-copy">
					<strong>{store.snapshot.progress} of 50 coins</strong> found
				</p>
				<div
					class="progress-track"
					role="progressbar"
					aria-label="Coins found"
					aria-valuemin="0"
					aria-valuemax="50"
					aria-valuenow={store.snapshot.progress}
				>
					<span style:width={`${(store.snapshot.progress / 50) * 100}%`}></span>
				</div>
			</div>
		</section>

		<MomentPath progress={store.snapshot.progress} />
	{:else}
		<section class="hero loading" aria-labelledby="loading-title">
			<div class="panda-focal" aria-hidden="true">
				<span>🐼</span>
			</div>
			<h1 id="loading-title">Your supreme adventure</h1>
			<p role="status">Opening your coins…</p>
		</section>
	{/if}
</div>

<Dialog.Root open={scanOpen} onOpenChange={onScanOpenChange}>
	{#if scannedCoin}
		<Dialog.Content
			bind:ref={scanDialog}
			class="w-fit max-w-[calc(100%-2rem)] place-items-center gap-0 overflow-hidden p-6 sm:max-w-fit"
			data-testid="scanned-coin-dialog"
			onOpenAutoFocus={focusScanDialog}
		>
			<CoinFireworks />
			<Dialog.Title class="sr-only">Coin {scannedCoin.id}</Dialog.Title>
			{#key scannedCoin.id}
				<CoinMedia coin={scannedCoin} />
			{/key}
		</Dialog.Content>
	{/if}
</Dialog.Root>

<style>
	.home {
		display: grid;
		gap: 2.5rem;
		padding-bottom: 1rem;
	}

	.hero {
		display: grid;
		justify-items: center;
		gap: 1.5rem;
		padding-top: 0.65rem;
		text-align: center;
	}

	.panda-focal {
		display: grid;
		width: 10.25rem;
		aspect-ratio: 1;
		place-items: center;
		border-radius: 999px;
		border: 1px solid color-mix(in oklch, var(--accent), var(--border) 45%);
		background: color-mix(in oklch, var(--accent), var(--background) 72%);
	}

	.panda-focal span {
		font-size: 6.25rem;
		line-height: 1;
	}

	.hero-copy {
		display: grid;
		width: 100%;
		gap: 0.4rem;
	}

	h1 {
		margin-inline: auto;
		font-size: clamp(1.7rem, 0.8rem + 4vw, 2.1rem);
		line-height: 1.15;
		text-wrap: balance;
	}

	.lede {
		max-width: 34ch;
		margin-inline: auto;
		color: var(--muted-foreground);
		font-size: 1.05rem;
		font-weight: 600;
		line-height: 1.45;
	}

	.progress-copy {
		margin-top: 0.5rem;
		color: var(--muted-foreground);
	}

	.progress-copy strong {
		color: var(--foreground);
		font-size: 1.1rem;
	}

	.progress-track {
		overflow: hidden;
		width: 100%;
		height: 0.65rem;
		margin-top: 0.3rem;
		border: 1px solid color-mix(in oklch, var(--primary), transparent 75%);
		border-radius: 999px;
		background: var(--secondary);
	}

	.progress-track span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--primary);
		transition: width 400ms ease-out;
	}

	.loading {
		padding-top: 1rem;
		color: var(--muted-foreground);
	}

	.loading h1 {
		color: var(--foreground);
	}

	@media (min-width: 28rem) {
		.home {
			gap: 3rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.progress-track span {
			transition: none;
		}
	}
</style>
