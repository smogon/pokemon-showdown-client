/**
 * Battle log
 * 
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

class BattleLog {
	static escapeFormat(formatid: string): string {
		let atIndex = formatid.indexOf('@@@');
		if (atIndex >= 0) {
			return this.escapeFormat(formatid.slice(0, atIndex)) + '<br />Custom rules: ' + this.escapeHTML(formatid.slice(atIndex + 3));
		}
		if (window.BattleFormats && BattleFormats[formatid]) {
			return this.escapeHTML(BattleFormats[formatid].name);
		}
		return this.escapeHTML(formatid);
	}

	static escapeHTML(str: string, jsEscapeToo?: boolean) {
		str = getString(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		if (jsEscapeToo) str = str.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
		return str;
	}

	static unescapeHTML(str: string) {
		str = (str ? '' + str : '');
		return str.replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
	}

	static colorCache = {} as {[userid: string]: string};

	static hashColor(name: string) {
		if (this.colorCache[name]) return this.colorCache[name];
		let hash;
		if (window.Config && Config.customcolors && Config.customcolors[name]) {
			if (Config.customcolors[name].color) {
				return (this.colorCache[name] = 'color:' + Config.customcolors[name].color + ';');
			}
			hash = MD5(Config.customcolors[name]);
		} else {
			hash = MD5(name);
		}
		let H = parseInt(hash.substr(4, 4), 16) % 360; // 0 to 360
		let S = parseInt(hash.substr(0, 4), 16) % 50 + 40; // 40 to 89
		let L = Math.floor(parseInt(hash.substr(8, 4), 16) % 20 + 30); // 30 to 49

		let C = (100 - Math.abs(2 * L - 100)) * S / 100 / 100;
		let X = C * (1 - Math.abs((H / 60) % 2 - 1));
		let m = L / 100 - C / 2;

		let R1, G1, B1;
		switch (Math.floor(H / 60)) {
		case 1: R1 = X; G1 = C; B1 = 0; break;
		case 2: R1 = 0; G1 = C; B1 = X; break;
		case 3: R1 = 0; G1 = X; B1 = C; break;
		case 4: R1 = X; G1 = 0; B1 = C; break;
		case 5: R1 = C; G1 = 0; B1 = X; break;
		case 0: default: R1 = C; G1 = X; B1 = 0; break;
		}
		let R = R1 + m, G = G1 + m, B = B1 + m;
		let lum = R * R * R * 0.2126 + G * G * G * 0.7152 + B * B * B * 0.0722; // 0.013 (dark blue) to 0.737 (yellow)

		let HLmod = (lum - 0.2) * -150; // -80 (yellow) to 28 (dark blue)
		if (HLmod > 18) HLmod = (HLmod - 18) * 2.5;
		else if (HLmod < 0) HLmod = (HLmod - 0) / 3;
		else HLmod = 0;
		// let mod = ';border-right: ' + Math.abs(HLmod) + 'px solid ' + (HLmod > 0 ? 'red' : '#0088FF');
		let Hdist = Math.min(Math.abs(180 - H), Math.abs(240 - H));
		if (Hdist < 15) {
			HLmod += (15 - Hdist) / 3;
		}

		L += HLmod;

		this.colorCache[name] = "color:hsl(" + H + "," + S + "%," + L + "%);";
		return this.colorCache[name];
	}

	static parseChatMessage(message: string, name: string, timestamp: string, isHighlighted?: boolean, $chatElem?: any) {
		let showMe = !((Tools.prefs('chatformatting') || {}).hideme);
		let group = ' ';
		if (!/[A-Za-z0-9]/.test(name.charAt(0))) {
			// Backwards compatibility
			group = name.charAt(0);
			name = name.substr(1);
		}
		let color = this.hashColor(toId(name));
		let clickableName = '<small>' + this.escapeHTML(group) + '</small><span class="username" data-name="' + this.escapeHTML(name) + '">' + this.escapeHTML(name) + '</span>';
		let hlClass = isHighlighted ? ' highlighted' : '';
		let mineClass = (window.app && app.user && app.user.get('name') === name ? ' mine' : '');

		let cmd = '';
		let target = '';
		if (message.charAt(0) === '/') {
			if (message.charAt(1) === '/') {
				message = message.slice(1);
			} else {
				let spaceIndex = message.indexOf(' ');
				cmd = (spaceIndex >= 0 ? message.slice(1, spaceIndex) : message.slice(1));
				if (spaceIndex >= 0) target = message.slice(spaceIndex + 1);
			}
		}

		switch (cmd) {
		case 'me':
			if (!showMe) return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em>/me' + this.parseMessage(' ' + target) + '</em></div>';
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">&bull;</strong> <em>' + clickableName + '<i>' + this.parseMessage(' ' + target) + '</i></em></div>';
		case 'mee':
			if (!showMe) return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em>/me' + this.parseMessage(' ' + target).slice(1) + '</em></div>';
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">&bull;</strong> <em>' + clickableName + '<i>' + this.parseMessage(' ' + target).slice(1) + '</i></em></div>';
		case 'invite':
			let roomid = toRoomid(target);
			return [
				'<div class="chat">' + timestamp + '<em>' + clickableName + ' invited you to join the room "' + roomid + '"</em></div>',
				'<div class="notice"><button name="joinRoom" value="' + roomid + '">Join ' + roomid + '</button></div>'
			];
		case 'announce':
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <span class="message-announce">' + this.parseMessage(target) + '</span></div>';
		case 'log':
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<span class="message-log">' + this.parseMessage(target) + '</span></div>';
		case 'data-pokemon':
			let buf = '<li class="result">';
			let template = Tools.getTemplate(target);
			if (!template.abilities || !template.baseStats) return '[not supported in replays]';
			buf += '<span class="col numcol">' + (template.tier || Tools.getTemplate(template.baseSpecies).tier) + '</span> ';
			buf += '<span class="col iconcol"><span style="' + Tools.getPokemonIcon(template) + '"></span></span> ';
			buf += '<span class="col pokemonnamecol" style="white-space:nowrap"><a href="https://pokemonshowdown.com/dex/pokemon/' + template.id + '" target="_blank">' + template.species + '</a></span> ';
			buf += '<span class="col typecol">';
			if (template.types) for (let i = 0; i < template.types.length; i++) {
				buf += Tools.getTypeIcon(template.types[i]);
			}
			buf += '</span> ';
			buf += '<span style="float:left;min-height:26px">';
			if (template.abilities['1']) {
				buf += '<span class="col twoabilitycol">' + template.abilities['0'] + '<br />' + template.abilities['1'] + '</span>';
			} else {
				buf += '<span class="col abilitycol">' + template.abilities['0'] + '</span>';
			}
			if (template.abilities['S']) {
				buf += '<span class="col twoabilitycol' + (template.unreleasedHidden ? ' unreleasedhacol' : '') + '"><em>' + template.abilities['H'] + '<br />' + template.abilities['S'] + '</em></span>';
			} else if (template.abilities['H']) {
				buf += '<span class="col abilitycol' + (template.unreleasedHidden ? ' unreleasedhacol' : '') + '"><em>' + template.abilities['H'] + '</em></span>';
			} else {
				buf += '<span class="col abilitycol"></span>';
			}
			buf += '</span>';
			buf += '<span style="float:left;min-height:26px">';
			buf += '<span class="col statcol"><em>HP</em><br />' + template.baseStats.hp + '</span> ';
			buf += '<span class="col statcol"><em>Atk</em><br />' + template.baseStats.atk + '</span> ';
			buf += '<span class="col statcol"><em>Def</em><br />' + template.baseStats.def + '</span> ';
			buf += '<span class="col statcol"><em>SpA</em><br />' + template.baseStats.spa + '</span> ';
			buf += '<span class="col statcol"><em>SpD</em><br />' + template.baseStats.spd + '</span> ';
			buf += '<span class="col statcol"><em>Spe</em><br />' + template.baseStats.spe + '</span> ';
			let bst = 0;
			for (const i in template.baseStats) bst += template.baseStats[i as StatName];
			buf += '<span class="col bstcol"><em>BST<br />' + bst + '</em></span> ';
			buf += '</span>';
			buf += '</li>';
			return '<div class="message"><ul class="utilichart">' + buf + '<li style=\"clear:both\"></li></ul></div>';
		case 'data-item':
			if (!window.BattleSearch) return '[not supported in replays]';
			return '<div class="message"><ul class="utilichart">' + BattleSearch.renderItemRow(Tools.getItem(target), 0, 0) + '<li style=\"clear:both\"></li></ul></div>';
		case 'data-ability':
			if (!window.BattleSearch) return '[not supported in replays]';
			return '<div class="message"><ul class="utilichart">' + BattleSearch.renderAbilityRow(Tools.getAbility(target), 0, 0) + '<li style=\"clear:both\"></li></ul></div>';
		case 'data-move':
			if (!window.BattleSearch) return '[not supported in replays]';
			return '<div class="message"><ul class="utilichart">' + BattleSearch.renderMoveRow(Tools.getMove(target), 0, 0) + '<li style=\"clear:both\"></li></ul></div>';
		case 'text':
			return '<div class="chat">' + this.parseMessage(target) + '</div>';
		case 'error':
			return '<div class="chat message-error">' + this.escapeHTML(target) + '</div>';
		case 'html':
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em>' + BattleLog.sanitizeHTML(target) + '</em></div>';
		case 'uhtml':
		case 'uhtmlchange':
			let parts = target.split(',');
			let $elements = $chatElem.find('div.uhtml-' + toId(parts[0]));
			let html = parts.slice(1).join(',');
			if (!html) {
				$elements.remove();
			} else if (!$elements.length) {
				$chatElem.append('<div class="chat uhtml-' + toId(parts[0]) + '">' + BattleLog.sanitizeHTML(html) + '</div>');
			} else if (cmd === 'uhtmlchange') {
				$elements.html(BattleLog.sanitizeHTML(html));
			} else {
				$elements.remove();
				$chatElem.append('<div class="chat uhtml-' + toId(parts[0]) + '">' + BattleLog.sanitizeHTML(html) + '</div>');
			}
			return '';
		case 'raw':
			return '<div class="chat">' + BattleLog.sanitizeHTML(target) + '</div>';
		default:
			// Not a command or unsupported. Parsed as a normal chat message.
			if (!name) {
				return '<div class="chat' + hlClass + '">' + timestamp + '<em>' + this.parseMessage(message) + '</em></div>';
			}
			return '<div class="chat chatmessage-' + toId(name) + hlClass + mineClass + '">' + timestamp + '<strong style="' + color + '">' + clickableName + ':</strong> <em>' + this.parseMessage(message) + '</em></div>';
		}
	}

	static parseMessage(str: string) {
		// Don't format console commands (>>).
		if (str.substr(0, 3) === '>> ' || str.substr(0, 4) === '>>> ') return this.escapeHTML(str);
		// Don't format console results (<<).
		if (str.substr(0, 3) === '<< ') return this.escapeHTML(str);
		str = formatText(str);

		let options = Tools.prefs('chatformatting') || {};

		if (options.hidelinks) {
			str = str.replace(/<a[^>]*>/g, '<u>').replace(/<\/a>/g, '</u>');
		}
		if (options.hidespoiler) {
			str = str.replace(/<span class="spoiler">/g, '<span class="spoiler spoiler-shown">');
		}
		if (options.hidegreentext) {
			str = str.replace(/<span class="greentext">/g, '<span>');
		}

		return str;
	}

	static interstice = (() => {
		const whitelist: string[] = (window.Config && Config.whitelist) ? Config.whitelist : [];
		const patterns = whitelist.map(entry => new RegExp(
			`^(https?:)?//([A-Za-z0-9-]*\\.)?${entry}(/.*)?`,
		'i'));
		return {
			isWhitelisted(uri: string) {
				if (uri[0] === '/' && uri[1] !== '/') {
					// domain-relative URIs are safe
					return true;
				}
				for (const pattern of patterns) {
					if (pattern.test(uri)) return true;
				}
				return false;
			},
			getURI(uri: string) {
				return 'http://pokemonshowdown.com/interstice?uri=' + encodeURIComponent(uri);
			},
		};
	})();

	static tagPolicy: (tagName: string, attribs: string[]) => any = null!;
	static initSanitizeHTML() {
		if (this.tagPolicy) return;
		if (!('html4' in window)) {
			throw new Error('sanitizeHTML requires caja');
		}
		// Add <marquee> <blink> <psicon> to the whitelist.
		Object.assign(html4.ELEMENTS, {
			'marquee': 0,
			'blink': 0,
			'psicon': html4.eflags['OPTIONAL_ENDTAG'] | html4.eflags['EMPTY']
		});
		Object.assign(html4.ATTRIBS, {
			// See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/marquee
			'marquee::behavior': 0,
			'marquee::bgcolor': 0,
			'marquee::direction': 0,
			'marquee::height': 0,
			'marquee::hspace': 0,
			'marquee::loop': 0,
			'marquee::scrollamount': 0,
			'marquee::scrolldelay': 0,
			'marquee::truespeed': 0,
			'marquee::vspace': 0,
			'marquee::width': 0,
			'psicon::pokemon': 0,
			'psicon::item': 0
		});

		this.tagPolicy = (tagName: string, attribs: string[]) => {
			if (html4.ELEMENTS[tagName] & html4.eflags['UNSAFE']) {
				return;
			}
			let targetIdx = 0, srcIdx = 0;
			if (tagName === 'a') {
				// Special handling of <a> tags.

				for (let i = 0; i < attribs.length - 1; i += 2) {
					switch (attribs[i]) {
					case 'target':
						targetIdx = i + 1;
						break;
					}
				}
			}
			let dataUri = '';
			if (tagName === 'img') {
				for (let i = 0; i < attribs.length - 1; i += 2) {
					if (attribs[i] === 'src' && attribs[i + 1].substr(0, 11) === 'data:image/') {
						srcIdx = i;
						dataUri = attribs[i + 1];
					}
					if (attribs[i] === 'src' && attribs[i + 1].substr(0, 2) === '//') {
						if (location.protocol !== 'http:' && location.protocol !== 'https:') {
							attribs[i + 1] = 'http:' + attribs[i + 1];
						}
					}
				}
			} else if (tagName === 'psicon') {
				// <psicon> is a custom element which supports a set of mutually incompatible attributes:
				// <psicon pokemon> and <psicon item>
				let classValueIndex = -1;
				let styleValueIndex = -1;
				let iconAttrib = null;
				for (let i = 0; i < attribs.length - 1; i += 2) {
					if (attribs[i] === 'pokemon' || attribs[i] === 'item') {
						// If declared more than once, use the later.
						iconAttrib = attribs.slice(i, i + 2);
					} else if (attribs[i] === 'class') {
						classValueIndex = i + 1;
					} else if (attribs[i] === 'style') {
						styleValueIndex = i + 1;
					}
				}
				tagName = 'span';

				if (iconAttrib) {
					if (classValueIndex < 0) {
						attribs.push('class', '');
						classValueIndex = attribs.length - 1;
					}
					if (styleValueIndex < 0) {
						attribs.push('style', '');
						styleValueIndex = attribs.length - 1;
					}

					// Prepend all the classes and styles associated to the custom element.
					if (iconAttrib[0] === 'pokemon') {
						attribs[classValueIndex] = attribs[classValueIndex] ? 'picon ' + attribs[classValueIndex] : 'picon';
						attribs[styleValueIndex] = attribs[styleValueIndex] ? Tools.getPokemonIcon(iconAttrib[1]) + '; ' + attribs[styleValueIndex] : Tools.getPokemonIcon(iconAttrib[1]);
					} else if (iconAttrib[0] === 'item') {
						attribs[classValueIndex] = attribs[classValueIndex] ? 'itemicon ' + attribs[classValueIndex] : 'itemicon';
						attribs[styleValueIndex] = attribs[styleValueIndex] ? Tools.getItemIcon(iconAttrib[1]) + '; ' + attribs[styleValueIndex] : Tools.getItemIcon(iconAttrib[1]);
					}
				}
			}

			if (attribs[targetIdx] === 'replace') {
				targetIdx = -targetIdx;
			}
			attribs = html.sanitizeAttribs(tagName, attribs, (urlData: any) => {
				if (urlData.scheme_ === 'geo' || urlData.scheme_ === 'sms' || urlData.scheme_ === 'tel') return null;
				return urlData;
			});
			if (targetIdx < 0) {
				targetIdx = -targetIdx;
				attribs[targetIdx - 1] = 'data-target';
				attribs[targetIdx] = 'replace';
				targetIdx = 0;
			}

			if (dataUri && tagName === 'img') {
				attribs[srcIdx + 1] = dataUri;
			}
			if (tagName === 'a' || tagName === 'form') {
				if (targetIdx) {
					attribs[targetIdx] = '_blank';
				} else {
					attribs.push('target');
					attribs.push('_blank');
				}
				if (tagName === 'a') {
					attribs.push('rel');
					attribs.push('noopener');
				}
			}
			return {tagName: tagName, attribs: attribs};
		};
	}
	static localizeTime(full: string, date: string, time: string, timezone?: string) {
		let parsedTime = new Date(date + 'T' + time + (timezone || 'Z').toUpperCase());
		// Very old (pre-ES5) web browsers may be incapable of parsing ISO 8601
		// dates. In such a case, gracefully continue without replacing the date
		// format.
		if (!parsedTime.getTime()) return full;

		let formattedTime;
		// Try using Intl API if it exists
		if (window.Intl && Intl.DateTimeFormat) {
			formattedTime = new Intl.DateTimeFormat(undefined, {month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'}).format(parsedTime);
		} else {
			// toLocaleString even exists in ECMAScript 1, so no need to check
			// if it exists.
			formattedTime = parsedTime.toLocaleString();
		}
		return '<time>' + this.escapeHTML(formattedTime) + '</time>';
	}
	static sanitizeHTML(input: string) {
		this.initSanitizeHTML();
		const sanitized = html.sanitizeWithPolicy(getString(input), this.tagPolicy) as string;
		// <time> parsing requires ISO 8601 time. While more time formats are
		// supported by most JavaScript implementations, it isn't required, and
		// how to exactly enforce ignoring user agent timezone setting is not obvious.
		// As dates come from the server which isn't aware of client timezone, a
		// particular timezone is required.
		//
		// This regular expression is split into three groups.
		//
		// Group 1 - date
		// Group 2 - time (seconds and milliseconds are optional)
		// Group 3 - optional timezone
		//
		// Group 1 and group 2 are split to allow using space as a separator
		// instead of T. Stricly speaking ECMAScript 5 specification only
		// allows T, however it's more practical to also allow spaces.
		return sanitized.replace(
			/<time>\s*([+-]?\d{4,}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?)(Z|[+-]\d{2}:\d{2})?\s*<\/time>/ig,
		this.localizeTime);
	}

	/*********************************************************
	 * Replay files
	 *********************************************************/

	// Replay files are .html files that display a replay for a battle.

	// The .html files mainly contain replay log data; the actual replay
	// player is downloaded online. Also included is a textual log and
	// some minimal CSS to make it look pretty, for offline viewing.

	// This strategy helps keep the replay file reasonably small; of
	// the 30 KB or so for a 50-turn battle, around 10 KB is the log
	// data, and around 20 KB is the textual log.

	// The actual replay player is downloaded from replay-embed.js,
	// which handles loading all the necessary resources for turning the log
	// data into a playable replay.

	// Battle log data is stored in and loaded from a
	// <script type="text/plain" class="battle-log-data"> tag.

	// replay-embed.js is loaded through a cache-buster that rotates daily.
	// This allows pretty much anything about the replay viewer to be
	// updated as desired.

	static createReplayFile(room: any) {
		let battle = room.battle;
		let replayid = room.id;
		if (replayid) {
			// battle room
			replayid = replayid.slice(7);
			if (Config.server.id !== 'showdown') {
				if (!Config.server.registered) {
					replayid = 'unregisteredserver-' + replayid;
				} else {
					replayid = Config.server.id + '-' + replayid;
				}
			}
		} else {
			// replay panel
			replayid = room.fragment;
		}
		battle.fastForwardTo(-1);
		let buf = '<!DOCTYPE html>\n';
		buf += '<meta charset="utf-8" />\n';
		buf += '<!-- version 1 -->\n';
		buf += '<title>' + this.escapeHTML(battle.tier) + ' replay: ' + this.escapeHTML(battle.p1.name) + ' vs. ' + this.escapeHTML(battle.p2.name) + '</title>\n';
		buf += '<style>\n';
		buf += 'html,body {font-family:Verdana, sans-serif;font-size:10pt;margin:0;padding:0;}body{padding:12px 0;} .battle-log {font-family:Verdana, sans-serif;font-size:10pt;} .battle-log-inline {border:1px solid #AAAAAA;background:#EEF2F5;color:black;max-width:640px;margin:0 auto 80px;padding-bottom:5px;} .battle-log .inner {padding:4px 8px 0px 8px;} .battle-log .inner-preempt {padding:0 8px 4px 8px;} .battle-log .inner-after {margin-top:0.5em;} .battle-log h2 {margin:0.5em -8px;padding:4px 8px;border:1px solid #AAAAAA;background:#E0E7EA;border-left:0;border-right:0;font-family:Verdana, sans-serif;font-size:13pt;} .battle-log .chat {vertical-align:middle;padding:3px 0 3px 0;font-size:8pt;} .battle-log .chat strong {color:#40576A;} .battle-log .chat em {padding:1px 4px 1px 3px;color:#000000;font-style:normal;} .chat.mine {background:rgba(0,0,0,0.05);margin-left:-8px;margin-right:-8px;padding-left:8px;padding-right:8px;} .spoiler {color:#BBBBBB;background:#BBBBBB;padding:0px 3px;} .spoiler:hover, .spoiler:active, .spoiler-shown {color:#000000;background:#E2E2E2;padding:0px 3px;} .spoiler a {color:#BBBBBB;} .spoiler:hover a, .spoiler:active a, .spoiler-shown a {color:#2288CC;} .chat code, .chat .spoiler:hover code, .chat .spoiler:active code, .chat .spoiler-shown code {border:1px solid #C0C0C0;background:#EEEEEE;color:black;padding:0 2px;} .chat .spoiler code {border:1px solid #CCCCCC;background:#CCCCCC;color:#CCCCCC;} .battle-log .rated {padding:3px 4px;} .battle-log .rated strong {color:white;background:#89A;padding:1px 4px;border-radius:4px;} .spacer {margin-top:0.5em;} .message-announce {background:#6688AA;color:white;padding:1px 4px 2px;} .message-announce a, .broadcast-green a, .broadcast-blue a, .broadcast-red a {color:#DDEEFF;} .broadcast-green {background-color:#559955;color:white;padding:2px 4px;} .broadcast-blue {background-color:#6688AA;color:white;padding:2px 4px;} .infobox {border:1px solid #6688AA;padding:2px 4px;} .infobox-limited {max-height:200px;overflow:auto;overflow-x:hidden;} .broadcast-red {background-color:#AA5544;color:white;padding:2px 4px;} .message-learn-canlearn {font-weight:bold;color:#228822;text-decoration:underline;} .message-learn-cannotlearn {font-weight:bold;color:#CC2222;text-decoration:underline;} .message-effect-weak {font-weight:bold;color:#CC2222;} .message-effect-resist {font-weight:bold;color:#6688AA;} .message-effect-immune {font-weight:bold;color:#666666;} .message-learn-list {margin-top:0;margin-bottom:0;} .message-throttle-notice, .message-error {color:#992222;} .message-overflow, .chat small.message-overflow {font-size:0pt;} .message-overflow::before {font-size:9pt;content:\'...\';} .subtle {color:#3A4A66;}\n';
		buf += '</style>\n';
		buf += '<div class="wrapper replay-wrapper" style="max-width:1180px;margin:0 auto">\n';
		buf += '<input type="hidden" name="replayid" value="' + replayid + '" />\n';
		buf += '<div class="battle"></div><div class="battle-log"></div><div class="replay-controls"></div><div class="replay-controls-2"></div>\n';
		buf += '<h1 style="font-weight:normal;text-align:center"><strong>' + this.escapeHTML(battle.tier) + '</strong><br /><a href="http://pokemonshowdown.com/users/' + toId(battle.p1.name) + '" class="subtle" target="_blank">' + this.escapeHTML(battle.p1.name) + '</a> vs. <a href="http://pokemonshowdown.com/users/' + toId(battle.p2.name) + '" class="subtle" target="_blank">' + this.escapeHTML(battle.p2.name) + '</a></h1>\n';
		buf += '<script type="text/plain" class="battle-log-data">' + battle.activityQueue.join('\n').replace(/\//g, '\\/') + '</script>\n'; // lgtm [js/incomplete-sanitization]
		buf += '</div>\n';
		buf += '<div class="battle-log battle-log-inline"><div class="inner">' + battle.scene.$log.html() + '</div></div>\n';
		buf += '</div>\n';
		buf += '<script>\n';
		buf += 'let daily = Math.floor(Date.now()/1000/60/60/24);document.write(\'<script src="https://play.pokemonshowdown.com/js/replay-embed.js?version\'+daily+\'"></\'+\'script>\');\n';
		buf += '</script>\n';
		return buf;
	}

	static createReplayFileHref(room: any) {
		// unescape(encodeURIComponent()) is necessary because btoa doesn't support Unicode
		// @ts-ignore
		return 'data:text/plain;base64,' + encodeURIComponent(btoa(unescape(encodeURIComponent(this.createReplayFile(room)))));
	}
}
