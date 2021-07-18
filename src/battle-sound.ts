
export class BattleBGM {
	/**
	 * May be shared with other BGM objects: every battle has its own BattleBGM
	 * object, but two battles with the same music will have the same HTMLAudioElement
	 * object.
	 */
	sound?: HTMLAudioElement;
	url: string;
	timer: number | undefined = undefined;
	loopstart: number;
	loopend: number;
	/**
	 * When multiple battles with BGM are open, they will be `isPlaying`, but only the
	 * first one will be `isActuallyPlaying`. In addition, muting volume or setting
	 * BGM volume to 0 will set `isActuallyPlaying` to false.
	 */
	isPlaying = false;
	isActuallyPlaying = false;
	/**
	 * The sound should be rewound when it next plays.
	 */
	willRewind = true;
	constructor(url: string, loopstart: number, loopend: number) {
		this.url = url;
		this.loopstart = loopstart;
		this.loopend = loopend;
	}
	play() {
		this.willRewind = true;
		this.resume();
	}
	resume() {
		this.isPlaying = true;
		this.actuallyResume();
	}
	pause() {
		this.isPlaying = false;
		this.actuallyPause();
		BattleBGM.update();
	}
	stop() {
		this.pause();
		this.willRewind = true;
	}
	destroy() {
		BattleSound.deleteBgm(this);
		this.pause();
	}

	actuallyResume() {
		if (this !== BattleSound.currentBgm()) return;
		if (this.isActuallyPlaying) return;

		if (!this.sound) this.sound = BattleSound.getSound(this.url);
		if (!this.sound) return;
		if (this.willRewind) this.sound.currentTime = 0;
		this.willRewind = false;
		this.isActuallyPlaying = true;
		this.sound.volume = BattleSound.bgmVolume / 100;
		this.sound.play();
		this.updateTime();
	}
	actuallyPause() {
		if (!this.isActuallyPlaying) return;
		this.isActuallyPlaying = false;
		this.sound!.pause();
		this.updateTime();
	}
	/**
	 * Handles the hard part of looping the sound
	 */
	updateTime() {
		clearTimeout(this.timer);
		this.timer = undefined;
		if (this !== BattleSound.currentBgm()) return;
		if (!this.sound) return;

		const progress = this.sound.currentTime * 1000;
		if (progress > this.loopend - 1000) {
			this.sound.currentTime -= (this.loopend - this.loopstart) / 1000;
		}

		this.timer = setTimeout(() => {
			this.updateTime();
		}, Math.max(this.loopend - progress, 1));
	}

	static update() {
		const current = BattleSound.currentBgm();
		for (const bgm of BattleSound.bgm) {
			if (bgm.isPlaying) {
				if (bgm === current) {
					bgm.actuallyResume();
				} else {
					bgm.actuallyPause();
				}
			}
		}
	}
}

export const BattleSound = new class {
	soundCache: {[url: string]: HTMLAudioElement | undefined} = {};

	bgm: BattleBGM[] = [];

	// options
	effectVolume = 50;
	bgmVolume = 50;
	muted = false;

	getSound(url: string) {
		if (!window.HTMLAudioElement) return;
		if (this.soundCache[url]) return this.soundCache[url];
		try {
			const sound = document.createElement('audio');
			sound.src = 'https://' + Config.routes.client + '/' + url;
			sound.volume = this.effectVolume / 100;
			this.soundCache[url] = sound;
			return sound;
		} catch {}
	}

	playEffect(url: string) {
		this.playSound(url, this.muted ? 0 : this.effectVolume);
	}

	playSound(url: string, volume: number) {
		if (!volume) return;
		const effect = this.getSound(url);
		if (effect) {
			effect.volume = volume / 100;
			effect.play();
		}
	}

	/** loopstart and loopend are in milliseconds */
	loadBgm(url: string, loopstart: number, loopend: number, replaceBGM?: BattleBGM | null) {
		if (replaceBGM) {
			replaceBGM.stop();
			this.deleteBgm(replaceBGM);
		}

		const bgm = new BattleBGM(url, loopstart, loopend);
		this.bgm.push(bgm);
		return bgm;
	}
	deleteBgm(bgm: BattleBGM) {
		const soundIndex = BattleSound.bgm.indexOf(bgm);
		if (soundIndex >= 0) BattleSound.bgm.splice(soundIndex, 1);
	}

	currentBgm() {
		if (!this.bgmVolume || this.muted) return false;
		for (const bgm of this.bgm) {
			if (bgm.isPlaying) return bgm;
		}
		return null;
	}

	// setting
	setMute(muted: boolean) {
		muted = !!muted;
		if (this.muted === muted) return;
		this.muted = muted;
		BattleBGM.update();
	}

	loudnessPercentToAmplitudePercent(loudnessPercent: number) {
		// 10 dB is perceived as approximately twice as loud
		let decibels = 10 * Math.log(loudnessPercent / 100) / Math.log(2);
		return Math.pow(10, decibels / 20) * 100;
	}
	setBgmVolume(bgmVolume: number) {
		this.bgmVolume = this.loudnessPercentToAmplitudePercent(bgmVolume);
		BattleBGM.update();
	}
	setEffectVolume(effectVolume: number) {
		this.effectVolume = this.loudnessPercentToAmplitudePercent(effectVolume);
	}
};

if (typeof PS === 'object') {
	PS.prefs.subscribeAndRun(key => {
		if (!key || key === 'musicvolume' || key === 'effectvolume' || key === 'mute') {
			BattleSound.effectVolume = PS.prefs.effectvolume;
			BattleSound.bgmVolume = PS.prefs.musicvolume;
			BattleSound.muted = PS.prefs.mute;
			BattleBGM.update();
		}
	});
}
