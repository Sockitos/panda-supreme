import type { Coin } from '#lib/domain/types';

function mediaId(id: number): string {
	return String(id).padStart(2, '0');
}

const audioExtension: Partial<Record<number, string>> = {
	5: 'm4a'
};

export const coins: Coin[] = Array.from({ length: 50 }, (_, index) => {
	const id = index + 1;
	const fileId = mediaId(id);
	const coin: Coin = {
		id,
		image: `/media/coins/${fileId}.jpg`
	};
	if (id % 5 === 0) {
		coin.audio = `/media/audio/coin-${fileId}.${audioExtension[id] ?? 'wav'}`;
	}
	return coin;
});

export function getCoin(id: number): Coin | undefined {
	return coins.find((coin) => coin.id === id);
}
