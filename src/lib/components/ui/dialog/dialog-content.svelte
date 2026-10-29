<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import XIcon from '@lucide/svelte/icons/x';
	import { Button } from '#lib/components/ui/button/index.js';
	import { cn, type WithoutChildrenOrChild } from '#lib/utils.js';
	import DialogOverlay from './dialog-overlay.svelte';
	import DialogPortal from './dialog-portal.svelte';
	import type { Snippet } from 'svelte';
	import type { ComponentProps } from 'svelte';
	import { getPandaPresence, registerDialogPanda } from '#lib/state/panda-presence.svelte';

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

	const presence = getPandaPresence();
</script>

<DialogPortal {...portalProps}>
	<DialogOverlay />
	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		class={cn(
			'fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%_-_2rem)] -translate-x-1/2 -translate-y-1/2 duration-100 outline-none data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 sm:max-w-sm',
			className,
			'overflow-visible bg-transparent p-0 shadow-none ring-0'
		)}
		{...restProps}
	>
		<span
			class={['panda-peek', presence.dialogReady && 'ready']}
			aria-hidden="true"
			{@attach registerDialogPanda(presence)}>🐼</span
		>
		<div
			class={cn(
				'relative z-10 grid gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10',
				className,
				'overflow-visible'
			)}
		>
			{@render children?.()}
			{#if showCloseButton}
				<DialogPrimitive.Close data-slot="dialog-close">
					{#snippet child({ props })}
						<Button variant="ghost" class="absolute top-2 right-2 z-10" size="icon-sm" {...props}>
							<XIcon />
							<span class="sr-only">Close</span>
						</Button>
					{/snippet}
				</DialogPrimitive.Close>
			{/if}
		</div>
	</DialogPrimitive.Content>
</DialogPortal>

<style>
	.panda-peek {
		position: absolute;
		z-index: 1;
		top: 0;
		left: 0.85rem;
		font-size: 5rem;
		line-height: 1;
		pointer-events: none;
		user-select: none;
		transform-origin: 46% 100%;
		transform: translateY(12%) rotate(-8deg);
		opacity: 0;
		filter: drop-shadow(0 0.45rem 0.2rem oklch(0.29 0.04 155 / 0.18));
	}

	.panda-peek.ready {
		opacity: 1;
		animation: panda-peek 1.35s cubic-bezier(0.22, 0.82, 0.28, 1) 80ms both;
	}

	@keyframes panda-peek {
		0% {
			opacity: 1;
			transform: translateY(14%) rotate(-8deg) scale(0.98);
		}

		20% {
			opacity: 1;
			transform: translateY(-2.15rem) rotate(-14deg) scale(0.98);
			animation-timing-function: linear;
		}

		48% {
			opacity: 1;
			transform: translateY(-2.15rem) rotate(-16deg) scale(0.97);
		}

		100% {
			opacity: 1;
			transform: translateY(-74%) rotate(4deg) scale(1);
		}
	}

	:global([data-slot='dialog-content'][data-closed]) .panda-peek {
		animation: none;
		opacity: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.panda-peek.ready {
			animation: none;
			opacity: 1;
			transform: translateY(-74%) rotate(4deg);
		}
	}
</style>
