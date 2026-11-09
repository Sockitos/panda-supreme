<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { prefersReducedMotion } from 'svelte/motion';
	import { PANDA_MOVE_MS, getPandaPresence } from '#lib/state/panda-presence.svelte';

	const PEEK_HOLD_MS = 3000;

	type Side = 'left' | 'right';

	type Spot = {
		id: number;
		side: Side;
		along: number;
	};

	const presence = getPandaPresence();
	const duration = $derived(prefersReducedMotion.current ? 0 : PANDA_MOVE_MS);

	let visible = $state(false);
	let spot = $state<Spot>(randomSpot());

	function randomSpot(): Spot {
		return {
			id: Math.random(),
			side: Math.random() < 0.5 ? 'left' : 'right',
			along: Math.random()
		};
	}

	function peek(_node: HTMLElement, { duration, side }: { duration: number; side: Side }) {
		const distance = side === 'right' ? 110 : -110;
		return {
			duration,
			css: (_t: number, u: number) => `transform: translateX(${u * distance}px)`
		};
	}

	function cycle(active: boolean, moveMs: number): Attachment {
		return () => {
			if (!active) {
				visible = false;
				return;
			}

			let cancelled = false;
			let timer: ReturnType<typeof setTimeout> | undefined;

			const appear = () => {
				if (cancelled) return;
				spot = randomSpot();
				visible = true;
				timer = setTimeout(() => {
					if (cancelled) return;
					visible = false;
					timer = setTimeout(appear, moveMs === 0 ? 0 : moveMs + 40);
				}, PEEK_HOLD_MS);
			};

			appear();

			return () => {
				cancelled = true;
				clearTimeout(timer);
			};
		};
	}
</script>

<div
	class="panda-side-frame"
	style:--peek={spot.along}
	aria-hidden="true"
	{@attach cycle(presence.sideShown, duration)}
>
	{#key spot.id}
		{#if presence.sideShown && visible}
			<div
				class="slide"
				in:peek|global={{ duration, side: spot.side }}
				out:peek={{ duration, side: spot.side }}
			>
				<span class={spot.side} data-testid="panda-side" data-side={spot.side}>🐼</span>
			</div>
		{/if}
	{/key}
</div>

<style>
	.panda-side-frame {
		position: fixed;
		z-index: 20;
		top: calc(4.75rem + var(--peek) * max(0rem, 100dvh - 19rem));
		left: 50%;
		width: min(100%, 28rem);
		height: 8.5rem;
		overflow: hidden;
		pointer-events: none;
		transform: translateX(-50%);
	}

	.slide {
		position: absolute;
		inset: 0;
	}

	span {
		position: absolute;
		top: 0.35rem;
		font-size: 5.8rem;
		line-height: 1;
		user-select: none;
	}

	span.right {
		right: -3.15rem;
		transform: rotate(-30deg);
		transform-origin: 70% 48%;
		filter: drop-shadow(-0.35rem 0.45rem 0.2rem oklch(0.29 0.04 155 / 0.16));
	}

	span.left {
		left: -3.15rem;
		transform: rotate(30deg);
		transform-origin: 30% 48%;
		filter: drop-shadow(0.35rem 0.45rem 0.2rem oklch(0.29 0.04 155 / 0.16));
	}
</style>
