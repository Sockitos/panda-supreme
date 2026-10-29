<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { getShopItem, getShopItemEmoji } from '#lib/content/shop';
	import { getPandaStore } from '#lib/state/panda.svelte';

	const store = getPandaStore();
	let redeemId = $state<string | null>(null);

	const selectedVoucher = $derived(
		store.snapshot.vouchers.find((voucher) => voucher.id === redeemId) ?? null
	);
	const selectedReward = $derived(
		selectedVoucher ? getShopItem(selectedVoucher.shopItemId) : undefined
	);
	const vouchers = $derived([...store.snapshot.vouchers].reverse());

	async function confirmRedeem(): Promise<void> {
		if (!selectedVoucher || !selectedReward) return;
		const name = selectedReward.name;
		const result = await store.redeem(selectedVoucher.id);
		redeemId = null;
		if (result.status === 'success') toast.success(`${name} is marked as enjoyed.`);
		if (result.status === 'error') toast.error(result.message);
	}
</script>

<svelte:head>
	<title>Vouchers · Panda Supreme</title>
</svelte:head>

<div class="space-y-5">
	<header class="space-y-1">
		<h1 class="text-4xl">Vouchers</h1>
		<p class="leading-6 text-muted-foreground">
			Treats you already bought. Mark one once you have enjoyed it.
		</p>
	</header>

	{#if vouchers.length === 0}
		<p class="text-sm text-muted-foreground">Nothing bought yet.</p>
	{/if}
	<div class="grid grid-cols-2 gap-3">
		{#each vouchers as voucher (voucher.id)}
			{@const item = getShopItem(voucher.shopItemId)}
			<Card.Root class="flex h-48 flex-col gap-0 overflow-hidden shadow-none" data-testid="voucher">
				<Card.Header
					class="flex flex-1 flex-col items-center justify-center gap-2 p-3 pb-0 text-center"
				>
					<span class="text-4xl leading-none" aria-hidden="true">
						{getShopItemEmoji(voucher.shopItemId)}
					</span>
					<Card.Title class="font-heading text-base leading-5">{item?.name ?? 'Treat'}</Card.Title>
				</Card.Header>
				<Card.Footer class="mt-3 flex-col items-stretch p-3">
					<Button
						class="min-h-11 w-full px-2 text-sm"
						variant="secondary"
						disabled={Boolean(voucher.redeemedAt)}
						data-testid={voucher.redeemedAt ? undefined : 'redeem-voucher'}
						onclick={() => (redeemId = voucher.id)}
					>
						{voucher.redeemedAt ? 'Enjoyed' : 'Enjoy it'}
					</Button>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
</div>

<Dialog.Root
	open={selectedVoucher !== null}
	onOpenChange={(open) => {
		if (!open) redeemId = null;
	}}
>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="font-heading text-2xl">Enjoy {selectedReward?.name}?</Dialog.Title>
			<Dialog.Description class="text-base">
				Mark it once you have had it. The coins stay spent.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button class="min-h-11" variant="outline" onclick={() => (redeemId = null)}>Not yet</Button>
			<Button class="min-h-11" data-testid="confirm-redeem" onclick={confirmRedeem}
				>Mark as enjoyed</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
