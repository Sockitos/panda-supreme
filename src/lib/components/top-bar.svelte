<script lang="ts">
	import { resolve } from '$app/paths';
	import { onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { coinLabel } from '#lib/domain/wallet';
	import { getPandaStore } from '#lib/state/panda.svelte';

	const store = getPandaStore();
	const home = resolve('/');
	const collection = resolve('/collection');
	const longPressDuration = 650;
	const movementTolerance = 10;

	let confirmOpen = $state(false);
	let deleting = $state(false);
	let pressTimer: ReturnType<typeof setTimeout> | undefined;
	let activePointerId: number | undefined;
	let pressX = 0;
	let pressY = 0;
	let suppressNextClick = false;

	function clearPressTimer(): void {
		if (pressTimer !== undefined) {
			clearTimeout(pressTimer);
			pressTimer = undefined;
		}
	}

	function cancelPress(): void {
		clearPressTimer();
		activePointerId = undefined;
	}

	function startPress(event: PointerEvent): void {
		if (!event.isPrimary || event.button !== 0) return;
		cancelPress();
		activePointerId = event.pointerId;
		pressX = event.clientX;
		pressY = event.clientY;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		pressTimer = setTimeout(() => {
			pressTimer = undefined;
			suppressNextClick = true;
			confirmOpen = true;
		}, longPressDuration);
	}

	function trackPress(event: PointerEvent): void {
		if (event.pointerId !== activePointerId) return;
		if (Math.hypot(event.clientX - pressX, event.clientY - pressY) > movementTolerance) {
			cancelPress();
		}
	}

	function endPress(event: PointerEvent): void {
		if (event.pointerId !== activePointerId) return;
		cancelPress();
		const target = event.currentTarget as HTMLElement;
		if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
	}

	function handleClick(event: MouseEvent): void {
		if (!suppressNextClick) return;
		event.preventDefault();
		event.stopPropagation();
		suppressNextClick = false;
	}

	function onConfirmOpenChange(open: boolean): void {
		if (deleting) return;
		confirmOpen = open;
	}

	async function confirmDelete(): Promise<void> {
		if (deleting) return;
		deleting = true;
		const cleared = await store.clear();
		if (!cleared) {
			deleting = false;
			toast.error(store.storageError ?? 'Could not delete app data.');
			return;
		}
		window.location.assign(home);
	}

	onDestroy(clearPressTimer);
</script>

<header class="fixed inset-x-0 top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
	<div
		class="mx-auto flex max-w-md items-center justify-between gap-3 px-4 pt-[env(safe-area-inset-top)]"
	>
		<div class="flex h-14 w-full items-center justify-between gap-3">
			<a href={home} class="font-heading text-xl text-foreground">Panda Supreme</a>
			{#if store.ready}
				<a
					href={collection}
					data-testid="balance"
					class="rounded-full bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground"
					onpointerdown={startPress}
					onpointermove={trackPress}
					onpointerup={endPress}
					onpointercancel={cancelPress}
					onlostpointercapture={cancelPress}
					onclick={handleClick}
					oncontextmenu={(event) => event.preventDefault()}
				>
					{coinLabel(store.snapshot.balance)}
				</a>
			{/if}
		</div>
	</div>
</header>

<Dialog.Root open={confirmOpen} onOpenChange={onConfirmOpenChange}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="font-heading text-2xl">Delete app data?</Dialog.Title>
			<Dialog.Description class="text-base">
				Coins, moments, and vouchers saved on this phone will be removed. You can start the
				adventure again.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button
				class="min-h-11"
				variant="outline"
				disabled={deleting}
				onclick={() => (confirmOpen = false)}
			>
				Keep it
			</Button>
			<Button
				class="min-h-11"
				variant="destructive"
				data-testid="confirm-delete-data"
				disabled={deleting}
				onclick={confirmDelete}
			>
				Delete data
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
