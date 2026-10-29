<script lang="ts">
	import PauseIcon from '@lucide/svelte/icons/pause';
	import PlayIcon from '@lucide/svelte/icons/play';
	import { Button } from '#lib/components/ui/button/index.js';
	import { claimAudio } from '#lib/audio/session';

	let { src, label }: { src: string; label: string } = $props();

	let audio = $state<HTMLAudioElement | null>(null);
	let playing = $state(false);
	let failed = $state(false);

	function rememberAudio(element: HTMLAudioElement) {
		audio = element;
		return () => {
			if (audio === element) audio = null;
		};
	}

	async function toggle(): Promise<void> {
		if (!audio) return;
		if (playing) {
			audio.pause();
			return;
		}
		claimAudio(audio);
		try {
			await audio.play();
			failed = false;
		} catch {
			failed = true;
		}
	}
</script>

<div class="flex flex-col items-center gap-2">
	<audio
		{@attach rememberAudio}
		{src}
		preload="none"
		onplay={() => (playing = true)}
		onpause={() => (playing = false)}
		onended={() => (playing = false)}
		onerror={() => (failed = true)}
	></audio>
	<Button
		class="size-12 rounded-full"
		variant="secondary"
		size="icon"
		onclick={toggle}
		aria-label={playing ? `Pause ${label}` : `Play ${label}`}
		aria-pressed={playing}
	>
		{#if playing}
			<PauseIcon class="size-5" aria-hidden="true" />
		{:else}
			<PlayIcon class="size-5 fill-current" aria-hidden="true" />
		{/if}
	</Button>
	{#if failed}
		<p class="text-sm text-destructive" role="status">This recording could not play.</p>
	{/if}
</div>
