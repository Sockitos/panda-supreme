import type { Moment } from '#lib/domain/types';

export const moments: Moment[] = [
	{
		threshold: 10,
		title: 'Sleep',
		message: 'The day can soften now. Close your eyes. This moment is only for rest.',
		emoji: '😴'
	},
	{
		threshold: 20,
		title: 'Good Morning',
		message: 'Good morning. Something gentle is waiting where the day begins.',
		emoji: '☀️'
	},
	{
		threshold: 30,
		title: 'Mesh',
		message: 'A moment made to sit close to you, and to stay.',
		emoji: '🫶'
	},
	{
		threshold: 40,
		title: 'Dinner at Come Prima',
		message: 'A table for two, at the place that already feels like yours.',
		emoji: '🍝'
	},
	{
		threshold: 50,
		title: 'Christmas Is Coming',
		message: 'The season is gathering. There is more warmth on the way.',
		emoji: '🎄'
	}
];

export function getMoment(threshold: number): Moment | undefined {
	return moments.find((moment) => moment.threshold === threshold);
}
