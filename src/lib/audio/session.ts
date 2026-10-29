let current: HTMLAudioElement | null = null;

export function claimAudio(audio: HTMLAudioElement): void {
	if (current && current !== audio) current.pause();
	current = audio;
}
