/** @jsx preact.h */
import preact from '../../play.pokemonshowdown.com/js/lib/preact';
import type { EditableNewsPost } from '../../lib/news';
import { Net } from './net';

interface NewsEditorProps {
	url: string;
	isPostPage: boolean;
	username?: string;
	post?: EditableNewsPost;
}

interface NewsEditorState {
	post?: EditableNewsPost;
	editing: boolean;
	showDetails: boolean;
	saving: boolean;
	status: string;
}

class NewsEditor extends preact.Component<NewsEditorProps, NewsEditorState> {
	override state = {
		post: this.props.post,
		editing: !!this.props.post,
		showDetails: !!this.props.post?.details,
		saving: false,
		status: '',
	};

	override componentDidMount() {
		if (this.state.editing) this.base!.querySelector('input')!.focus();
	}

	override componentDidUpdate(previousProps: NewsEditorProps, previousState: NewsEditorState) {
		if (this.state.editing !== previousState.editing) {
			this.base!.querySelector<HTMLElement>(this.state.editing ? 'input' : 'button')!.focus();
		}
	}

	save = (event: Event) => {
		event.preventDefault();
		if (this.state.saving) return;
		const jsonBody = Net.formData(event.currentTarget as HTMLFormElement);
		this.setState({ saving: true, status: 'Saving…' });
		Net(this.props.url).get({ method: this.state.post ? 'PUT' : 'POST', jsonBody }).then(text => {
			const post: EditableNewsPost = JSON.parse(text);
			if (!this.state.post) {
				location.assign('/news/');
				return;
			}
			if (this.props.isPostPage) {
				document.title = post.title + ' - Pokémon Showdown!';
			}
			this.setState({ post, editing: false, saving: false, status: '' });
		}).catch(error => {
			const status = (
				!error.statusCode ? 'Could not reach the server. Your draft is still here.' :
				error.statusCode === 403 ? 'Permission denied. Check that you are signed in.' :
				error.statusCode === 404 ? 'This post no longer exists.' :
				error.statusCode === 409 ? 'Another edit is being saved. Please try again.' :
				'Could not save the post. Your draft is still here.'
			);
			this.setState({ saving: false, status });
		});
	};

	override render() {
		const { post, editing, showDetails, saving, status } = this.state;
		if (!editing && !post) {
			return <p class="pagelink">
				<button type="button" class="button" onClick={() => this.setState({ editing: true })}>+<br />New news post</button>
			</p>;
		}
		const { isPostPage } = this.props;
		const byline = <p>—<strong>{post?.author ?? this.props.username}</strong> {}
			{post && <small class="date">on <time dateTime={new Date(post.date * 1000).toISOString()}>{post.readableDate}</time></small>} {}
			{post && !editing && !isPostPage && <small><a href={`/news/${post.id}`}>{post.details ? 'Read more' : 'Permalink'}</a></small>}
		</p>;
		if (!editing && post) {
			return <div>
				<button type="button" class="button" style={{ float: 'right' }}
					onClick={() => this.setState({ editing: true, showDetails: !!post.details })}>Edit</button>
				<h1>{post.title}</h1>
				<div dangerouslySetInnerHTML={{ __html: (post.summaryHTML || '') + (isPostPage ? post.detailsHTML || '' : '') }} />
				{byline}
			</div>;
		}
		return <form class={post ? undefined : 'section'} onSubmit={this.save}>
			<h1><label class="label">Title:<br />
				<input name="title" class="textbox" size={60} required readOnly={saving} defaultValue={post?.title} />
			</label></h1>
			<p><label class="label">Text:<br />
				<textarea name="summary" class="textbox" style="min-height: 6em" rows={6} cols={60} readOnly={saving} defaultValue={post?.summary}></textarea>
			</label></p>
			{!showDetails && <p><button type="button" class="button" disabled={saving}
				onClick={() => this.setState({ showDetails: true }, () => this.base!.querySelector<HTMLTextAreaElement>('textarea[name="details"]')!.focus())}
			>Add "read more" details</button></p>}
			<p hidden={!showDetails}><label class="label">Text after "Read more":<br />
				<textarea name="details" class="textbox" style="min-height: 6em" rows={10} cols={60} readOnly={saving} defaultValue={post?.details} />
			</label></p>
			{byline}
			<button type="submit" class="button" disabled={saving}>
				<strong>{post ? 'Save' : 'Publish'}</strong>
			</button> {}
			<button type="button" class="button" disabled={saving} onClick={() => this.setState({ editing: false, showDetails: !!post?.details, status: '' })}>
				Cancel
			</button> {}
			<span role="status">{status}</span>
		</form>;
	}
}

function addNewsEditButton(article: HTMLElement) {
	const url = article.getAttribute('data-edit-url')!;
	const isPostPage = article.hasAttribute('data-post-page');
	const edit = document.createElement('button');
	edit.type = 'button';
	edit.className = 'button';
	edit.style.cssFloat = 'right';
	edit.textContent = 'Edit';
	article.insertBefore(edit, article.querySelector('h1'));

	edit.onclick = () => {
		edit.disabled = true;
		edit.textContent = 'Loading…';
		const container = article.cloneNode(false) as HTMLElement;
		Net(url + '?source').get().then(text => {
			const post: EditableNewsPost = JSON.parse(text);
			article.parentNode!.replaceChild(container, article);
			preact.render(<NewsEditor url={url} isPostPage={isPostPage} post={post} />, container);
		}).catch(() => {
			container.parentNode?.replaceChild(article, container);
			edit.textContent = 'Could not load editor. Retry';
			edit.disabled = false;
		});
	};
}

function addNewsEditButtons() {
	for (const article of document.querySelectorAll<HTMLElement>('article[data-edit-url]')) {
		addNewsEditButton(article);
	}
}

function addNewPostButton(username = '???') {
	const container = document.getElementById('new-news-post');
	if (container) preact.render(<NewsEditor url="/news.json" username={username} isPostPage={false} />, container);
}

Net('/api/replays/check-login').get().then(result => {
	if (!result.startsWith(']')) return;
	const [username, isLeader] = result.slice(1).split(',');
	if (!username || !isLeader) return;
	addNewPostButton(username);
	addNewsEditButtons();
}, () => {
	// debugging. TODO: remove before release
	addNewPostButton();
	addNewsEditButtons();
});
