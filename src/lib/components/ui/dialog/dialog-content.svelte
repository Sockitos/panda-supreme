<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import XIcon from '@lucide/svelte/icons/x';
	import { Button } from '#lib/components/ui/button/index.js';
	import { cn, type WithoutChildrenOrChild } from '#lib/utils.js';
	import DialogOverlay from './dialog-overlay.svelte';
	import DialogPortal from './dialog-portal.svelte';
	import type { Snippet } from 'svelte';
	import type { ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		showCloseButton = true,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DialogPortal>>;
		children: Snippet;
		showCloseButton?: boolean;
	} = $props();
</script>

<DialogPortal {...portalProps}>
	<DialogOverlay />
	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		class={cn(
			'fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%_-_2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 sm:max-w-sm',
			className,
			'overflow-visible'
		)}
		{...restProps}
	>
		<span class="panda-peek" aria-hidden="true">🐼</span>
		{@render children?.()}
		{#if showCloseButton}
			<DialogPrimitive.Close data-slot="dialog-close">
				{#snippet child({ props })}
					<Button variant="ghost" class="absolute top-2 right-2" size="icon-sm" {...props}>
						<XIcon />
						<span class="sr-only">Close</span>
					</Button>
				{/snippet}
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</DialogPortal>

<style>
	.panda-peek {
		position: absolute;
		z-index: -1;
		top: 0;
		left: 0.85rem;
		font-size: 5rem;
		line-height: 1;
		pointer-events: none;
		user-select: none;
		transform-origin: 46% 100%;
		transform: translateY(78%) rotate(-14deg) scale(0.7);
		filter: drop-shadow(0 0.45rem 0.2rem oklch(0.29 0.04 155 / 0.18));
		animation: panda-peek 760ms cubic-bezier(0.22, 1.15, 0.32, 1) 70ms both;
	}

	@keyframes panda-peek {
		0% {
			opacity: 0;
			transform: translateY(82%) rotate(-16deg) scale(0.68);
		}

		22% {
			opacity: 1;
		}

		58% {
			opacity: 1;
			transform: translateY(-72%) rotate(10deg) scale(1.06);
		}

		78% {
			transform: translateY(-50%) rotate(-3deg) scale(0.98);
		}

		100% {
			opacity: 1;
			transform: translateY(-58%) rotate(4deg) scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.panda-peek {
			animation: none;
			opacity: 1;
			transform: translateY(-58%) rotate(4deg);
		}
	}
</style>
