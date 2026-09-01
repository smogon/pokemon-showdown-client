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
	"[Join chat]": null,
	"[All tabs]": null,
	"[Menu]": null,

	// #endregion Navigation

	// #region Generic UI
	// ==================================================================

	// if one of these only appears in one panel, consider moving it to that panel's section
	"[Hide]": null,
	"[Close]": null,
	"[Done]": null,
	"[Back]": null,
	// TRANSLATORS: A computer copy command, like Ctrl+C
	"[Copy]": null,
	"[Edit]": null,
	"[Delete]": null,
	"[Undo delete]": null,
	// TRANSLATORS: "DM" is used to label DMs; "[Chat]" is the button to send a DM
	// TRANSLATORS: Feel free to use the same word for both (and for "Chat" in the Battle section)
	"DM": null,
	"[Chat]": null,
	"[OK]": null,
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
	// TRANSLATORS: intentionally chosen to be very short. do not go longer than three letters for this one
	"Gen {NUMBER}": null,
	"[Maximize]": null,
	"[Expand/collapse]": null,

	// TRANSLATORS: connection/team-storage errors
	"Sorry, psim connections are unsupported by your browser.": null,
	"Your browser doesn't support third-party cookies. Some things might not work correctly.": null,
	"Your team storage format is too old for PS. You'll need to upgrade it at {URL}": null,
	"Error loading uploaded teams: {ERROR}": null,
	"Error unknown. Try again later.": null,
	"Failed to load team: {ERROR}": null,
	"Error logging in.": null,
	"Something is interfering with our connection to the login server. Most likely, your internet provider needs you to re-log-in, or your internet provider is blocking Pokémon Showdown.": null,

	// TRANSLATORS: for constructing lists
	"{FIRST} or {SECOND}": null,
	"{FIRST} and {SECOND}": null,
	", {NEXT}": null,
	", or {LAST}": null,
	", and {LAST}": null,
	// TRANSLATORS: this is for lists of users specifically
	// TRANSLATORS: (languages with counters should use the "person" counter)
	", and {NUMBER} others": null,

	// #endregion Generic UI

	// #region Popups
	// ==================================================================

	// TRANSLATORS: user popup
	// TRANSLATORS: "Global {RANK}" is a rank, like "Global Moderator"
	"Global {RANK}": null,
	"Chatrooms": null,
	"Private rooms": null,
	"OFFLINE": null,
	"Username": null,
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
	"[Close room]": null,
	"[Report a user]": null,
	"({NUMBER} sec)": null,
	"Room not found": null,

	// TRANSLATORS: battle options
	"Side-by-side, controls below": null,
	"Side-by-side, overlay controls": null,
	"Top-and-bottom, controls below": null,
	"Top-and-bottom, overlay controls": null,
	"Scrolling, controls below": null,
	"Scrolling, overlay controls": null,
	"Hardcore mode ON: Information not available in-game is now hidden.": null,
	"Hardcore mode OFF: Information not available in-game is now shown.": null,
	"Spectators ignored.": null,
	"Spectators no longer ignored.": null,
	"In this battle": null,
	"Hardcore mode (hide info not shown in-game)": null,
	"Ignore spectators": null,
	"Ignore opponent": null,
	"Ignore nicknames": null,
	"All battles": null,
	"Layout": null,
	"Automatic ({SETTING})": null,
	"Automatic": null,
	"(DESKTOP)": null,
	"(MOBILE VERTICAL)": null,
	"(MOBILE HORIZONTAL)": null,
	"You can still invite spectators by giving them the URL or using the /invite command": null,
	"Invite only (hide from Battles list)": null,
	"Ignore Pokémon nicknames": null,
	"Automatically start timer": null,
	"Hardcore mode": null,
	"Start at turn 0 when spectating battles": null,
	"Open new battles in the right-side panel": null,

	// TRANSLATORS: options
	"General": null,
	"Language": null,
	"Appearance": null,
	"Theme": null,
	"Light": null,
	"Dark": null,
	"Match system theme": null,
	"Two panels (if wide enough)": null,
	"Single panel": null,
	"Vertical tabs": null,
	"Background": null,
	"Disable animations": null,
	"Use 2D sprites instead of 3D models": null,
	"Use modern sprites for past generations": null,
	"Block DMs": null,
	"Block challenges": null,
	"Show DMs in chatrooms": null,
	"Do not highlight when your name is said in chat": null,
	"Confirm before leaving a room": null,
	"Confirm before refreshing": null,
	"Always notify": null,
	"Notify when joined": null,
	"Hide": null,
	"Timestamps": null,
	"Off": null,
	"Timestamps in DMs": null,
	"Chat preferences": null,
	"[Change background]": null,
	"[Text formatting...]": null,
	"[Set as background]": null,
	"[Random]": null,

	// TRANSLATORS: team chooser
	"(uncategorized)": null,
	"(all)": null,
	"[Other gens]": null,
	"Select a team": null,
	"This team selector is no longer available (the challenge was cancelled or something).": null,
	"No teams found": null,
	"This format selector is no longer available.": null,
	"Search formats": null,

	// TRANSLATORS: login
	"[Choose name]": null,
	"Logging in...": null,
	"[Log in]": null,
	"[Try another name]": null,
	"[Password...]": null,
	"[Change password]": null,
	"[Show password]": null,
	"Loading Google log-in button...": null,
	"(color)": null,
	"(Others will be able to see your name change. To change name privately, use \"Log out\")": null,
	"if you registered this name:": null,
	"if not:": null,
	"This is someone else's account. Sorry.": null,
	"Password": null,

	// TRANSLATORS: register / change password
	"All fields are required": null,
	"Passwords do not match": null,
	"Your password was successfully changed!": null,
	"Change your password:": null,
	"Old password": null,
	"New password": null,
	"New password (confirm)": null,
	"You have been successfully registered.": null,
	"Register your account:": null,
	"Password (confirm)": null,
	"An Electric-type mouse that is the mascot of the Pokémon franchise.": null,
	"What is this Pokémon?": null,

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
	// TRANSLATORS: Search countdown. {NUMBER} = a number of seconds
	// TRANSLATORS: English doesn't include the unit (seconds) but your language can
	"Searching in {NUMBER}...": null,
	"Searching...": null,
	"Pokédex": null,
	"Replays": null,
	"Forum": null,
	"Rules": null,
	"Credits": null,
	"Privacy": null,
	"background by {ARTIST}": null,

	// TRANSLATORS: errors
	"Wait for this countdown to finish first...": null,
	"You're already searching for a {FORMAT} battle...": null,
	"You need to go into the Teambuilder and build a team for this format.": null,

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
	"Enter = run command {INPUT}": null,
	"(Subroom of {ROOM})": null,
	"Possible secret room": null,
	"(Private room?)": null,
	"Search results": null,

	// #endregion Rooms

	// #region Battle
	// ==================================================================

	// TRANSLATORS: Note that most translations of battle UI are in the server repository
	// TRANSLATORS: In data/text/[lang]/default.ts and data/text/[lang]/names.ts

	// TRANSLATORS: [Team]/[Battle]/[Switch]/[Shift] are buttons in overlay controls
	// TRANSLATORS: But they're section headers in normal battle controls
	// TRANSLATORS: For the "Use move" menu in battle controls
	// TRANSLATORS: This was "Attack" in older Showdown, "FIGHT" on older cart, and "Battle" on modern cart
	"[Battle]": null,
	// TRANSLATORS: For the "Switch" menu in battle controls
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Switch]": null,
	// TRANSLATORS: For the Team Preview menu in battle controls
	// TRANSLATORS: Also replaces "[Switch]" in phases where switching isn't possible
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Team]": null,
	// TRANSLATORS: The Triples "move to center" button
	// TRANSLATORS: This is "SHIFT" on older cart; Triples doesn't exist on modern cart
	"[Shift]": null,

	// TRANSLATORS: Mobile-layout buttons for switching between the battle view and the chat view
	// TRANSLATORS: ("Chat" is also used as a section header in the options popup)
	"Battle": null,
	"Chat": null,
	"[Try Fight button]": null,
	// TRANSLATORS: For the "where to target this move" menu
	"(empty slot)": null,
	"Maxed with no max moves": null,
	"No Z moves": null,

	"[Rematch]": null,
	"[Offer tie]": null,
	"[Forfeit]": null,
	"[Forfeit and close]": null,
	"[Replace player]": null,
	"[Replace]": null,
	"(turn 100+)": null,
	"[Stop timer]": null,
	"[Start timer]": null,
	"Enter player's name": null,
	"Cannot replace player, battle has already ended.": null,

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
	"rated {ELO}": null,
	// TRANSLATORS: goes between two usernames; the key includes its surrounding spacing so some languages can drop it
	"{PLAYER1} vs. {PLAYER2}": null,
	"(All formats)": null,
	"Username prefix": null,
	"No battles are going on": null,
	"{NUMBER} battle": null,
	"{NUMBER} battles": null,
	"None": null,
	"Timer": null,
	"Error": null,
	"The battle you're looking for has expired. Battles expire after 15 minutes of inactivity unless they're saved.": null,
	"In the future, remember to click \"Save replay\" to save a replay permanently.": null,
	"Unrecognized HTML file: Only replay files are supported.": null,
	"You are still in {ROOM}": null,
	"Battle \"{INPUT}\" not found": null,
	"Uploaded replay": null,
	"Team {PLAYER}": null,
	"{PLAYER} and friends": null,

	// TRANSLATORS: battle log messages
	"[Earlier messages]": null,
	"Register an account to protect your ladder rating!": null,
	"Open team sheet for {PLAYER}": null,
	"Warning": null,
	"Variation": null,
	"Rated battle": null,

	// TRANSLATORS: screen reader labels
	"Active Pokémon": null,
	"Your team": null,
	"Opponent's team": null,
	"Statused": null,
	"Non-statused": null,
	"Unrevealed Illusion user": null,
	"Not revealed": null,
	"Battle controls": null,

	// #endregion Battle

	// #region Chat
	// ==================================================================

	"{NUMBER} user": null,
	"{NUMBER} users": null,
	"[Join]": null,
	"[Leave]": null,
	"[Ready!]": null,
	"In progress": null,
	"Signups": null,
	"[Pop-out]": null,
	"[Go]": null,
	"[Visit]": null,
	"[Choose a name before sending messages]": null,
	"Challenging...": null,
	"Accepting...": null,
	"[Commands]": null,
	"Mentioned by {USER} in {ROOM}": null,
	"{USERS} joined": null,
	// TRANSLATORS: separates "X joined" from "Y left"
	"{JOINEDMESSAGE}; {LEFTMESSAGE}": null,
	"{USERS} left": null,
	"{USER} renamed from {OLDUSER}.": null,
	"(Private to {USER})": null,
	"{FORMAT} battle started between {PLAYER1} and {PLAYER2}.": null,
	// TRANSLATORS: for when the format name already includes "battle"
	"{FORMAT} started between {PLAYER1} and {PLAYER2}.": null,
	// TRANSLATORS: for when the format is unknown
	"Battle started between {PLAYER1} and {PLAYER2}.": null,
	"({NUMBER} line from {USER} hidden)": null,
	"({NUMBER} lines from {USER} hidden)": null,
	"{USER} invited you to join the room \"{ROOM}\"": null,
	"[Join {ROOM}]": null,
	"Chat log": null,

	// TRANSLATORS: tournaments
	"Please respond to the tournament within {SECONDS} seconds or you may be automatically disqualified.": null,
	"Single Elimination": null,
	"Double Elimination": null,
	"Round Robin": null,
	"Double Round Robin": null,
	"{JOINS} joined the tournament": null,
	"{LEAVES} left the tournament": null,
	// TRANSLATORS: sentence terminator for messages like the above
	"{SENTENCE}.": null,
	"{FORMAT} {TYPE} tournament": null,
	"No tournaments are currently running.": null,
	"(started)": null,
	"{TOURNAMENT} created.": null,
	"{TOURNAMENT} created (and hidden).": null,
	"Tournament created": null,
	// TRANSLATORS: label, as in "Room: lobby"
	"Room": null,
	"Type": null,
	"{USER} has joined the tournament, replacing {OLDUSER}.": null,
	"({NUMBER} players)": null,
	"The tournament has started!": null,
	"{USER} has been disqualified from the tournament.": null,
	"The tournament's automatic disqualify timer has been turned off.": null,
	"The tournament's automatic disqualify timer has been set to {NUMBER} minute.": null,
	"The tournament's automatic disqualify timer has been set to {NUMBER} minutes.": null,
	"Tournament automatic disqualification warning": null,
	"Time": null,
	"{NUMBER} sec": null,
	"The tournament's automatic start is now off.": null,
	"The tournament will automatically start in {NUMBER} minute.": null,
	"The tournament will automatically start in {NUMBER} minutes.": null,
	"Scouting is now allowed (Tournament players can watch other tournament battles)": null,
	"Scouting is now banned (Tournament players can't watch other tournament battles)": null,
	"Tournament challenges available": null,
	"Tournament challenge from {PLAYER}": null,
	"Tournament battle between {PLAYER1} and {PLAYER2} started.": null,
	"{PLAYER1} has won the match {SCORE} against {PLAYER2}": null,
	"{PLAYER1} has lost the match {SCORE} against {PLAYER2}": null,
	"{PLAYER1} has drawn the match {SCORE} against {PLAYER2}": null,
	" but the tournament does not support drawing, so it did not count": null,
	"Congratulations to {WINNERS} for winning the {TOURNAMENT}!": null,
	"Runners-up": null,
	"Runner-up": null,
	"The tournament was forcibly ended.": null,
	"The tournament has already started.": null,
	"The tournament hasn't started yet.": null,
	"You are already in the tournament.": null,
	"One of your alts is already in the tournament.": null,
	"You aren't in the tournament.": null,
	"This user isn't in the tournament.": null,
	"There aren't enough users.": null,
	"That isn't a valid timeout value.": null,
	"That isn't a valid tournament matchup.": null,
	"You must have a name in order to join the tournament.": null,
	"The tournament is already at maximum capacity for users.": null,
	"You have already been disqualified.": null,
	"This user has already been disqualified.": null,
	"You are banned from entering tournaments.": null,
	"Unknown error: {ERROR}": null,
	"Waiting for battles to become available...": null,
	"vs. {PLAYER}": null,
	"Or wait for {PLAYERS} to challenge you.": null,
	"Waiting for {PLAYERS} to challenge you.": null,
	"Waiting for {PLAYER}...": null,
	"Unavailable": null,
	"Waiting": null,
	"Challenging": null,

	// TRANSLATORS: command errors
	"This player does not exist or is not online.": null,
	"This command can only be used in proper chat rooms.": null,
	"Error: corrupted ranking data": null,
	"You are not in a battle": null,
	"Invalid turn number: {NUMBER}": null,
	"Turn navigation is disabled in hardcore mode.": null,
	"You are not a player in this battle": null,
	"Can only be used in a DM.": null,
	"Please wait 5 seconds before challenging again.": null,

	// #endregion Chat

	// #region Teambuilder
	// ==================================================================

	// TRANSLATORS: This is for the Teams list view so it can't be singular
	// TRANSLATORS: Should be something like "Teams List" if you have no singular
	// TRANSLATORS: Can be different from TL.term.teams, which "Teams" as in "plural of Team"
	"Teams": null,
	"[New team]": null,
	"[New team in folder]": null,
	"[New {FORMAT} team]": null,
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
	"(choose ability)": null,
	"Details": null,
	// TRANSLATORS: Teambuilder "form" with text boxes inside, not form/forme "form" of a pokemon
	"Form": null,
	"Tera": null,
	// TRANSLATORS: These two are for Hidden Power type
	// TRANSLATORS: They're both designed to take up very little width, so keep that in mind
	"H.P.": null,
	"H. Power": null,
	"Defensive coverage": null,
	"Teambuilding resources for {FORMAT}": null,
	"[See all]": null,
	"Search species or filter by type, learnable moves, ability, tier, or egg group": null,
	"Search abilities": null,
	"Search items": null,
	"Search moves or filter by type or category": null,
	"Sample sets": null,
	"Box sets": null,
	"Guessed spread": null,
	"(Please choose 4 moves to get a guessed spread)": null,
	"Protip": null,
	"Use a different nature to save {NUMBER} EVs:": null,
	"Use a different nature to get higher stats:": null,
	"Natures cannot raise or lower HP.": null,
	// TRANSLATORS: {STATCHANGES} is +stat/-stat
	"{STATCHANGES} nature": null,
	// TRANSLATORS: {1} and {2} are the + and - keyboard keys
	"You can also set natures by typing {1} and {2} in the EV box.": null,
	"Pasted team": null,
	"Zoom out forms": null,
	"Compact": null,
	"Comfortable": null,
	"Zoom out search results": null,
	"Fetching Paste...": null,
	"Import/Export set": null,
	"IV spreads": null,
	"min Atk": null,
	"min Atk, min Spe": null,
	"max all": null,
	"min Spe": null,
	"Hidden Power {TYPE} IVs": null,
	"EVs, IVs, and nature": null,
	"Base": null,
	"Remaining": null,

	// TRANSLATORS: errors
	"You must select a format first.": null,
	"This team is for a different account. Please log into the correct account to update it.": null,
	"Add a Pokémon to your team before uploading it.": null,
	"Must use on an uploaded team.": null,
	"Team not found: {INPUT}": null,
	"Your file \"{FILENAME}\" is not a valid team.": null,

	// #endregion Teambuilder

	// #region Ladder
	// ==================================================================

	"[All formats]": null,
	"[How the ladder works]": null,
	"[Seasonal rankings]": null,
	"[Look up a specific user's rating]": null,
	"Name": null,
	"Elo rating": null,
	"user's percentage chance of winning a random battle (Glicko X-Act Estimate)": null,
	"Glicko-1 rating system: rating±deviation (provisional if deviation>100)": null,
	"No one has played any ranked games yet.": null,

	// #endregion Ladder

	// #region Misc rooms
	// ==================================================================

	"[Join the Help room for live help]": null,
	"Unrecognized command: {INPUT}": null,

	// #endregion Misc rooms
};
