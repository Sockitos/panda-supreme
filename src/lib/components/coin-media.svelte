<script lang="ts">
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import AudioPlayer from '#lib/components/audio-player.svelte';
	import { publicFile } from '#lib/public-file';
	import type { Coin } from '#lib/domain/types';

	let { coin, autoFlip = true }: { coin: Coin; autoFlip?: boolean } = $props();
	let flipped = $state(false);

	onMount(() => {
		if (!autoFlip) return;
		if (prefersReducedMotion.current) {
			flipped = true;
			return;
		}
		const timer = window.setTimeout(() => {
			flipped = true;
		}, 550);
		return () => window.clearTimeout(timer);
	});
</script>

<div class="coin-view">
	<button
		type="button"
		class={['coin', { flipped }]}
		onclick={() => (flipped = !flipped)}
		aria-label={`Flip coin ${coin.id} to show the ${flipped ? 'front' : 'image'}`}
		aria-pressed={flipped}
	>
		<span class="coin-inner">
			<span class="coin-face coin-front">
				<img src={publicFile('/brand/panda-coin.png')} alt="" />
			</span>
			<span class="coin-face coin-back">
				<img src={publicFile(coin.image)} alt={`Coin ${coin.id}`} />
			</span>
		</span>
	</button>

	{#if coin.audio}
		<AudioPlayer src={publicFile(coin.audio)} label={`coin ${coin.id}`} />
	{/if}
</div>

<style>
	.coin-view {
		display: grid;
		justify-items: center;
		gap: 0.9rem;
	}

	.coin {
		width: min(16rem, calc(100vw - 6.5rem));
		aspect-ratio: 1;
		border-radius: 9999px;
		perspective: 900px;
		outline: none;
		-webkit-tap-highlight-color: transparent;
	}

	.coin:focus,
	.coin:focus-visible {
		outline: none;
	}

	.coin-inner {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transition: transform 700ms cubic-bezier(0.22, 0.78, 0.24, 1);
	}

	.coin.flipped .coin-inner {
		transform: rotateY(180deg);
	}

	.coin-face {
		position: absolute;
		inset: 0;
		display: grid;
		overflow: hidden;
		border: 0.3rem solid color-mix(in oklch, var(--accent), white 18%);
		border-radius: 9999px;
		background: var(--card);
		box-shadow:
			0 1.1rem 2rem color-mix(in oklch, var(--foreground), transparent 82%),
			inset 0 0 0 0.15rem color-mix(in oklch, var(--foreground), transparent 88%);
		backface-visibility: hidden;
	}

	.coin-face img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.coin-back {
		transform: rotateY(180deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.coin-inner {
			transition: none;
		}
	}
</style>
