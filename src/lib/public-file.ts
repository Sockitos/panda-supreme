import { asset } from '$app/paths';

/**
 * URL for a file in `static/`. Call this while rendering a page so the path
 * stays correct when GitHub Pages serves the site from a repository subpath.
 */
export function publicFile(path: string): string {
	const file = path.startsWith('/') ? path.slice(1) : path;
	return asset(file as Parameters<typeof asset>[0]);
}
