<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { PANDA_MOVE_MS, getPandaPresence } from '#lib/state/panda-presence.svelte';

	const presence = getPandaPresence();
	const duration = $derived(prefersReducedMotion.current ? 0 : PANDA_MOVE_MS);

	function peek(_node: HTMLElement, { duration }: { duration: number }) {
		return {
			duration,
			css: (_t: number, u: number) => `transform: translateX(${u * 110}px)`
		};
	}
</script>

<div class="panda-side-frame" aria-hidden="true">
	{#if presence.sideShown}
		<div class="slide" in:peek={{ duration }} out:peek={{ duration }}>
			<span data-testid="panda-side">🐼</span>
		</div>
	{/if}
</div>

<style>
	.panda-side-frame {
		position: fixed;
		z-index: 20;
		top: 30%;
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
		right: -3.15rem;
		font-size: 5.8rem;
		line-height: 1;
		transform: rotate(-30deg);
		transform-origin: 70% 48%;
		filter: drop-shadow(-0.35rem 0.45rem 0.2rem oklch(0.29 0.04 155 / 0.16));
		user-select: none;
	}
</style>
