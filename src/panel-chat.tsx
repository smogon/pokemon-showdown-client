/**
 * Chat panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

class ChatRoom extends PSRoom {
	readonly classType: string = 'chat';
	constructor(options: RoomOptions) {
		super(options);
		if (!this.connected && PS.connected) {
			PS.send(`|/join ${this.id}`);
			this.connected = true;
		}
	}
	receive(line: string) {
		this.update(line);
	}
}

class ChatPanel extends preact.Component<{style: {}, room: PSRoom}> {
	render() {
		return <div class="ps-room ps-room-light scrollabel" id={`room-${this.props.room.id}`} style={this.props.style}>
			<div class="tournament-wrapper hasuserlist"></div>
			<ChatLog class="chat-log hasuserlist" room={this.props.room} />
			<div class="chat-log-add hasuserlist"></div>
			<ul class="userlist"></ul>
		</div>;
	}
}

class ChatLog extends preact.Component<{class: string, room: PSRoom}> {
	atBottom = true;
	innerElem: HTMLDivElement = null!;
	onScroll = (e: UIEvent) => {
		const distanceFromBottom = this.base!.scrollHeight - this.base!.scrollTop - this.base!.clientHeight;
		this.atBottom = (distanceFromBottom < 30);
	};
	componentDidMount() {
		this.innerElem = this.base!.childNodes[0] as HTMLDivElement;
		this.props.room.subscribe(msg => {
			if (!msg) return;
			if (!msg.startsWith('|')) msg = '||' + msg;
			const tokens = PS.lineParse(msg);
			switch (tokens[0]) {
			case 'raw':
			case 'html':
				const el = document.createElement('div');
				el.className = 'notice';
				el.innerHTML = PSHTML(tokens[1]);
				this.appendNode(el);
				break;
			default:
				this.append(<div class="chat">{msg}</div>);
				break;
			}
		});
	}
	appendNode(node: HTMLElement) {
		this.innerElem.appendChild(node);
		if (this.atBottom) {
			this.base!.scrollTop = this.base!.scrollHeight;
		}
	}
	append(nodes: preact.ComponentChild) {
		preact.render(nodes, this.innerElem);
		if (this.atBottom) {
			this.base!.scrollTop = this.base!.scrollHeight;
		}
	}
	shouldComponentUpdate(props: {class: string}) {
		if (props.class !== this.props.class) {
			this.base!.className = props.class;
		}
		return false;
	}
	render() {
		return <div class={this.props.class} onScroll={this.onScroll} role="log">
			<div class="inner"></div>
		</div>;
	}
}

const PSHTML = (function () {
	if (!('html4' in window)) {
		return function () {
			throw new Error('sanitizeHTML requires caja');
		};
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

	let uriRewriter = function (urlData: any) {
		if (urlData.scheme_ === 'geo' || urlData.scheme_ === 'sms' || urlData.scheme_ === 'tel') return null;
		return urlData;
	};
	let tagPolicy = function (tagName: string, attribs: string[]) {
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
		attribs = html.sanitizeAttribs(tagName, attribs, uriRewriter);
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
	let localizeTime = function (full: string, date: string, time: string, timezone?: string) {
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
		return '<time>' + Tools.escapeHTML(formattedTime) + '</time>';
	};
	return function (input: string) {
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
		return html.sanitizeWithPolicy(input, tagPolicy)
			.replace(/<time>\s*([+-]?\d{4,}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?)(Z|[+-]\d{2}:\d{2})?\s*<\/time>/ig, localizeTime) as string;
	};
})();

PS.roomTypes['chat'] = {
	Model: ChatRoom,
	Component: ChatPanel,
};
PS.updateRoomTypes();
