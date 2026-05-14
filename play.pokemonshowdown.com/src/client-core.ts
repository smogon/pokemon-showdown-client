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
export const DEFAULT_SOLID_BG = '#344b6c';
export const SOLID_BG_ID = 'solidcolor';
const BUTTON_COLOR_MODE_PREFIX = 'buttonmode:';
const SOLID_COLOR_REGEX = /^#[0-9A-F]{6}$/i;
type ButtonColorMode = 1 | 3 | 8 | 'rainbow';

function parseButtonColorMode(buttonColorMode: string | number | undefined): ButtonColorMode {
	switch (String(buttonColorMode)) {
	case '1':
		return 1;
	case '3':
		return 3;
	case 'rainbow':
		return 'rainbow';
	default:
		return MAINMENU_BUTTONS;
	}
}

function normalizeMenuColors(menuColors: string[] | null) {
	if (!menuColors?.length) return menuColors;
	const lastColor = menuColors[menuColors.length - 1];
	return Array.from({ length: MAINMENU_BUTTONS }, (_, i) => menuColors[i] || lastColor);
}

function getMenuColorForButton(menuColors: string[], buttonColorMode: ButtonColorMode, i: number) {
	switch (buttonColorMode) {
	case 1:
		return menuColors[0];
	case 3:
		if (i === 0) return menuColors[0];
		if (i < 4) return menuColors[1] || menuColors[0];
		return menuColors[2] || menuColors[1] || menuColors[0];
	default:
		return menuColors[i];
	}
}

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
	bgUrl = '';
	buttonColorMode: ButtonColorMode = MAINMENU_BUTTONS;
	attrib: { url: string, title: string, artist: string } | null = null;
	changeCount = 0;
	menuColors: string[] | null = null;

	constructor() {
		super();
		try {
			let storedBg = localStorage.getItem('showdown_bg')?.split('\n') || [''];
			let buttonColorMode: ButtonColorMode = MAINMENU_BUTTONS;
			if (storedBg[storedBg.length - 1]?.startsWith(BUTTON_COLOR_MODE_PREFIX)) {
				const storedMode = storedBg.pop()!.slice(BUTTON_COLOR_MODE_PREFIX.length);
				buttonColorMode = parseButtonColorMode(storedMode);
			}
			if (storedBg.length === 1) {
				// id
				this.load('', storedBg[0], null, buttonColorMode);
			} else if (storedBg.length === 2) {
				// url, id
				this.load(storedBg[0], storedBg[1], null, buttonColorMode);
			} else if (storedBg.length >= 10) {
				// url, id, menuColors
				this.load(storedBg[0], storedBg[1], storedBg.slice(2), buttonColorMode);
			}
		} catch {}
	}
	save(bgUrl: string = this.bgUrl) {
		let storedBg = ``;
		if (this.id !== 'custom' && this.id !== SOLID_BG_ID) {
			storedBg = this.id;
		} else if (this.id === 'custom' && this.menuColors) {
			storedBg = bgUrl + '\n' + this.id + '\n' + this.menuColors.join('\n');
		} else {
			storedBg = bgUrl + '\n' + this.id;
		}
		if (this.buttonColorMode !== MAINMENU_BUTTONS) {
			storedBg += '\n' + BUTTON_COLOR_MODE_PREFIX + String(this.buttonColorMode);
		}
		localStorage.setItem('showdown_bg', storedBg);
	}
	set(bgUrl: string, bgid: string) {
		this.load(bgUrl, bgid, null, this.buttonColorMode);
		this.save(this.bgUrl);
	}
	setButtonColorMode(buttonColorMode: string) {
		this.buttonColorMode = parseButtonColorMode(buttonColorMode);
		this.update(null);
		this.save(this.bgUrl);
	}

	load(
		bgUrl: string, bgid: string, menuColors: string[] | null = null,
		buttonColorMode: ButtonColorMode = MAINMENU_BUTTONS
	) {
		if (bgid === 'solidblue') {
			bgid = SOLID_BG_ID;
		}

		// id
		this.id = bgid;

		// curid
		if (!bgid || bgid === 'waterfall') {
			if (location.host === 'smogtours.psim.us') {
				bgid = 'shaymin';
			} else {
				const bgs = ['charizards', 'horizon', 'ocean', 'shaymin', 'psday'];
				bgid = bgs[Math.floor(Math.random() * bgs.length)];
				// if someone clicked the random button, try to roll a different bg than before
				if (bgid === this.curId) bgid = bgs[Math.floor(Math.random() * bgs.length)];
			}
		}
		this.curId = bgid;

		if (bgid === SOLID_BG_ID) {
			bgUrl = SOLID_COLOR_REGEX.test(bgUrl) ? bgUrl : DEFAULT_SOLID_BG;
		} else if (!bgUrl) {
			bgUrl = PSURL + 'fx/client-bg-' + bgid + '.jpg';
		}
		this.bgUrl = bgUrl;
		this.buttonColorMode = buttonColorMode;

		// April Fool's 2016 - Digimon theme
		// bgid = 'digimon';
		// bgUrl = PSURL + 'sprites/afd/digimonbg.jpg';

		this.changeCount++;

		// menuColors, attrib
		let attrib = null;
		switch (bgid) {
		case 'charizards':
			menuColors = [
				"211.03448275862067,28.155339805825246%",
				"36.84782608695652,75.40983606557377%",
				"22.191780821917806,37.43589743589743%",
				"178.56,52.30125523012552%",
				"11.180124223602485,71.55555555555554%",
				"191.84713375796179,81.34715025906736%",
				"73.58490566037737,58.241758241758255%",
				"186.42857142857144,50.000000000000014%",
			];
			attrib = {
				url: 'https://lit.link/en/seiryuuden',
				title: 'Charizards',
				artist: 'Jessica Valencia',
			};
			break;
		case 'horizon':
			menuColors = [
				"228,65.65656565656568%",
				"232.00000000000003,19.480519480519483%",
				"197.6842105263158,54.913294797687875%",
				"222.65060240963857,33.60323886639676%",
				"217.05882352941174,47.22222222222222%",
				"266.8085106382979,22.48803827751196%",
				"319.09090909090907,34.920634920634924%",
				"353.33333333333337,32.43243243243244%",
			];
			attrib = {
				url: 'https://vtas.deviantart.com/art/Pokemon-Horizon-312267168',
				title: 'Horizon',
				artist: 'Vivian Zou',
			};
			break;
		case 'ocean':
			menuColors = [
				"199.2857142857143,48.275862068965495%",
				"213.38709677419357,57.4074074074074%",
				"208.141592920354,56.218905472636806%",
				"207.95454545454544,66.66666666666664%",
				"228.81355932203388,35.757575757575744%",
				"84.32432432432434,36.27450980392157%",
				"216.9230769230769,40.94488188976379%",
				"198.3206106870229,52.610441767068274%",
			];
			attrib = {
				url: 'https://quanyails.deviantart.com/art/Sunrise-Ocean-402667154',
				title: 'Sunrise Ocean',
				artist: 'Quanyails',
			};
			break;
		case 'shaymin':
			menuColors = [
				"44.210526315789515,19.999999999999993%",
				"175.00000000000003,13.043478260869565%",
				"170.00000000000003,12.5%",
				"154.2857142857143,2.766798418972328%",
				"157.77777777777777,12.79620853080568%",
				"33.06122448979592,26.77595628415302%",
				"340.42105263157896,41.85022026431718%",
				"15.000000000000016,5.660377358490567%",
			];
			attrib = {
				url: 'http://cargocollective.com/bluep',
				title: 'Shaymin',
				artist: 'Daniel Kong',
			};
			break;
		case 'psday':
			menuColors = [
				"24.705882352941195,41.46341463414633%",
				"254.02597402597405,48.42767295597485%",
				"165.9574468085106,46.07843137254901%",
				"20,20.547945205479454%",
				"260.6106870229008,60.368663594470064%",
				"300,18.875502008032132%",
				"206.66666666666666,26.359832635983267%",
				"344.1891891891892,61.15702479338842%",
			];
			attrib = {
				url: '',
				title: 'Pok&eacute;mon Showdown Day background',
				artist: 'LifeisDANK',
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
		this.menuColors = normalizeMenuColors(menuColors);
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
				const extractedColors = colors.length ? colors : [[0, 0, 0]];
				for (let i = 0; i < MAINMENU_BUTTONS; i++) {
					const color = extractedColors[Math.min(i, extractedColors.length - 1)];
					const hs = PSBackground.getHueSat(color[0] / 255, color[1] / 255, color[2] / 255);
					menuColors.push(hs);
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
		bgUrl = bgUrl || PSBackground.bgUrl;
		let background;
		if (PSBackground.curId === SOLID_BG_ID) {
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
	if (PSBackground.menuColors && PSBackground.buttonColorMode !== 'rainbow') {
		for (let i = 0; i < PSBackground.menuColors.length; i++) {
			const hs = getMenuColorForButton(PSBackground.menuColors, PSBackground.buttonColorMode, i);
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
