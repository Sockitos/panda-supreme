import { createContext, untrack } from 'svelte';
import type { Attachment } from 'svelte/attachments';

export const PANDA_MOVE_MS = 480;

type PandaSpot = 'hero' | 'side' | 'dialog';

export class PandaPresence {
	onHome = $state(true);
	heroInView = $state(true);
	dialogs = $state(0);
	heroShown = $state(true);
	sideShown = $state(false);
	dialogReady = $state(false);

	#busy = false;
	#from: PandaSpot | 'none' = 'none';
	#timer: ReturnType<typeof setTimeout> | undefined;

	constructor(onHome: boolean) {
		this.onHome = onHome;
		this.heroInView = onHome;
		this.heroShown = onHome;
		this.sideShown = !onHome;
	}

	readonly target = $derived<PandaSpot>(
		this.dialogs > 0 ? 'dialog' : this.onHome && this.heroInView ? 'hero' : 'side'
	);

	setOnHome(onHome: boolean): void {
		untrack(() => {
			if (this.onHome === onHome) return;
			this.onHome = onHome;
			if (!onHome) this.heroInView = false;
			if (!onHome && this.heroShown && this.dialogs === 0) {
				this.#clear();
				this.#busy = false;
				this.#from = 'none';
				this.heroShown = false;
				this.sideShown = true;
				this.dialogReady = false;
				return;
			}
			this.#sync();
		});
	}

	setHeroInView(visible: boolean): void {
		untrack(() => {
			if (this.heroInView === visible) return;
			this.heroInView = visible;
			this.#sync();
		});
	}

	pushDialog(): void {
		untrack(() => {
			this.dialogs += 1;
			if (this.dialogs === 1) this.#sync();
		});
	}

	popDialog(): void {
		untrack(() => {
			this.dialogs = Math.max(0, this.dialogs - 1);
			if (this.dialogs === 0) this.#sync();
		});
	}

	#sync(): void {
		const next = this.target;
		if (this.#busy) {
			if (next === this.#from) {
				this.#clear();
				this.#busy = false;
				this.#from = 'none';
				this.#apply(next);
			}
			return;
		}

		const current = this.#current();
		if (next === current) return;

		const stageVisible = current === 'hero' || current === 'side';
		if (stageVisible && !reducedMotion()) {
			this.#from = current;
			this.heroShown = false;
			this.sideShown = false;
			this.dialogReady = false;
			this.#busy = true;
			this.#timer = setTimeout(() => {
				this.#timer = undefined;
				this.#busy = false;
				this.#from = 'none';
				this.#apply(this.target);
			}, PANDA_MOVE_MS);
			return;
		}

		if (current === 'dialog' && next !== 'dialog' && !reducedMotion()) {
			this.#from = 'dialog';
			this.dialogReady = false;
			this.#busy = true;
			this.#timer = setTimeout(() => {
				this.#timer = undefined;
				this.#busy = false;
				this.#from = 'none';
				this.#apply(this.target);
			}, 160);
			return;
		}

		this.#apply(next);
	}

	#current(): PandaSpot | 'none' {
		if (this.dialogReady) return 'dialog';
		if (this.heroShown) return 'hero';
		if (this.sideShown) return 'side';
		return 'none';
	}

	#apply(next: PandaSpot): void {
		this.heroShown = next === 'hero';
		this.sideShown = next === 'side';
		this.dialogReady = next === 'dialog';
	}

	#clear(): void {
		if (this.#timer !== undefined) {
			clearTimeout(this.#timer);
			this.#timer = undefined;
		}
	}
}

export const [getPandaPresence, setPandaPresence] = createContext<PandaPresence>();

function reducedMotion(): boolean {
	return (
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

export function watchHeroPanda(presence: PandaPresence): Attachment {
	return (node) => {
		const read = () => {
			const box = node.getBoundingClientRect();
			const topLimit = 72;
			presence.setHeroInView(box.bottom > topLimit && box.top < window.innerHeight);
		};
		read();
		const observer = new IntersectionObserver(read, { threshold: [0, 1] });
		observer.observe(node);
		window.addEventListener('scroll', read, { passive: true });
		window.addEventListener('resize', read);
		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', read);
			window.removeEventListener('resize', read);
		};
	};
}

export function registerDialogPanda(presence: PandaPresence): Attachment {
	return () => {
		presence.pushDialog();
		return () => presence.popDialog();
	};
}
