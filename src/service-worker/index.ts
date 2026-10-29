/// <reference types="@sveltejs/kit" />
import { assets, immutable, prerendered } from '$app/manifest';
import { dev, version } from '$app/env';
import { asset } from '$app/paths';

const worker = self as unknown as ServiceWorkerGlobalScope;
const cacheName = `panda-${version}`;

function unique(paths: string[]): string[] {
	return [...new Set(paths.filter(Boolean))];
}

const precache = unique([
	...immutable.map((entry) => entry.path),
	...assets.map((entry) => asset(entry.path)),
	...prerendered.map((entry) => entry.path)
]);

worker.addEventListener('install', (event) => {
	if (dev || precache.length === 0) return;
	event.waitUntil(
		caches
			.open(cacheName)
			.then((cache) => cache.addAll(precache))
			.then(() => worker.skipWaiting())
	);
});

worker.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))
			)
			.then(() => worker.clients.claim())
	);
});

worker.addEventListener('fetch', (event) => {
	if (dev || event.request.method !== 'GET') return;
	const url = new URL(event.request.url);
	if (url.origin !== worker.location.origin) return;
	event.respondWith(networkThenCache(event.request));
});

async function networkThenCache(request: Request): Promise<Response> {
	const cached = await caches.match(request);
	try {
		const response = await fetch(request);
		if (response.ok && response.type === 'basic') {
			const cache = await caches.open(cacheName);
			await cache.put(request, response.clone());
		}
		return response;
	} catch (error) {
		if (cached) return cached;
		throw error;
	}
}
