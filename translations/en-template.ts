import type { UIText } from '../build-tools/translations.mts';

export const translations: UIText = {
	// #region Navigation
	// ==================================================================

	// TRANSLATORS: Note that "Home" and "Main Menu" refer to the same place
	// TRANSLATORS: So it's fine if they're the same word in your language
	"Home": null,
	// TRANSLATORS: This is used as a "Back to Home" button after battles
	"Main menu": null,
	// TRANSLATORS: It's fine if "Teambuilder" and "Teams" are the same word in your language
	// TRANSLATORS: Also consider something like "Edit teams" for "Teambuilder"
	"Teambuilder": null,
	"Ladder": null,
	"Tournaments": null,
	"Friends": null,
	"Chat rooms": null,
	"Battles": null,
	"News": null,

	// #endregion Navigation

	// #region Generic UI
	// ==================================================================

	// if one of these only appears in one panel, consider moving it to that panel's section
	"Hide": null,
	"Close": null,
	"Back": null,
	// TRANSLATORS: A computer copy command, like Ctrl+C
	"Copy": null,
	"Delete": null,
	"Undo delete": null,
	"Challenge": null,
	// TRANSLATORS: "DM" is used to label DMs and "Chat" is used for the button to start a DM
	// TRANSLATORS: Feel free to use the same word for both
	"DM": null,
	"Chat": null,
	"Cancel": null,
	"Accept": null,
	"Reject": null,
	"Random team": null,
	"Sound": null,
	"Options": null,
	"Battle options": null,
	"Format": null, // NOT USED
	"Format:": null,
	"Team:": null,
	// TRANSLATORS: From a tooltip listing the abilities a pokemon might have
	"Possible abilities:": null,

	// #endregion Generic UI

	// #region Main Menu
	// ==================================================================

	"Battle!": null,
	"Find a random opponent": null,
	"Watch a battle": null,
	"Find a user": null,
	"Info & Resources": null,
	"Lobby chat": null,

	// #endregion Main Menu

	// #region Rooms
	// ==================================================================

	// TRANSLATORS: these go under the user/battle counts, and in English they read as "100 users online"
	// TRANSLATORS: but they don't have to work that way in your language
	"users online": null,
	"active battles": null,
	"Official chat rooms": null,

	// #endregion Rooms

	// #region Battle
	// ==================================================================

	"Team": null,
	"Battle": null,
	"Switch": null,
	"Rematch": null,
	"Forfeit": null,

	// #endregion Battle

	// #region Chat
	// ==================================================================

	"[1] user": null,
	"[1] users": null,

	// #endregion Chat

	// #region Teambuilder
	// ==================================================================

	// TRANSLATORS: This is for the Teams list view so it can't be singular
	// TRANSLATORS: Should be something like "Teams List" if you have no singular
	// TRANSLATORS: Can be different from TL.term.teams, which "Teams" as in "plural of Team"
	"Teams": null,
	"New team": null,
	"New box": null,
	"Add Pokémon": null,

	// #endregion Teambuilder
};
