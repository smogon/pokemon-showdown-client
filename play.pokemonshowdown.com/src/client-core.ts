/**
 * Client core
 *
 * No dependencies.
 * Does three unrelated things:
 * 1. sets up polyfills where necessary
 * 2. sets up PS's model base classes
 * 3. sets up the model and view for PS's backgrounds
 *
 * The background is mostly here so the new background can be loaded ASAP.
 *
 * @author Guangcong Luo <guancongluo@gmail.com>
 * @license AGPLv3
 */

import { Config, PS } from "./client-main";
declare const ColorThief: any;

/**********************************************************************
 * PS Models
 *********************************************************************/
// PS's model classes are defined here

const PSURL = `${document.location.protocol !== 'http:' ? 'https:' : ''}//${Config.routes.client}/`;
const MAINMENU_BUTTONS = 8;

export class PSSubscription<T = any> {
	observable: PSModel<T> | PSStreamModel<T>;
	listener: (value: T) => void;
	constructor(observable: PSModel<T> | PSStreamModel<T>, listener: (value: T) => void) {
		this.observable = observable;
		this.listener = listener;
	}
	unsubscribe() {
		const index = this.observable.subscriptions.indexOf(this as any);
		if (index >= 0) this.observable.subscriptions.splice(index, 1);
	}
}

/**
 * PS Models roughly implement the Observable spec. By default,
 * PSModel notifies listeners when the model is updated. With a
 * value, PSModel can also stream data out.
 *
 * Note that unlike React's usual paradigm, PS Models are not
 * immutable.
 */
export class PSModel<T = null> {
	subscriptions: PSSubscription<T>[] = [];
	subscribe(listener: (value: T) => void) {
		const subscription = new PSSubscription<T>(this, listener);
		this.subscriptions.push(subscription);
		return subscription;
	}
	subscribeAndRun(listener: (value: T) => void, value?: T) {
		const subscription = this.subscribe(listener);
		subscription.listener(value!);
		return subscription;
	}
	update(this: PSModel): void;
	update(value: T): void;
	update(value?: T) {
		for (const subscription of this.subscriptions) {
			subscription.listener(value!);
		}
	}
}

/**
 * @see PSModel
 *
 * The main difference is that StreamModel keeps a backlog,
 * so events generated before something subscribes are not
 * lost. Nullish values are not kept in the backlog.
 */
export class PSStreamModel<T = string> {
	subscriptions: PSSubscription<T>[] = [];
	backlog: NonNullable<T>[] | null = [];
	subscribe(listener: (value: T) => void) {
		const subscription: PSSubscription<T> = new PSSubscription<T>(this, listener);
		this.subscriptions.push(subscription);
		if (this.backlog) {
			for (const update of this.backlog) {
				subscription.listener(update);
			}
			this.backlog = null;
		}
		return subscription;
	}
	subscribeAndRun(listener: (value: T) => void, value: T = null!) {
		const subscription = this.subscribe(listener);
		subscription.listener(value);
		return subscription;
	}
	update(value: T) {
		if (!this.subscriptions.length && value !== null && value !== undefined) {
			// save updates for later
			(this.backlog ||= []).push(value);
		}
		for (const subscription of this.subscriptions) {
			subscription.listener(value);
		}
	}
}

// type JSONObject = {[k: string]: JSONValue};
// type JSONArray = JSONValue[];
// type JSONValue = number | string | boolean | null | JSONObject | JSONArray;

/**********************************************************************
 * Background Model
 *********************************************************************/

/**
 * PS background model. Separate from PSPrefs because unlike prefs,
 * backgrounds can be set separately per server, instead of being
 * shared among all servers.
 *
 * Streams the current URL
 */
export const PSBackground = new class extends PSStreamModel<string | null> {
	id = '';
	curId = '';
	attrib: { url: string, title: string, artist: string } | null = null;
	changeCount = 0;
	menuColors: string[] | null = null;

	constructor() {
		super();
		try {
			let bg = localStorage.getItem('showdown_bg')?.split('\n') || [''];
			if (bg.length === 1) {
				// id
				this.load('', bg[0]);
			} else if (bg.length === 2) {
				// url, id
				this.load(bg[0], bg[1]);
			} else if (bg.length >= 10) {
				// url, id, menuColors
				this.load(bg[0], bg[1], bg.slice(2));
			}
		} catch {}
	}
	save(bgUrl: string) {
		if (this.id !== 'custom') {
			localStorage.setItem('showdown_bg', this.id);
		} else if (this.menuColors) {
			localStorage.setItem('showdown_bg', bgUrl + '\n' + this.id + '\n' + this.menuColors.join('\n'));
		} else {
			localStorage.setItem('showdown_bg', bgUrl + '\n' + this.id);
		}
	}
	set(bgUrl: string, bgid: string) {
		this.load(bgUrl, bgid);
		this.save(bgUrl);
	}

	load(bgUrl: string, bgid: string, menuColors: string[] | null = null) {
		// id
		this.id = bgid;

		// curid
		if (!bgid || bgid === 'waterfall') {
			if (location.host === 'smogtours.psim.us') {
				bgid = 'shaymin';
			} else {
				const bgs = ['horizon', 'ocean', 'shaymin', 'charizards'];
				bgid = bgs[Math.floor(Math.random() * bgs.length)];
				// if someone clicked the random button, try to roll a different bg than before
				if (bgid === this.curId) bgid = bgs[Math.floor(Math.random() * bgs.length)];
			}
		}
		this.curId = bgid;

		if (!bgUrl) {
			bgUrl = (bgid === 'solidblue' ? '#344b6c' : PSURL + 'fx/client-bg-' + bgid + '.jpg');
		}

		// April Fool's 2016 - Digimon theme
		// bgid = 'digimon';
		// bgUrl = PSURL + 'sprites/afd/digimonbg.jpg';

		this.changeCount++;

		// menuColors, attrib
		let attrib = null;
		switch (bgid) {
		case 'horizon':
			menuColors = [
				"227.058823529412,21.1618257261411%",
				"231.176470588235,21.25%",
				"234.418604651163,22.9946524064171%",
				"221.818181818182,30%",
				"222.413793103448,22.8346456692913%",
				"221.818181818182,35.8695652173913%",
				"221.111111111111,24.3243243243243%",
				"217.241379310345,22.8346456692913%",
			];
			attrib = {
				url: 'https://vtas.deviantart.com/art/Pokemon-Horizon-312267168',
				title: 'Horizon',
				artist: 'Vivian Zou',
			};
			break;
		case 'ocean':
			menuColors = [
				"207.1875,54.7008547008547%",
				"207.36,50.6072874493927%",
				"207.931034482759,54.7169811320755%",
				"208.235294117647,61.4457831325301%",
				"211.818181818182,61.1111111111111%",
				"214.468085106383,54.0229885057471%",
				"205,52.9411764705882%",
				"187.5,42.8571428571429%",
			];
			attrib = {
				url: 'https://quanyails.deviantart.com/art/Sunrise-Ocean-402667154',
				title: 'Sunrise Ocean',
				artist: 'Quanyails',
			};
			break;
		case 'shaymin':
			menuColors = [
				"30,23.5294117647059%",
				"38.8235294117647,19.5402298850575%",
				"66,8.1967213114754%",
				"75,7.79220779220779%",
				"60,7.86516853932585%",
				"120,5.08474576271187%",
				"152.307692307692,5.67685589519651%",
				"168.75,8.60215053763441%",
			];
			attrib = {
				url: 'http://cargocollective.com/bluep',
				title: 'Shaymin',
				artist: 'Daniel Kong',
			};
			break;
		case 'charizards':
			menuColors = [
				"151.2,20.4918032786885%",
				"132.307692307692,15.2941176470588%",
				"160.46511627907,22.7513227513228%",
				"161.666666666667,21.6867469879518%",
				"187.5,18.4615384615385%",
				"202,25.4237288135593%",
				"206.511627906977,36.7521367521367%",
				"207.457627118644,53.1531531531531%",
			];
			attrib = {
				url: 'https://lit.link/en/seiryuuden',
				title: 'Charizards',
				artist: 'Jessica Valencia',
			};
			break;
		case 'digimon':
			menuColors = [
				"170.45454545454544,27.500000000000004%",
				"84.70588235294119,13.821138211382115%",
				"112.50000000000001,7.8431372549019605%",
				"217.82608695652175,54.761904761904766%",
				"0,1.6949152542372816%",
				"170.45454545454544,27.500000000000004%",
				"217.82608695652175,54.761904761904766%",
				"84.70588235294119,13.821138211382115%",
			];
		}
		if (!menuColors && bgUrl.startsWith('#')) {
			const r = parseInt(bgUrl.slice(1, 3), 16) / 255;
			const g = parseInt(bgUrl.slice(3, 5), 16) / 255;
			const b = parseInt(bgUrl.slice(5, 7), 16) / 255;
			const hs = this.getHueSat(r, g, b);
			menuColors = Array(MAINMENU_BUTTONS).fill(hs);
		}
		this.attrib = attrib;
		this.menuColors = menuColors;
		if (!menuColors) {
			this.extractMenuColors(bgUrl);
		}
		this.update(bgUrl);
	}
	extractMenuColors(bgUrl: string) {
		const changeCount = this.changeCount;
		// We need the image object to load it on a canvas to detect the main color.
		const img = new Image();
		img.onload = () => {
			if (changeCount !== PSBackground.changeCount) return;
			if (window.ColorThief) {
				this.extractMenuColorsFromImg(img, bgUrl);
			} else {
				PS.libsLoaded.then(() => {
					if (changeCount !== PSBackground.changeCount) return;
					this.extractMenuColorsFromImg(img, bgUrl);
				});
			}
		};
		img.src = bgUrl;
	}
	extractMenuColorsFromImg(img: HTMLImageElement, bgUrl: string) {
		// in case ColorThief throws from canvas,
		// or localStorage throws
		try {
			const colorThief = new ColorThief();
			const colors = colorThief.getPalette(img, MAINMENU_BUTTONS);

			let menuColors = [];
			if (!colors) {
				menuColors = Array(MAINMENU_BUTTONS).fill('0, 0%');
			} else {
				for (let i = 0; i < MAINMENU_BUTTONS; i++) {
					const color = colors[i];
					const hs = PSBackground.getHueSat(color[0] / 255, color[1] / 255, color[2] / 255);
					menuColors.unshift(hs);
				}
			}
			this.menuColors = menuColors;
			this.update(null);
			PSBackground.save(bgUrl);
		} catch {}
	}
	getHueSat(r: number, g: number, b: number) {
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		if (max === min) {
			return `0,0%`;
		}
		const l = (max + min) / 2;
		const d = max - min;
		const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		let h = 0;
		switch (max) {
		case r: h = (g - b) / d + (g < b ? 6 : 0); break;
		case g: h = (b - r) / d + 2; break;
		case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
		return `${h * 360},${s * 100}%`;
	}
};

/**********************************************************************
 * Core Views
 *********************************************************************/

PSBackground.subscribe(bgUrl => {
	if (!PSBackground.curId) {
		document.body.style.background = '';
		document.body.style.backgroundSize = '';
		const buttonStyleElem = document.getElementById('mainmenubuttoncolors');
		if (buttonStyleElem) buttonStyleElem.textContent = ``;
		return;
	}

	if (bgUrl !== null) {
		let background;
		if (bgUrl.startsWith('#')) {
			background = bgUrl;
		} else if (PSBackground.curId !== 'custom') {
			background = `#546bac url(${bgUrl}) no-repeat left center fixed`;
		} else {
			background = `#546bac url(${bgUrl}) no-repeat center center fixed`;
		}
		document.body.style.background = background;
		document.body.style.backgroundSize = 'cover';
	}

	// main menu button colors
	let cssBuf = ``;
	let n = 0;
	if (PSBackground.menuColors) {
		for (const hs of PSBackground.menuColors) {
			n++;
			cssBuf += `body .button.mainmenu${n} { background: linear-gradient(to bottom,  hsl(${hs},72%),  hsl(${hs},52%)); border-color: hsl(${hs},40%); }\n`;
			cssBuf += `body .button.mainmenu${n}:hover { background: linear-gradient(to bottom,  hsl(${hs},62%),  hsl(${hs},42%)); border-color: hsl(${hs},21%); }\n`;
			cssBuf += `body .button.mainmenu${n}:active { background: linear-gradient(to bottom,  hsl(${hs},42%),  hsl(${hs},58%)); border-color: hsl(${hs},21%); }\n`;
		}
	}
	let buttonStyleElem = document.getElementById('mainmenubuttoncolors');
	if (!buttonStyleElem) {
		if (cssBuf) {
			// Create a <style> element the correct way
			// Direct construction like `new HTMLStyleElement()` throws an error,
			// so we use document.createElement instead
			buttonStyleElem = document.createElement("style");
			buttonStyleElem.id = 'mainmenubuttoncolors';
			buttonStyleElem.textContent = cssBuf;
			document.head.appendChild(buttonStyleElem);
		}
	} else {
		buttonStyleElem.textContent = cssBuf;
	}
});
// '<a href="https://vtas.deviantart.com/art/Pokemon-Horizon-312267168" target="_blank" class="subtle">"Horizon" <small>background by Vivian Zou</small></a>';
// if (attrib) attrib = '<small style="display:block;padding-bottom:4px">' + attrib + '</small>';
