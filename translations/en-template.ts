import type { UIText } from '../build-tools/translations.mts';

// TRANSLATORS: Buttons are surrounded by brackets, like `[OK]` or `[Cancel]`
// TRANSLATORS: Leave the brackets out of your translation.
export const translations: UIText = {
	// #region Navigation
	// ==================================================================

	// TRANSLATORS: Note that "Home" and "Main Menu" refer to the same place
	// TRANSLATORS: So it's fine if they're the same word in your language
	"Home": null,
	// TRANSLATORS: This is used as a "Back to Home" button after battles
	"[Main menu]": null,
	// TRANSLATORS: It's fine if "Teambuilder" and "Teams" are the same word in your language
	// TRANSLATORS: Also consider something like "Edit teams" for "Teambuilder"
	"Teambuilder": null,
	"Ladder": null,
	"Tournaments": null,
	"Friends": null,
	"Chat rooms": null,
	"Battles": null,
	"News": null,
	"Offline": null,

	// #endregion Navigation

	// #region Generic UI
	// ==================================================================

	// if one of these only appears in one panel, consider moving it to that panel's section
	"[Hide]": null,
	"[Close]": null,
	"[Back]": null,
	// TRANSLATORS: A computer copy command, like Ctrl+C
	"[Copy]": null,
	"[Edit]": null,
	"[Delete]": null,
	"[Undo delete]": null,
	// TRANSLATORS: "DM" is used to label DMs and "Chat" is used for the button to start a DM
	// TRANSLATORS: Feel free to use the same word for both
	"DM": null,
	"Chat": null,
	"[Chat]": null,
	"[Cancel]": null,
	"[Accept]": null,
	"[Reject]": null,
	"Random team": null,
	"[Sound]": null,
	"[Options]": null,
	"[Battle options]": null,
	"[Revert]": null,
	"[Refresh]": null,
	"[Search]": null,
	"[Validate]": null,
	"[Reconnect]": null,
	"Disconnected": null,
	"Connecting...": null,
	"Loading...": null,
	"Uploading...": null,
	"[Change]": null,
	"[Add]": null,
	"[Look up]": null,
	"[Save changes]": null,
	"[Create]": null,
	"[Rename]": null,
	"[Remove]": null,

	// #endregion Generic UI

	// #region Popups
	// ==================================================================

	"[Register]": null,
	"[Add status]": null,
	"[Chat self]": null,
	"[Change name]": null,
	"[Log out]": null,
	"[Add friend]": null,
	"[Unignore]": null,
	"[Ignore]": null,
	"[Report]": null,
	"[Mute]": null,
	"[7m]": null,
	"[Hourmute]": null,
	"[1h]": null,
	"[Ban]": null,
	"[2d]": null,
	"[Weekban]": null,
	"[1w]": null,
	"[Modlog]": null,
	// TRANSLATORS: Showdown term for a global mute
	"[Lock]": null,
	"[Weeklock]": null,
	"[Namelock]": null,
	"[Global modlog]": null,
	"[Avatar...]": null,
	"[Password...]": null,
	"[Change background]": null,
	"[Text formatting...]": null,
	"[Choose name]": null,
	"Logging in...": null,
	"[Log in]": null,
	"[Try another name]": null,
	"[Change password]": null,
	"[Done]": null,
	"[Set as background]": null,
	"[Random]": null,
	"[Close room]": null,
	"[OK]": null,
	"[Report a user]": null,
	"[Join the Help room for live help]": null,
	"({1} sec)": null,

	// TRANSLATORS: team chooser
	"(uncategorized)": null,
	"(all)": null,
	"[Other gens]": null,
	"Gen 9": null,

	// #endregion Popups

	// #region Main Menu
	// ==================================================================

	// TRANSLATORS: Our famous ladder queue button. Give it some flair :)
	// TRANSLATORS: Might we suggest "Showdown!"
	"[Battle!]": null,
	"Find a random opponent": null,
	"Watch a battle": null,
	"Find a user": null,
	"Info & Resources": null,
	"Lobby chat": null,

	// TRANSLATORS: Challenge/Search UI
	// technically used in more than the Main Menu, but it might as well be here
	"[Challenge]": null,
	"Custom rules": null,
	// TRANSLATORS: Search countdown. {1} = a number of seconds
	// TRANSLATORS: English doesn't include the unit (seconds) but your language can
	"Searching in {1}...": null,
	"Searching...": null,
	"Pokédex": null,
	"Replays": null,
	"Forum": null,
	"Rules": null,
	"Credits": null,
	"Privacy": null,

	// #endregion Main Menu

	// #region Rooms
	// ==================================================================

	// TRANSLATORS: these go under the user/battle counts, and in English they read as "100 users online"
	// TRANSLATORS: but they don't have to work that way in your language
	"users online": null,
	"active battles": null,
	"Official chat rooms": null,
	"Subrooms": null,

	// #endregion Rooms

	// #region Battle
	// ==================================================================

	// TRANSLATORS: For the Team Preview menu in battle controls
	// TRANSLATORS: Also replaces "Switch" in phases where switching isn't possible
	"Team": null,
	// TRANSLATORS: For the "Use move" menu in battle controls
	"Battle": null,
	// TRANSLATORS: For the "Switch" menu in battle controls
	"Switch": null,
	"[Try Fight button]": null,
	// TRANSLATORS: For the "where to target this move" menu
	"(empty slot)": null,

	"[Rematch]": null,
	"[Offer tie]": null,
	"[Forfeit]": null,
	"[Forfeit and close]": null,
	"[Replace player]": null,
	"[Replace]": null,
	"(turn 100+)": null,
	"[Stop timer]": null,
	"[Start timer]": null,
	// TRANSLATORS: From a tooltip listing the abilities a pokemon might have
	"Possible abilities": null,

	// TRANSLATORS: for replay controls
	"[Play]": null,
	"[Pause]": null,
	"[First turn]": null,
	"[Prev turn]": null,
	"[Skip turn]": null,
	"[Skip to end]": null,
	"[Switch viewpoint]": null,
	"[Go to turn]": null,
	"[Skip]": null,
	"[Skip animation]": null,
	"[Move to center]": null,
	"[Upload and share replay]": null,
	"[Replay]": null,
	"(closes this battle)": null,

	"Minimum Elo": null,

	// #endregion Battle

	// #region Chat
	// ==================================================================

	"{1} user": null,
	"{1} users": null,
	"[Join]": null,
	"[Leave]": null,
	"[Ready!]": null,
	"In Progress": null,
	"Signups": null,
	"[Pop-out]": null,
	"[Go]": null,
	"[Visit]": null,
	"[Choose a name before sending messages]": null,
	"Challenging...": null,
	"Accepting...": null,
	"[Commands]": null,

	// #endregion Chat

	// #region Teambuilder
	// ==================================================================

	// TRANSLATORS: This is for the Teams list view so it can't be singular
	// TRANSLATORS: Should be something like "Teams List" if you have no singular
	// TRANSLATORS: Can be different from TL.term.teams, which "Teams" as in "plural of Team"
	"Teams": null,
	"[New team]": null,
	"[New team in folder]": null,
	// TRANSLATORS: {1} = format
	"[New {1} team]": null,
	"[New box]": null,
	// TRANSLATORS: When deleting a folder, button to add folder name to all teams in it
	"[Convert to prefix]": null,
	"(add folder)": null,
	"(add format folder)": null,

	// TRANSLATORS: for Clipboard actions
	"Copied!": null,
	"[Paste copy here]": null,
	"[Add to clipboard]": null,
	"[Copy/Move]": null,
	"[+ Clipboard]": null,
	"[Deselect]": null,
	"[Move here]": null,

	// TRANSLATORS: for Import/Export
	"[Backup]": null,
	"[Backup search results]": null,
	"[Backup folder]": null,
	"Import/Export": null,
	"[Import/Export]": null,
	"[Import]": null,
	"(can't save partial exports)": null,

	// TRANSLATORS: for uploaded teams
	"Account": null,
	"Account (public)": null,
	"Local": null,
	"[Upload for shareable URL]": null,
	"[Upload for shareable/searchable URL]": null,
	"Disconnected (wrong account?)": null,
	"[Revert to uploaded version]": null,
	"[Compare]": null,
	"[Upload changes]": null,

	// TRANSLATORS: for the team editor
	"[Add Pokémon]": null,
	"Details": null,
	// TRANSLATORS: Teambuilder "form" with text boxes inside, not form/forme "form" of a pokemon
	"Form": null,
	"Tera": null,
	// TRANSLATORS: These two are for Hidden Power type
	// TRANSLATORS: They're both designed to take up very little width, so keep that in mind
	"H.P.": null,
	"H. Power": null,

	// #endregion Teambuilder

	// #region Ladder
	// ==================================================================

	"[All formats]": null,
	"[How the ladder works]": null,

	// #endregion Ladder
};
