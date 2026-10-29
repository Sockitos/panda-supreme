<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { getShopItemEmoji, shopItems } from '#lib/content/shop';
	import { coinLabel } from '#lib/domain/wallet';
	import { getPandaStore } from '#lib/state/panda.svelte';

	const store = getPandaStore();
	let purchaseId = $state<string | null>(null);

	const selected = $derived(shopItems.find((item) => item.id === purchaseId) ?? null);

	async function confirmPurchase(): Promise<void> {
		if (!selected) return;
		const item = selected;
		const result = await store.purchase(item.id);
		purchaseId = null;
		if (result.status === 'success') toast.success(`${item.name} is ready whenever you want it.`);
		if (result.status === 'insufficient') toast.error('Not enough coins for that yet.');
		if (result.status === 'error') toast.error(result.message);
	}
</script>

<svelte:head>
	<title>Shop · Panda Supreme</title>
</svelte:head>

<div class="space-y-5">
	<header class="space-y-1">
		<h1 class="text-4xl">The shop</h1>
		<p class="leading-6 text-muted-foreground">
			Spend coins on a treat. Buying never removes a coin from your collection.
		</p>
	</header>

	<div class="grid grid-cols-2 gap-3">
		{#each shopItems as item (item.id)}
			{@const affordable = store.snapshot.balance >= item.cost}
			<Card.Root class="flex h-48 flex-col gap-0 overflow-hidden shadow-none">
				<Card.Header
					class="flex flex-1 flex-col items-center justify-center gap-2 p-3 pb-0 text-center"
				>
					<span class="text-4xl leading-none" aria-hidden="true">
						{getShopItemEmoji(item.id)}
					</span>
					<Card.Title class="font-heading text-base leading-5">{item.name}</Card.Title>
				</Card.Header>
				<Card.Footer class="mt-3 flex-col items-stretch p-3">
					<Button
						class="min-h-11 w-full px-2 text-sm"
						disabled={!store.ready || !affordable}
						data-testid="buy-{item.id}"
						onclick={() => (purchaseId = item.id)}
					>
						Get · {coinLabel(item.cost)}
					</Button>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
</div>

<Dialog.Root
	open={selected !== null}
	onOpenChange={(open) => {
		if (!open) purchaseId = null;
	}}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="font-heading text-2xl">Get {selected?.name}?</Dialog.Title>
			<Dialog.Description class="text-base">
				This spends {coinLabel(selected?.cost ?? 0)}. Your collection does not change.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button class="min-h-11" variant="outline" onclick={() => (purchaseId = null)}>Not now</Button
			>
			<Button class="min-h-11" data-testid="confirm-purchase" onclick={confirmPurchase}
				>Confirm</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
