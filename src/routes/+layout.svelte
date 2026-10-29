<script lang="ts">
	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import { ModeWatcher, setMode } from 'mode-watcher';
	import BottomNav from '#lib/components/bottom-nav.svelte';
	import TopBar from '#lib/components/top-bar.svelte';
	import MomentReveal from '#lib/components/moment-reveal.svelte';
	import { Alert, AlertDescription, AlertTitle } from '#lib/components/ui/alert/index.js';
	import { Toaster } from '#lib/components/ui/sonner/index.js';
	import { PandaStore, setPandaStore } from '#lib/state/panda.svelte';
	import { publicFile } from '#lib/public-file';
	import favicon from '#lib/assets/favicon.svg';
	import './layout.css';

	let { children } = $props();
	const store = new PandaStore();
	setPandaStore(store);

	const pendingMoment = $derived(store.pendingMoment());

	if (browser) setMode('light');

	onMount(() => {
		setMode('light');
		void store.init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" href={publicFile('/brand/panda-coin.png')} />
	<meta name="theme-color" content="#2f6b45" />
	<title>Panda Supreme</title>
</svelte:head>

<ModeWatcher defaultMode="light" track={false} />
<Toaster theme="light" />

<TopBar />
<div
	class="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pt-[calc(4.25rem+env(safe-area-inset-top))] pb-28"
>
	<a
		href="#content"
		class="sr-only rounded-lg bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
	>
		Skip to content
	</a>
	{#if store.storageError}
		<Alert variant="destructive" class="mb-4">
			<AlertTitle>Saved coins are unavailable</AlertTitle>
			<AlertDescription>{store.storageError}</AlertDescription>
		</Alert>
	{/if}
	<main id="content" class="flex-1">
		{@render children()}
	</main>
</div>
<BottomNav />

{#if store.ready && pendingMoment && !store.coinCelebrationOpen}
	<MomentReveal
		moment={pendingMoment}
		error={store.storageError}
		ondismiss={() => store.reveal(pendingMoment.threshold)}
	/>
{/if}
