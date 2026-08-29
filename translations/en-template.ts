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
	"Gen {1}": null,

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
	"background by {1}": null,

	// #endregion Main Menu

	// #region Rooms
	// ==================================================================

	// TRANSLATORS: these go under the user/battle counts, and in English they read as "100 users online"
	// TRANSLATORS: but they don't have to work that way in your language
	"users online": null,
	"active battles": null,
	"Find an online user": null,
	"Watch an active battle": null,
	"Meloetta is PS's mascot! The Aria forme is about using its voice, and represents our chatrooms.": null,
	"Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles.": null,

	"Official chat rooms": null,
	"Hidden rooms": null,

	"Subrooms": null,
	"(All rooms)": null,
	"Join or search for rooms": null,
	"Command": null,
	"Console": null,
	"Enter = run command {1}": null,
	"(Subroom of {1})": null,
	"Possible secret room": null,
	"(Private room?)": null,
	"Search results": null,

	// #endregion Rooms

	// #region Battle
	// ==================================================================

	// TRANSLATORS: Note that most translations of battle UI are in the server repository
	// TRANSLATORS: In data/text/[lang]/default.ts and data/text/[lang]/names.ts

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

	// TRANSLATORS: for the battle list
	"Minimum Elo": null,
	"rated {1}": null,
	// TRANSLATORS: goes between two usernames; the key includes its surrounding spacing so some languages can drop it
	" vs. ": null,
	"(All formats)": null,
	"Username prefix": null,
	"No battles are going on": null,
	"{1} battle": null,
	"{1} battles": null,
	"None": null,
	"Timer": null,
	"Error": null,
	"The battle you're looking for has expired. Battles expire after 15 minutes of inactivity unless they're saved.": null,
	"In the future, remember to click \"Save replay\" to save a replay permanently.": null,
	"Unrecognized HTML file: Only replay files are supported.": null,
	"You are still in {1}": null,
	"Battle \"{1}\" not found": null,
	"Uploaded replay": null,
	"Team {1}": null,
	"{1} and friends": null,

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
	"[Earlier messages]": null,
	"Mentioned by {1} in {2}": null,
	"{1} joined": null,
	// TRANSLATORS: separates "X joined" from "Y left"
	"; ": null,
	"{1} left": null,
	"{1} renamed from {2}.": null,
	"(Private to {1})": null,
	"{1} battle started between {2} and {3}.": null,
	// TRANSLATORS: for when the format name already includes "battle"
	"{1} started between {2} and {3}.": null,
	"Register an account to protect your ladder rating!": null,
	"Open team sheet for {1}": null,
	"Warning": null,
	"Variation": null,
	"Rated battle": null,
	"{1} and {2}": null,
	"and {1} others": null,
	// TRANSLATORS: list separator
	", ": null,
	"and {1}": null,
	"({1} line from {2} hidden)": null,
	"({1} lines from {2} hidden)": null,
	"{1} invited you to join the room \"{2}\"": null,
	"[Join {1}]": null,

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
	"[(add folder)]": null,
	"[(add format folder)]": null,
	"Names can't contain slashes, since they're used as a folder separator.": null,
	"Names can't contain the character |, since they're used for storing teams.": null,
	"New name required": null,
	"Not in a folder": null,
	"Teams not in any folders": null,
	"All teams": null,
	"Folders": null,

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
	"Uploaded": null,
	"[Upload for shareable URL]": null,
	"[Upload for shareable/searchable URL]": null,
	"Disconnected (wrong account?)": null,
	"[Revert to uploaded version]": null,
	"[Compare]": null,
	"[Upload changes]": null,
	"Team was deleted": null,
	"Team doesn't exist": null,
	"Untitled team": null,
	"Uploaded by": null,
	"Views": null,
	"Team deleted": null,
	"Not found": null,

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
	"Defensive coverage": null,
	"Teambuilding resources for {1}": null,
	"[See all]": null,
	"Search species or filter by type, learnable moves, ability, tier, or egg group": null,
	"Search abilities": null,
	"Search items": null,
	"Search moves or filter by type or category": null,
	"Sample sets": null,
	"Box sets": null,
	"Guessed spread": null,
	"(Please choose 4 moves to get a guessed spread)": null,
	"Protip:": null,
	"Use a different nature to save {1} EVs:": null,
	"Use a different nature to get higher stats:": null,
	"Natures cannot raise or lower HP.": null,

	// #endregion Teambuilder

	// #region Ladder
	// ==================================================================

	"[All formats]": null,
	"[How the ladder works]": null,
	"[Seasonal rankings]": null,
	"[Look up a specific user's rating]": null,
	"No data returned from server.": null, // NOT USED
	"Name": null,
	"Elo rating": null,
	"user's percentage chance of winning a random battle (Glicko X-Act Estimate)": null,
	"Glicko-1 rating system: rating±deviation (provisional if deviation>100)": null,
	"No one has played any ranked games yet.": null,

	// #endregion Ladder
};
