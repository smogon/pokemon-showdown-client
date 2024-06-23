// MiniEdit: ContentEditable-based rich source editor

// True WYSIWYG is really complex, and <textarea> is really limited, but if you
// have a use-case which is approximately "syntax highlighting", you can achieve
// that relatively easily.

// On Google, the most common hack for syntax highlighting is to put an invisible
// <textarea> on top of syntax highlighted text, but this only works if your
// text is monospace and syntax highlighting doesn't change its metrics. This
// approach is more flexible and only requires textContent to be preserved.

// Inspired by https://github.com/SjonHortensius/LRTEditor
// and https://codepen.io/brianmearns/pen/YVjZWw?editors=0010

const MAX_UNDO_HISTORY = 100;
export type MiniEditPlugin = new (editor: MiniEdit) => unknown;
export type MiniEditSelection = {start: number, end: number} | null;
export class MiniEdit {
	static plugins: MiniEditPlugin[] = [];

	element: HTMLElement;

	/**
	 * Takes the plaintext `textContent` of the element, and renders it
	 * in syntax-highlighted form. This must not change the resulting
	 * `textContent`, because the data needs to flow two ways to
	 * correctly respond to all the possible ways users can input text.
	 *
	 * It should, however, add a trailing `\n` if the text doesn't end
	 * with one. This is because HTML ignores trailing newlines, so if
	 * it doesn't already exist and the user types a newline at the end
	 * of the text, it wouldn't appear.
	 */
	// tslint:disable-next-line
	_setContent: (text: string) => void;
	pushHistory?: (text: string, selection: MiniEditSelection) => void;
	onKeyDown = (ev: KeyboardEvent) => {
		if (ev.keyCode === 13) { // enter
			this.replaceSelection('\n');
			ev.preventDefault();
		}
	};

	constructor(el: HTMLElement, options: {setContent: MiniEdit['_setContent'], onKeyDown?: (ev: KeyboardEvent) => void}) {
		this.element = el;

		this._setContent = options.setContent;
		this.onKeyDown = options.onKeyDown || this.onKeyDown;

		this.element.setAttribute('contentEditable', 'true');
		this.element.setAttribute('autoComplete', 'off');
		this.element.setAttribute('spellCheck', 'false');
		this.element.addEventListener('input', () => {
			this.reformat();
		});
		this.element.addEventListener('keydown', this.onKeyDown);

		// tslint:disable-next-line
		for (const Plugin of MiniEdit.plugins) new Plugin(this);
	}

	/** return true from callback for an early return */
	private traverseText(node: Node, callback: (node: Text) => boolean): boolean {
		if (node.nodeType === 3) {
			if (callback(node as Text)) return true;
		} else {
			for (let i = 0, len = node.childNodes.length; i < len; ++i) {
				if (this.traverseText(node.childNodes[i], callback)) return true;
			}
		}
		return false;
	}

	setValue(text: string, selection?: MiniEditSelection): void {
		if (selection === undefined) selection = this.getSelection();
		this._setContent(text);

		this.setSelection(selection);
		this.pushHistory?.(text, selection);
	}
	getValue(): string {
		let text = this.element.textContent || '';
		if (text.endsWith('\n')) return text.slice(0, -1);
		return text;
	}
	reformat(selection?: MiniEditSelection): void {
		this.setValue(this.getValue(), selection);
	}
	replaceSelection(text: string): void {
		const selection = this.getSelection()!;
		const oldContent = this.getValue();
		const newText = oldContent.slice(0, selection.start) + text + oldContent.slice(selection.end);
		this.setValue(newText, {start: selection.start + text.length, end: selection.start + text.length});
	}

	getSelection(): MiniEditSelection {
		const sel = window.getSelection()!;
		let offset = 0;
		let start = null as number | null;
		let end = null as number | null;

		if (sel.rangeCount) {
			const range = sel.getRangeAt(0);
			this.traverseText(this.element, node => {
				if (start === null && node === range.startContainer) {
					start = offset + range.startOffset;
				}

				if (start !== null && node === range.endContainer) {
					end = offset + range.endOffset;
					return true;
				}

				offset += node.length;
				return false;
			});
		}

		return (start === null || end === null) ? null : {start, end};
	}

	setSelection(sel: MiniEditSelection): void {
		if (sel === null) return;

		const range = document.createRange();
		let offset = 0;
		let found = false;
		range.collapse(true);

		if (this.traverseText(this.element, n => {
			const nextOffset = offset + n.length;

			if (!found && sel.start >= offset && sel.start <= nextOffset) {
				range.setStart(n, sel.start - offset);
				found = true;
			}

			if (found && sel.end >= offset && sel.end <= nextOffset) {
				range.setEnd(n, sel.end - offset);
				return true;
			}

			offset = nextOffset;
			return false;
		})) {
			const selection = window.getSelection()!;
			selection.removeAllRanges();
			selection.addRange(range);
		}
	}
	select(): void {
		this.setSelection({start: 0, end: this.getValue().length});
	}
}

export class MiniEditPastePlugin {
	constructor(editor: MiniEdit) {
		editor.element.addEventListener('paste', e => {
			// Manually insert plain-text contents so we keep newlines
			const text = e.clipboardData!.getData('text/plain');
			editor.replaceSelection(text);
			e.preventDefault();
		});
	}
}
MiniEdit.plugins.push(MiniEditPastePlugin);

// We can't use the native undo/redo feature because browsers just get so
// confused by our syntax highlighting, so we have to reimplement it.
// We can intercept ctrl+z and ctrl+y, but we can't intercept the browser's
// UI so things like Edit -> Undo will simply not work. I am sorry to say
// that there is no solution and this is just what webdev is like.
export class MiniEditUndoPlugin {
	editor: MiniEdit;
	undoIndex: number | null = null;
	ignoreInput = false;
	history: {text: string, selection: MiniEditSelection}[] = [];

	constructor(editor: MiniEdit) {
		this.editor = editor;
		this.history.push({text: editor.getValue(), selection: {start: 0, end: 0}});

		this.editor.pushHistory = this.onPushHistory;
		editor.element.addEventListener('keydown', this.onKeyDown);
	}

	onPushHistory = (text: string, selection: MiniEditSelection) => {
		if (this.ignoreInput) {
			// This change was triggered by undo/redo, don't record it
			this.ignoreInput = false;
			return;
		}

		if (this.undoIndex !== null) {
			// chop off everything after the current undo index
			this.history.splice(this.undoIndex + 1);
			this.undoIndex = null;
		}

		this.history.push({text, selection});

		if (this.history.length > MAX_UNDO_HISTORY) this.history.shift();
	};

	onKeyDown = (e: KeyboardEvent) => {
		// ctrl+z or cmd+z
		const undoPressed = (e.ctrlKey && e.keyCode === 90) || (e.metaKey && !e.shiftKey && e.keyCode === 90);
		// ctrl+y or cmd+shift+z
		const redoPressed = (e.ctrlKey && e.keyCode === 89) || (e.metaKey && e.shiftKey && e.keyCode === 90);

		if (undoPressed) {
			this.undoIndex ??= this.history.length - 1;
			this.undoIndex--;

			if (this.undoIndex < 0) { // can't undo further
				this.undoIndex = 0;
				return;
			}
		} else if (redoPressed && this.undoIndex !== null) {
			this.undoIndex++;

			if (this.undoIndex > this.history.length - 1) { // can't redo further
				this.undoIndex = null;
				return;
			}
		} else {
			return;
		}

		const {text, selection} = this.history[this.undoIndex];
		this.ignoreInput = true;
		this.editor.setValue(text, selection);
	};
}
MiniEdit.plugins.push(MiniEditUndoPlugin);
