import type { ShopItem } from '#lib/domain/types';

export const shopItemEmojis: Readonly<Record<string, string>> = {
	kiss: '💋',
	hug: '🤗',
	cuddle: '🧸',
	movie: '🎬',
	massage: '💆',
	dinner: '🍝',
	'date-night': '🌙',
	'date-day': '☀️',
	'surprise-date': '🎁',
	'panda-move': '🐼'
};

export const shopItems: ShopItem[] = [
	{
		id: 'kiss',
		name: 'A kiss',
		description: 'One real kiss, whenever you ask for it.',
		cost: 1
	},
	{
		id: 'hug',
		name: 'A long hug',
		description: 'A hug that lasts until you let go.',
		cost: 2
	},
	{
		id: 'cuddle',
		name: 'Cuddle session',
		description: 'Unhurried time, close together.',
		cost: 4
	},
	{
		id: 'movie',
		name: "Choose tonight's movie",
		description: 'Your pick. No debates.',
		cost: 6
	},
	{
		id: 'massage',
		name: 'Twenty-minute massage',
		description: 'Hands, shoulders, and a quiet room.',
		cost: 8
	},
	{
		id: 'dinner',
		name: 'Dinner, cooked for you',
		description: 'Your craving. Panda handles the kitchen.',
		cost: 10
	},
	{
		id: 'date-night',
		name: 'Date-night choice',
		description: 'You choose the plan. Panda comes along.',
		cost: 15
	},
	{
		id: 'date-day',
		name: 'Date-day choice',
		description: 'You choose the day. Panda comes along.',
		cost: 20
	},
	{
		id: 'surprise-date',
		name: 'Surprise date',
		description: 'Leave the evening to Panda.',
		cost: 25
	},
	{
		id: 'panda-move',
		name: 'Surprise supreme panda move',
		description: 'A short cute dance, performed whenever you ask.',
		cost: 0
	}
];

export function getShopItem(id: string): ShopItem | undefined {
	return shopItems.find((item) => item.id === id);
}

export function getShopItemEmoji(id: string): string {
	return shopItemEmojis[id] ?? '🎟️';
}
