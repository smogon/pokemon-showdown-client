import type { Battle } from './battle';

export class ReplayScreenWakeLock {
	private battle: Battle | null = null;
	private wakeLock: WakeLockSentinel | null = null;
	private requesting: Promise<WakeLockSentinel> | null = null;

	constructor(battle: Battle | null = null) {
		this.battle = battle;
		if (typeof document !== 'undefined') {
			document.addEventListener('visibilitychange', this.onVisibilityChange);
		}
	}

	update(battle: Battle | null = this.battle) {
		this.battle = battle;
		if (this.shouldLock()) {
			this.request();
		} else {
			this.release();
		}
	}

	release() {
		if (!this.wakeLock) return;
		const wakeLock = this.wakeLock;
		this.wakeLock = null;
		wakeLock.removeEventListener('release', this.onRelease);
		if (!wakeLock.released) wakeLock.release().catch(() => {});
	}

	destroy() {
		if (typeof document !== 'undefined') {
			document.removeEventListener('visibilitychange', this.onVisibilityChange);
		}
		this.battle = null;
		this.release();
	}

	private shouldLock() {
		if (!this.battle) return false;
		const battle = this.battle;
		if (battle.paused || !battle.started || battle.ended || battle.atQueueEnd) return false;
		// Screen Wake Lock follows Page Visibility; PS panel visibility is not available on replay pages/embeds.
		return typeof document === 'undefined' || document.visibilityState === 'visible';
	}

	private getWakeLock() {
		if (typeof navigator === 'undefined') return null;
		return 'wakeLock' in navigator ? navigator.wakeLock : null;
	}

	private request() {
		if (this.wakeLock || this.requesting) return;
		const wakeLock = this.getWakeLock();
		if (!wakeLock) return;
		this.requesting = wakeLock.request('screen');
		this.requesting.then(wakeLockSentinel => {
			this.requesting = null;
			this.wakeLock = wakeLockSentinel;
			wakeLockSentinel.addEventListener('release', this.onRelease);
			if (!this.shouldLock()) this.release();
		}).catch(() => {
			this.requesting = null;
		});
	}

	private onRelease = () => {
		this.wakeLock = null;
	};

	private onVisibilityChange = () => {
		this.update();
	};
}
