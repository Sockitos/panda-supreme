<script lang="ts">
	const sparks = Array.from({ length: 24 }, (_, index) => ({
		angle: `${index * 15}deg`,
		distance: `${7.5 + (index % 4) * 1.2}rem`,
		delay: `${(index % 3) * 35}ms`
	}));
</script>

<div class="fireworks" aria-hidden="true">
	{#each sparks as spark, index (index)}
		<i style:--angle={spark.angle} style:--distance={spark.distance} style:--delay={spark.delay}
		></i>
	{/each}
</div>

<style>
	.fireworks {
		position: absolute;
		inset: 48% auto auto 50%;
		width: 0;
		height: 0;
		pointer-events: none;
	}

	i {
		position: absolute;
		width: 0.4rem;
		height: 1rem;
		border-radius: 999px;
		background: var(--accent);
		opacity: 0;
		transform: rotate(var(--angle)) translateY(-2rem) scaleY(0.5);
		transform-origin: center bottom;
		animation: burst 900ms cubic-bezier(0.16, 0.72, 0.25, 1) var(--delay) both;
	}

	i:nth-child(3n + 1) {
		background: var(--primary);
	}

	i:nth-child(3n + 2) {
		background: oklch(0.72 0.16 42);
	}

	@keyframes burst {
		15% {
			opacity: 1;
		}

		100% {
			opacity: 0;
			transform: rotate(var(--angle)) translateY(calc(var(--distance) * -1)) scaleY(0.15);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.fireworks {
			display: none;
		}
	}
</style>
