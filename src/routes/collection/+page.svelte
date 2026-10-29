<script lang="ts">
	import CoinMedia from '#lib/components/coin-media.svelte';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { coins } from '#lib/content/coins';
	import { publicFile } from '#lib/public-file';
	import type { Coin } from '#lib/domain/types';
	import { getPandaStore } from '#lib/state/panda.svelte';

	const store = getPandaStore();
	const found = $derived(new Set(store.snapshot.collections.map((entry) => entry.coinId)));
	let open = $state(false);
	let selectedCoin = $state<Coin | null>(null);

	function showCoin(coin: Coin): void {
		selectedCoin = coin;
		open = true;
	}

	function onOpenChange(next: boolean): void {
		open = next;
		if (!next) selectedCoin = null;
	}
</script>

<svelte:head>
	<title>Collection · Panda Supreme</title>
</svelte:head>

<div class="space-y-5">
	<header class="space-y-1">
		<h1 class="text-4xl">Your coins</h1>
		<p class="text-muted-foreground">
			{#if store.ready}
				{found.size} of 50 found
			{:else}
				Opening your coins…
			{/if}
		</p>
	</header>

	<ul class="grid grid-cols-4 gap-x-2.5 gap-y-4">
		{#each coins as coin (coin.id)}
			{@const collected = found.has(coin.id)}
			<li class="min-w-0">
				<button
					type="button"
					data-testid="coin-link-{coin.id}"
					data-found={collected ? 'true' : 'false'}
					aria-label={collected ? `Open coin ${coin.id}` : `Coin ${coin.id}, not found`}
					disabled={!collected}
					onclick={() => showCoin(coin)}
					class="flex w-full flex-col items-center gap-1.5 disabled:cursor-not-allowed"
				>
					<span class="relative aspect-square w-full">
						<img
							src={publicFile('/brand/panda-coin.png')}
							alt=""
							class={['size-full rounded-full object-cover shadow-md', !collected && 'grayscale']}
						/>
						{#if !collected}
							<span
								class="pointer-events-none absolute inset-0 rounded-full bg-stone-500/45"
								aria-hidden="true"
							></span>
						{/if}
					</span>
					<span class="w-full text-center text-xs leading-4 font-extrabold">
						{coin.id}
					</span>
				</button>
			</li>
		{/each}
	</ul>
</div>

<Dialog.Root {open} {onOpenChange}>
	{#if selectedCoin}
		<Dialog.Content
			class="w-fit max-w-[calc(100%-2rem)] place-items-center gap-0 overflow-hidden p-6 sm:max-w-fit"
		>
			<Dialog.Title class="sr-only">Coin {selectedCoin.id}</Dialog.Title>
			{#key selectedCoin.id}
				<CoinMedia coin={selectedCoin} />
			{/key}
		</Dialog.Content>
	{/if}
</Dialog.Root>
