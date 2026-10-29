<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import HouseIcon from '@lucide/svelte/icons/house';
	import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
	import StoreIcon from '@lucide/svelte/icons/store';
	import TicketIcon from '@lucide/svelte/icons/ticket';
	import { cn } from '#lib/utils.js';

	const home = resolve('/');
	const collection = resolve('/collection');
	const shop = resolve('/shop');
	const vouchers = resolve('/vouchers');
	const routeId = $derived(page.route.id);

	const links = $derived([
		{ href: home, label: 'Home', icon: HouseIcon, active: routeId === '/' },
		{
			href: collection,
			label: 'Collection',
			icon: LayoutGridIcon,
			active: routeId === '/collection'
		},
		{
			href: shop,
			label: 'Shop',
			icon: StoreIcon,
			active: routeId === '/shop'
		},
		{
			href: vouchers,
			label: 'Vouchers',
			icon: TicketIcon,
			active: routeId === '/vouchers'
		}
	]);
</script>

<nav
	aria-label="Main"
	class="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur"
>
	<ul
		class="mx-auto flex max-w-md items-stretch justify-around px-2 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))]"
	>
		{#each links as link (link.label)}
			{@const Icon = link.icon}
			<li class="flex-1">
				<a
					href={link.href}
					aria-current={link.active ? 'page' : undefined}
					class={cn(
						'flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold text-muted-foreground',
						link.active && 'bg-secondary text-primary'
					)}
				>
					<Icon class="size-5" aria-hidden="true" />
					{link.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
