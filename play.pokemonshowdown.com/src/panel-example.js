/**
 * Example Panel
 *
 * An example of how to make a panel for the client rewrite in vanilla JS.
 *
 * For how to create one in TSX, see `panel-example.tsx`. For JSX, just
 * use the TSX and remove the type annotations.
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

// Example panel in vanilla JS

class ExampleVanillaJS extends preact.Component {
	shouldComponentUpdate() {
		return false;
	}
	componentDidMount() {
		const yourDiv = this.base;
		// edit the contents of your panel however you like here
		yourDiv.innerHTML = '<div class="mainmessage"><p>Hello World!</p></div>';
	}
	render() {
		return preact.h("div", null);
	}
}
class ExampleVanillaJSPanel extends PSRoomPanel {
	// This is the ID of the panel type. It can be whatever you want, but
	// it must not be the same as any other panel ID.
	static id = 'exampleview';
	// This is a list of panel IDs. This would make <<exampleview>> and
	// <<examples-anything>> open this panel.
	static routes = ['exampleview', 'examples-*'];
	// The default title (shown on the tab list). You can edit
	// `this.props.room.title` to change it.
	static title = 'Example View';
	render() {
		return preact.h(PSPanelWrapper, { room: this.props.room },
			preact.h(ExampleVanillaJS, null)
		);
	}
}

PS.addRoomType(ExampleVanillaJSPanel);
