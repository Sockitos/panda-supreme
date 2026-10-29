import type { ShopItem } from '#lib/domain/types';

export const shopItemEmojis: Readonly<Record<string, string>> = {
	kiss: '💋',
	hug: '🤗',
	cuddle: '🐼',
	movie: '🎬',
	breakfast: '🥞',
	massage: '💆',
	dessert: '🍰',
	'date-night': '🌙',
	'surprise-date': '🎁'
};

export const shopItems: ShopItem[] = [
	{
		id: 'kiss',
		name: 'A kiss',
		description: 'One real kiss, whenever you ask for it.',
		cost: 2
	},
	{
		id: 'hug',
		name: 'A long hug',
		description: 'A hug that lasts until you let go.',
		cost: 3
	},
	{
		id: 'cuddle',
		name: 'Cuddle session',
		description: 'Unhurried time, close together.',
		cost: 5
	},
	{
		id: 'movie',
		name: "Choose tonight's movie",
		description: 'Your pick. No debates.',
		cost: 6
	},
	{
		id: 'breakfast',
		name: 'Breakfast in bed',
		description: 'Morning, made slowly and brought to you.',
		cost: 8
	},
	{
		id: 'massage',
		name: 'Twenty-minute massage',
		description: 'Hands, shoulders, and a quiet room.',
		cost: 10
	},
	{
		id: 'dessert',
		name: 'Dessert date',
		description: 'Something sweet, somewhere easy.',
		cost: 12
	},
	{
		id: 'date-night',
		name: 'Date-night choice',
		description: 'You choose the plan. Panda comes along.',
		cost: 15
	},
	{
		id: 'surprise-date',
		name: 'Surprise date',
		description: 'Leave the evening to Panda.',
		cost: 20
	}
];

export function getShopItem(id: string): ShopItem | undefined {
	return shopItems.find((item) => item.id === id);
}

export function getShopItemEmoji(id: string): string {
	return shopItemEmojis[id] ?? '🎟️';
}
