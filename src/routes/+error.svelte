<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
</script>

<svelte:head>
	<title>Page not found · Panda Supreme</title>
</svelte:head>

<div class="space-y-4">
	<h1 class="text-4xl">This path wandered off</h1>
	<p class="text-muted-foreground">
		{page.status}: {page.error?.message ?? 'The page is not here.'}
	</p>
	<Button href={resolve('/')} class="min-h-11">Back home</Button>
</div>
