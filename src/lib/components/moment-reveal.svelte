<script lang="ts">
	import CoinFireworks from '#lib/components/coin-fireworks.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import type { Moment } from '#lib/domain/types';

	let {
		moment,
		error = null,
		ondismiss
	}: {
		moment: Moment;
		error?: string | null;
		ondismiss: () => void;
	} = $props();
</script>

<Dialog.Root
	open
	onOpenChange={(open) => {
		if (!open) ondismiss();
	}}
>
	<Dialog.Content
		class="max-h-[calc(100dvh-2rem)] overflow-hidden sm:max-w-md"
		data-testid="moment-reveal"
	>
		<div class="moment-burst">
			<CoinFireworks />
			<p class="moment-emoji" aria-hidden="true">{moment.emoji}</p>
		</div>
		<Dialog.Header class="items-center text-center">
			<Dialog.Title class="font-heading text-3xl" data-testid="moment-title"
				>{moment.title}</Dialog.Title
			>
			<Dialog.Description class="text-base leading-7">{moment.message}</Dialog.Description>
		</Dialog.Header>
		{#if error}
			<p class="text-center text-sm text-destructive" role="alert">{error}</p>
		{/if}
		<Dialog.Footer>
			<Button class="min-h-11 w-full" onclick={ondismiss}>Enjoy moment</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style>
	.moment-burst {
		position: relative;
		display: grid;
		place-items: center;
		min-height: 6.5rem;
	}

	.moment-emoji {
		margin: 0;
		font-size: 4.5rem;
		line-height: 1;
		text-align: center;
	}
</style>
