import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('static/media');

const titles = [
	'Morning Bamboo',
	'Pocket Hug',
	'River Stones',
	'Window Light',
	'Lantern Path',
	'Tea Steam',
	'Little Bridge',
	'Panda Pause',
	'Garden Gate',
	'Moon Window',
	'Paper Crane',
	'Bamboo Rain',
	'Honey Hour',
	'Two Cups',
	'Star Map',
	'Soft Blanket',
	'Pebble Heart',
	'Orchard Walk',
	'Night Note',
	'Golden Hour',
	'Library Corner',
	'Fern Shadow',
	'Kitchen Song',
	'River Bend',
	'Firefly Minute',
	'Picnic Cloth',
	'Cloud Nap',
	'Ink and Leaf',
	'Doorstep',
	'Velvet Evening',
	'Panda Prints',
	'Lemon Light',
	'Hidden Bench',
	'Bamboo Wind',
	'Lullaby Coin',
	'Sunrise Steps',
	'Pocket Stone',
	'Rain Window',
	'Wildflower',
	'Table for Two',
	'Grove Path',
	'Warm Bowl',
	'Night Market',
	'Quiet Promise',
	'Cedar Chest',
	'Meadow Nap',
	'Second Lantern',
	"Panda's Favorite",
	'Almost Home',
	'The Last Coin'
];

function coinSvg(id) {
	const fileId = String(id).padStart(2, '0');
	const hue = 90 + (id % 12) * 4;
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Coin ${id}">
  <circle cx="100" cy="100" r="96" fill="oklch(0.84 0.1 92)"/>
  <circle cx="100" cy="100" r="78" fill="oklch(0.45 0.09 ${hue})" />
  <circle cx="100" cy="100" r="64" fill="oklch(0.96 0.02 98)"/>
  <path d="M78 118c8-28 36-42 52-24" fill="none" stroke="oklch(0.4 0.08 150)" stroke-width="6" stroke-linecap="round"/>
  <path d="M86 78c10-16 18-16 24 0" fill="oklch(0.55 0.12 145)"/>
  <text x="100" y="126" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="oklch(0.3 0.04 155)">${fileId}</text>
</svg>`;
}

function wav(coinId) {
	const sampleRate = 22050;
	const samples = Math.floor(sampleRate * 1.15);
	const data = Buffer.alloc(44 + samples * 2);
	data.write('RIFF', 0);
	data.writeUInt32LE(36 + samples * 2, 4);
	data.write('WAVE', 8);
	data.write('fmt ', 12);
	data.writeUInt32LE(16, 16);
	data.writeUInt16LE(1, 20);
	data.writeUInt16LE(1, 22);
	data.writeUInt32LE(sampleRate, 24);
	data.writeUInt32LE(sampleRate * 2, 28);
	data.writeUInt16LE(2, 32);
	data.writeUInt16LE(16, 34);
	data.write('data', 36);
	data.writeUInt32LE(samples * 2, 40);
	const start = 392 + (coinId % 5) * 12;
	const next = start * 1.25;
	for (let index = 0; index < samples; index += 1) {
		const time = index / sampleRate;
		const frequency = index < samples / 2 ? start : next;
		const envelope = Math.min(1, time * 18) * Math.exp(-2.4 * time);
		const sample = Math.sin(2 * Math.PI * frequency * time) * envelope * 0.32;
		data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), 44 + index * 2);
	}
	return data;
}

const moments = {
	sleep: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320"><rect width="640" height="320" rx="32" fill="#1f3d32"/><circle cx="470" cy="90" r="42" fill="#f3e2b0"/><path d="M80 230c70-80 140-80 210 0" fill="none" stroke="#8fb89a" stroke-width="16" stroke-linecap="round"/><path d="M250 230c50-54 100-54 150 0" fill="none" stroke="#d7b56a" stroke-width="16" stroke-linecap="round"/></svg>`,
	'good-morning': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320"><rect width="640" height="320" rx="32" fill="#f6efe0"/><circle cx="320" cy="250" r="90" fill="#e7c56a"/><path d="M120 250h400" stroke="#2f6b45" stroke-width="12" stroke-linecap="round"/><path d="M180 150c20-40 50-40 70 0M390 140c18-36 46-36 64 0" fill="#6ea37a"/></svg>`,
	mesh: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320"><rect width="640" height="320" rx="32" fill="#f4efe4"/><g stroke="#2f6b45" stroke-width="8" fill="none">${Array.from({ length: 8 }, (_, index) => `<path d="M${80 + index * 70} 40c40 80-40 120 0 240"/>`).join('')}</g><circle cx="320" cy="160" r="54" fill="none" stroke="#c9a15b" stroke-width="14"/></svg>`,
	'come-prima': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320"><rect width="640" height="320" rx="32" fill="#f7f1e6"/><rect x="120" y="150" width="400" height="18" rx="9" fill="#8b5a3c"/><circle cx="210" cy="120" r="28" fill="#f2d48a"/><circle cx="430" cy="120" r="28" fill="#6ea37a"/><path d="M250 210h140" stroke="#2f6b45" stroke-width="10" stroke-linecap="round"/></svg>`,
	christmas: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320"><rect width="640" height="320" rx="32" fill="#16382c"/><path d="M320 50l70 90h-40l60 70h-50l70 80H210l70-80h-50l60-70h-40z" fill="#2f6b45"/><circle cx="320" cy="78" r="12" fill="#f2d48a"/><circle cx="250" cy="150" r="8" fill="#f6efe0"/><circle cx="400" cy="190" r="8" fill="#e7c56a"/></svg>`
};

await mkdir(path.join(root, 'coins'), { recursive: true });
await mkdir(path.join(root, 'audio'), { recursive: true });
await mkdir(path.join(root, 'moments'), { recursive: true });

for (let id = 1; id <= titles.length; id += 1) {
	const fileId = String(id).padStart(2, '0');
	await writeFile(path.join(root, 'coins', `${fileId}.svg`), coinSvg(id));
	if (id % 5 === 0) await writeFile(path.join(root, 'audio', `coin-${fileId}.wav`), wav(id));
}

for (const [name, svg] of Object.entries(moments)) {
	await writeFile(path.join(root, 'moments', `${name}.svg`), svg);
}
