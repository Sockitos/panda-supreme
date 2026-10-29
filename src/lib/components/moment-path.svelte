<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import MomentReveal from '#lib/components/moment-reveal.svelte';
	import { moments } from '#lib/content/moments';
	import type { Moment } from '#lib/domain/types';
	import { getPandaStore } from '#lib/state/panda.svelte';

	let { progress }: { progress: number } = $props();

	const store = getPandaStore();
	let replay = $state<Moment | null>(null);
	const unlocked = $derived(new Set(store.snapshot.unlockedThresholds));
	const revealed = $derived(new Set(store.snapshot.revealedThresholds));
	const nextMoment = $derived(moments.find((moment) => moment.threshold > progress));

	function fillFor(index: number): number {
		const start = index === 0 ? 0 : moments[index - 1].threshold;
		const end = moments[index].threshold;
		if (progress >= end) return 100;
		if (progress <= start) return 0;
		return ((progress - start) / (end - start)) * 100;
	}
</script>

<section class="moment-path" aria-labelledby="path-copy">
	<p id="path-copy">
		Five little moments, opened along the way&nbsp;<span aria-hidden="true">🎁</span>
	</p>

	<ol>
		<li class="beginning unlocked">
			<div class="trail" aria-hidden="true">
				<span class="trail-line">
					<span class="trail-fill" style:height={`${fillFor(0)}%`}></span>
				</span>
				<span class="milestone"><span>🐼</span></span>
			</div>
			<article>
				<div class="moment-meta">
					<span>0 coins</span>
					<strong>Beginning</strong>
				</div>
				<h3>The supreme adventure begins</h3>
				<p>Your panda is ready to cheer you on, one coin at a time.</p>
			</article>
		</li>
		{#each moments as moment, index (moment.threshold)}
			{@const open = unlocked.has(moment.threshold)}
			{@const isNext = nextMoment?.threshold === moment.threshold}
			<li class={{ unlocked: open, next: isNext }}>
				<div class="trail" aria-hidden="true">
					{#if index < moments.length - 1}
						<span class="trail-line">
							<span class="trail-fill" style:height={`${fillFor(index + 1)}%`}></span>
						</span>
					{/if}
					<span class="milestone">
						{#if open}
							<span>✓</span>
						{:else}
							{moment.threshold}
						{/if}
					</span>
				</div>
				<article>
					<div class="moment-meta">
						<span>{moment.threshold} coins</span>
						{#if isNext}
							<strong>Next moment</strong>
						{:else if open}
							<strong>Unlocked</strong>
						{/if}
					</div>
					<h3>
						{#if open}
							{moment.title}
						{:else}
							Panda moment
						{/if}
					</h3>
					<p>
						{#if open}
							{moment.message}
						{:else if isNext}
							{moment.threshold - progress} more
							{moment.threshold - progress === 1 ? 'coin' : 'coins'} until this opens.
						{:else}
							It opens when {moment.threshold} coins are found.
						{/if}
					</p>
					{#if revealed.has(moment.threshold)}
						<Button
							class="mt-4 min-h-11 px-4 font-bold"
							variant="secondary"
							onclick={() => (replay = moment)}
						>
							Open again
						</Button>
					{/if}
				</article>
			</li>
		{/each}
	</ol>
</section>

{#if replay}
	<MomentReveal moment={replay} ondismiss={() => (replay = null)} />
{/if}

<style>
	.moment-path {
		display: grid;
		gap: 1.5rem;
	}

	#path-copy {
		border-bottom: 1px solid var(--border);
		padding-bottom: 1rem;
		color: var(--muted-foreground);
		font-size: 0.95rem;
		line-height: 1.55;
	}

	article > p {
		color: var(--muted-foreground);
		line-height: 1.55;
	}

	ol {
		display: grid;
	}

	li {
		display: grid;
		grid-template-columns: 2.75rem minmax(0, 1fr);
		gap: 0.85rem;
		min-height: 9rem;
	}

	.trail {
		position: relative;
		display: flex;
		justify-content: center;
	}

	.trail-line {
		position: absolute;
		top: 2.75rem;
		bottom: 0;
		width: 0.3rem;
		overflow: hidden;
		border-radius: 999px;
		background: var(--muted);
	}

	.trail-fill {
		display: block;
		width: 100%;
		border-radius: inherit;
		background: var(--primary);
	}

	.milestone {
		position: relative;
		z-index: 1;
		display: grid;
		width: 2.75rem;
		height: 2.75rem;
		place-items: center;
		border: 2px solid var(--border);
		border-radius: 50%;
		background: var(--background);
		color: var(--muted-foreground);
		font-size: 0.8rem;
		font-weight: 800;
	}

	.unlocked .milestone {
		border-color: var(--primary);
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.next .milestone {
		border-color: var(--accent);
		box-shadow: 0 0 0 0.3rem color-mix(in oklch, var(--accent), transparent 55%);
		color: var(--accent-foreground);
	}

	article {
		padding: 0.15rem 0 2rem;
	}

	.moment-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		color: var(--muted-foreground);
		font-size: 0.78rem;
		font-weight: 700;
	}

	.moment-meta strong {
		border-radius: 999px;
		background: var(--secondary);
		padding: 0.2rem 0.6rem;
		color: var(--secondary-foreground);
	}

	.next .moment-meta strong {
		background: var(--accent);
		color: var(--accent-foreground);
	}

	h3 {
		margin-top: 0.45rem;
		font-family: var(--font-heading);
		font-size: 1.35rem;
		font-weight: 800;
		line-height: 1.2;
	}

	article > p {
		margin-top: 0.35rem;
	}
</style>
