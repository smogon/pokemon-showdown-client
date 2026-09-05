// Remember, comments starting with "TRANSLATORS:" are from Showdown,
// and are shared between all translations. But other comments can be
// used as notes to yourself or other translators, and are specific
// to the German translation.

import type { UIText } from '../build-tools/translations.mts';
export const translations: UIText = {
	// #region Navigation
	// ==================================================================

	// TRANSLATORS: Note that "Home" and "Main Menu" refer to the same place
	// TRANSLATORS: So it's fine if they're the same word in your language
	"Home": "Startseite", // NEEDS QC
	// TRANSLATORS: This is used as a "Back to Home" button after battles
	"[Main menu]": "Hauptmenü", // NEEDS QC
	// TRANSLATORS: It's fine if "Teambuilder" and "Teams" are the same word in your language
	// TRANSLATORS: Also consider something like "Edit teams" for "Teambuilder"
	// "Teams bearbeiten" is the "edit teams" alternative
	"Teambuilder": "Team-Editor", // NEEDS QC
	"Ladder": "Rangliste", // NEEDS QC
	"Tournaments": "Turniere", // NEEDS QC
	"Friends": "Freunde", // NEEDS QC
	"Chat rooms": "Chaträume", // NEEDS QC
	"Battles": "Kämpfe", // NEEDS QC
	"News": "Neuigkeiten", // NEEDS QC
	"Offline": "Offline", // NEEDS QC
	"[Join chat]": "Chat beitreten", // NEEDS QC
	"[All tabs]": "Alle Tabs", // NEEDS QC
	"[Menu]": "Menü", // NEEDS QC

	// #endregion Navigation

	// #region Generic UI
	// ==================================================================

	"[Hide]": "Ausblenden", // NEEDS QC
	"[Close]": "Schließen", // NEEDS QC
	"[Done]": "Fertig", // NEEDS QC
	"[Back]": "Zurück", // NEEDS QC
	// TRANSLATORS: A computer copy command, like Ctrl+C
	"[Copy]": "Kopieren", // NEEDS QC
	"[Edit]": "Bearbeiten", // NEEDS QC
	"[Delete]": "Löschen", // NEEDS QC
	"[Undo delete]": "Löschen rückgängig machen", // NEEDS QC
	// TRANSLATORS: "DM" is used to label DMs; "[Chat]" is the button to send a DM
	// TRANSLATORS: Feel free to use the same word for both (and for "Chat" in the Battle section)
	// "PN" (private Nachricht) is the traditional German forum term,
	// but "DM" is widely understood now
	"DM": "DM", // NEEDS QC
	"[Chat]": "Chatten", // NEEDS QC
	"[OK]": "OK", // NEEDS QC
	"[Cancel]": "Abbrechen", // NEEDS QC
	"[Accept]": "Annehmen", // NEEDS QC
	"[Reject]": "Ablehnen", // NEEDS QC
	"Random team": "Zufallsteam", // NEEDS QC
	"[Sound]": "Ton", // NEEDS QC
	"[Options]": "Einstellungen", // NEEDS QC
	"[Battle options]": "Kampfeinstellungen", // NEEDS QC
	"[Revert]": "Zurücksetzen", // NEEDS QC
	"[Refresh]": "Neu laden", // NEEDS QC
	"[Search]": "Suchen", // NEEDS QC
	"[Validate]": "Überprüfen", // NEEDS QC
	"[Reconnect]": "Neu verbinden", // NEEDS QC
	"Disconnected": "Verbindung getrennt", // NEEDS QC
	"Connecting...": "Verbinde...", // NEEDS QC
	"Loading...": "Lädt...", // NEEDS QC
	"Uploading...": "Wird hochgeladen...", // NEEDS QC
	"[Change]": "Ändern", // NEEDS QC
	"[Add]": "Hinzufügen", // NEEDS QC
	"[Look up]": "Nachschlagen", // NEEDS QC
	"[Save changes]": "Speichern", // NEEDS QC
	"[Create]": "Erstellen", // NEEDS QC
	"[Rename]": "Umbenennen", // NEEDS QC
	"[Remove]": "Entfernen", // NEEDS QC
	// TRANSLATORS: intentionally chosen to be very short. do not go longer than three letters for this one
	"Gen {NUMBER}": "{NUMBER}. Gen", // NEEDS QC
	"[Maximize]": "Maximieren", // NEEDS QC
	"[Expand/collapse]": "Ein-/ausklappen", // NEEDS QC

	// TRANSLATORS: connection/team-storage errors
	"Sorry, psim connections are unsupported by your browser.": "Sorry, dein Browser unterstützt keine psim-Verbindungen.", // NEEDS QC
	"Your browser doesn't support third-party cookies. Some things might not work correctly.": "Dein Browser unterstützt keine Drittanbieter-Cookies. Einige Dinge funktionieren möglicherweise nicht richtig.", // NEEDS QC
	"Your team storage format is too old for PS. You'll need to upgrade it at {URL}": "Dein Team-Speicherformat ist zu alt für PS. Du musst es unter {URL} aktualisieren", // NEEDS QC
	"Error loading uploaded teams: {ERROR}": "Fehler beim Laden der hochgeladenen Teams: {ERROR}", // NEEDS QC
	"Error unknown. Try again later.": "Unbekannter Fehler. Versuche es später erneut.", // NEEDS QC
	"Failed to load team: {ERROR}": "Team konnte nicht geladen werden: {ERROR}", // NEEDS QC
	"Error logging in.": "Fehler beim Einloggen.", // NEEDS QC
	"Something is interfering with our connection to the login server. Most likely, your internet provider needs you to re-log-in, or your internet provider is blocking Pokémon Showdown.": "Etwas stört unsere Verbindung zum Login-Server. Wahrscheinlich verlangt dein Internetanbieter, dass du dich neu einloggst, oder er blockiert Pokémon Showdown.", // NEEDS QC

	// TRANSLATORS: for constructing lists
	"{FIRST} or {SECOND}": "{FIRST} oder {SECOND}", // NEEDS QC
	"{FIRST} and {SECOND}": "{FIRST} und {SECOND}", // NEEDS QC
	", {NEXT}": ", {NEXT}", // NEEDS QC
	", or {LAST}": " oder {LAST}", // NEEDS QC
	", and {LAST}": " und {LAST}", // NEEDS QC
	// TRANSLATORS: this is for lists of users specifically
	// TRANSLATORS: (languages with counters should use the "person" counter)
	", and {NUMBER} others": " und {NUMBER} weitere", // NEEDS QC

	// #endregion Generic UI

	// #region Popups
	// ==================================================================

	// TRANSLATORS: user popup
	// TRANSLATORS: "Global {RANK}" is a rank, like "Global Moderator"
	"Global {RANK}": "Globaler {RANK}", // NEEDS QC
	"Chatrooms": "Chaträume", // NEEDS QC
	"Private rooms": "Private Räume", // NEEDS QC
	"OFFLINE": "OFFLINE", // NEEDS QC
	"Username": "Benutzername", // NEEDS QC
	"[Register]": "Registrieren", // NEEDS QC
	"[Add status]": "Status hinzufügen", // NEEDS QC
	"[Chat self]": "Mit sich selbst chatten", // NEEDS QC
	"[Change name]": "Namen ändern", // NEEDS QC
	"[Log out]": "Abmelden", // NEEDS QC
	"[Add friend]": "Freund hinzufügen", // NEEDS QC
	"[Unignore]": "Nicht mehr ignorieren", // NEEDS QC
	"[Ignore]": "Ignorieren", // NEEDS QC
	"[Report]": "Melden", // NEEDS QC
	"[Mute]": "Stummschalten", // NEEDS QC
	"[7m]": "7 Min.", // NEEDS QC
	"[Hourmute]": "1 Stunde stumm", // NEEDS QC
	"[1h]": "1 Std.", // NEEDS QC
	"[Ban]": "Bannen", // NEEDS QC
	"[2d]": "2 Tage", // NEEDS QC
	"[Weekban]": "1 Woche Bann", // NEEDS QC
	"[1w]": "1 Wo.", // NEEDS QC
	"[Modlog]": "Modlog", // NEEDS QC
	// TRANSLATORS: Showdown term for a global mute
	"[Lock]": "Sperren", // NEEDS QC
	"[Weeklock]": "1 Woche Sperre", // NEEDS QC
	"[Namelock]": "Namenssperre", // NEEDS QC
	"[Global modlog]": "Globales Modlog", // NEEDS QC
	"[Avatar...]": "Avatar...", // NEEDS QC
	"[Close room]": "Raum schließen", // NEEDS QC
	"[Report a user]": "Nutzer melden", // NEEDS QC
	"({NUMBER} sec)": "({NUMBER} Sek.)", // NEEDS QC
	"Room not found": "Raum nicht gefunden", // NEEDS QC

	// TRANSLATORS: battle options
	"Side-by-side, controls below": "Nebeneinander, Steuerung darunter", // NEEDS QC
	"Side-by-side, overlay controls": "Nebeneinander, Steuerung überlagert", // NEEDS QC
	"Top-and-bottom, controls below": "Übereinander, Steuerung darunter", // NEEDS QC
	"Top-and-bottom, overlay controls": "Übereinander, Steuerung überlagert", // NEEDS QC
	"Scrolling, controls below": "Scrollend, Steuerung darunter", // NEEDS QC
	"Scrolling, overlay controls": "Scrollend, Steuerung überlagert", // NEEDS QC
	"Hardcore mode ON: Information not available in-game is now hidden.": "Hardcore-Modus AN: Informationen, die im Spiel nicht verfügbar sind, werden jetzt versteckt.", // NEEDS QC
	"Hardcore mode OFF: Information not available in-game is now shown.": "Hardcore-Modus AUS: Informationen, die im Spiel nicht verfügbar sind, werden jetzt angezeigt.", // NEEDS QC
	"Spectators ignored.": "Zuschauer werden ignoriert.", // NEEDS QC
	"Spectators no longer ignored.": "Zuschauer werden nicht mehr ignoriert.", // NEEDS QC
	"In this battle": "In diesem Kampf", // NEEDS QC
	"Hardcore mode (hide info not shown in-game)": "Hardcore-Modus (Infos verstecken, die im Spiel nicht sichtbar sind)", // NEEDS QC
	"Ignore spectators": "Zuschauer ignorieren", // NEEDS QC
	"Ignore opponent": "Gegner ignorieren", // NEEDS QC
	"Ignore nicknames": "Spitznamen ignorieren", // NEEDS QC
	"All battles": "Alle Kämpfe", // NEEDS QC
	"Layout": "Layout", // NEEDS QC
	"Automatic ({SETTING})": "Automatisch ({SETTING})", // NEEDS QC
	"Automatic": "Automatisch", // NEEDS QC
	"(DESKTOP)": "(DESKTOP)", // NEEDS QC
	"(MOBILE VERTICAL)": "(HANDY VERTIKAL)", // NEEDS QC
	"(MOBILE HORIZONTAL)": "(HANDY HORIZONTAL)", // NEEDS QC
	"You can still invite spectators by giving them the URL or using the /invite command": "Du kannst weiterhin Zuschauer einladen, indem du ihnen die URL gibst oder /invite verwendest", // NEEDS QC
	"Invite only (hide from Battles list)": "Nur auf Einladung (nicht in der Kampfliste anzeigen)", // NEEDS QC
	"Ignore Pokémon nicknames": "Pokémon-Spitznamen ignorieren", // NEEDS QC
	"Automatically start timer": "Timer automatisch starten", // NEEDS QC
	"Hardcore mode": "Hardcore-Modus", // NEEDS QC
	"Start at turn 0 when spectating battles": "Beim Zuschauen bei Runde 0 beginnen", // NEEDS QC
	"Open new battles in the right-side panel": "Neue Kämpfe im rechten Panel öffnen", // NEEDS QC

	// TRANSLATORS: options
	"General": "Allgemein", // NEEDS QC
	"Language": "Sprache", // NEEDS QC
	"Appearance": "Aussehen", // NEEDS QC
	"Theme": "Design", // NEEDS QC
	"Light": "Hell", // NEEDS QC
	"Dark": "Dunkel", // NEEDS QC
	"Match system theme": "Systemeinstellung folgen", // NEEDS QC
	"Two panels (if wide enough)": "Zwei Panels (wenn genug Platz)", // NEEDS QC
	"Single panel": "Ein Panel", // NEEDS QC
	"Vertical tabs": "Vertikale Tabs", // NEEDS QC
	"Background": "Hintergrund", // NEEDS QC
	"Disable animations": "Animationen deaktivieren", // NEEDS QC
	"Use 2D sprites instead of 3D models": "2D-Sprites statt 3D-Modellen verwenden", // NEEDS QC
	"Use modern sprites for past generations": "Moderne Sprites für frühere Generationen verwenden", // NEEDS QC
	"Block DMs": "DMs blockieren", // NEEDS QC
	"Block challenges": "Herausforderungen blockieren", // NEEDS QC
	"Show DMs in chatrooms": "DMs in Chaträumen anzeigen", // NEEDS QC
	"Do not highlight when your name is said in chat": "Nicht hervorheben, wenn dein Name im Chat genannt wird", // NEEDS QC
	"Confirm before leaving a room": "Vor dem Verlassen eines Raums nachfragen", // NEEDS QC
	"Confirm before refreshing": "Vor dem Aktualisieren nachfragen", // NEEDS QC
	"Always notify": "Immer benachrichtigen", // NEEDS QC
	"Notify when joined": "Nur bei Teilnahme benachrichtigen", // NEEDS QC
	"Hide": "Ausblenden", // NEEDS QC
	"Timestamps": "Zeitstempel", // NEEDS QC
	"Off": "Aus", // NEEDS QC
	"Timestamps in DMs": "Zeitstempel in DMs", // NEEDS QC
	"Chat preferences": "Chat-Einstellungen", // NEEDS QC
	"[Change background]": "Hintergrund ändern", // NEEDS QC
	"[Text formatting...]": "Textformatierung...", // NEEDS QC
	"[Set as background]": "Als Hintergrund festlegen", // NEEDS QC
	"[Random]": "Zufällig", // NEEDS QC

	// TRANSLATORS: team chooser
	"(uncategorized)": "(unkategorisiert)", // NEEDS QC
	"(all)": "(alle)", // NEEDS QC
	"[Other gens]": "Andere Generationen", // NEEDS QC
	"Select a team": "Team auswählen", // NEEDS QC
	"This team selector is no longer available (the challenge was cancelled or something).": "Diese Teamauswahl ist nicht mehr verfügbar (die Herausforderung wurde abgebrochen oder so).", // NEEDS QC
	"No teams found": "Keine Teams gefunden", // NEEDS QC
	"This format selector is no longer available.": "Diese Formatauswahl ist nicht mehr verfügbar.", // NEEDS QC
	"Search formats": "Formate durchsuchen", // NEEDS QC

	// TRANSLATORS: login
	"[Choose name]": "Namen wählen", // NEEDS QC
	"Logging in...": "Anmeldung...", // NEEDS QC
	"[Log in]": "Anmelden", // NEEDS QC
	"[Try another name]": "Anderen Namen wählen", // NEEDS QC
	"[Password...]": "Passwort...", // NEEDS QC
	"[Change password]": "Passwort ändern", // NEEDS QC
	"[Show password]": "Passwort anzeigen", // NEEDS QC
	"Loading Google log-in button...": "Google-Login-Button wird geladen...", // NEEDS QC
	"(color)": "(Farbe)", // NEEDS QC
	"(Others will be able to see your name change. To change name privately, use \"Log out\")": "(Andere können deine Namensänderung sehen. Um deinen Namen privat zu ändern, nutze „Abmelden“)", // NEEDS QC
	"if you registered this name:": "falls du diesen Namen registriert hast:", // NEEDS QC
	"if not:": "falls nicht:", // NEEDS QC
	"This is someone else's account. Sorry.": "Dieser Account gehört jemand anderem. Sorry.", // NEEDS QC
	"Password": "Passwort", // NEEDS QC

	// TRANSLATORS: register / change password
	"All fields are required": "Alle Felder sind erforderlich", // NEEDS QC
	"Passwords do not match": "Passwörter stimmen nicht überein", // NEEDS QC
	"Your password was successfully changed!": "Dein Passwort wurde erfolgreich geändert!", // NEEDS QC
	"Change your password:": "Ändere dein Passwort:", // NEEDS QC
	"Old password": "Altes Passwort", // NEEDS QC
	"New password": "Neues Passwort", // NEEDS QC
	"New password (confirm)": "Neues Passwort (bestätigen)", // NEEDS QC
	"You have been successfully registered.": "Du wurdest erfolgreich registriert.", // NEEDS QC
	"Register your account:": "Registriere deinen Account:", // NEEDS QC
	"Password (confirm)": "Passwort (bestätigen)", // NEEDS QC
	"An Electric-type mouse that is the mascot of the Pokémon franchise.": "Eine Elektro-Maus, die das Maskottchen der Pokémon-Reihe ist.", // NEEDS QC
	"What is this Pokémon?": "Welches Pokémon ist das?", // NEEDS QC

	// #endregion Popups

	// #region Main Menu
	// ==================================================================

	// TRANSLATORS: Our famous ladder queue button. Give it some flair :)
	// TRANSLATORS: Might we suggest "Showdown!"
	"[Battle!]": "Auf in den Kampf!", // NEEDS QC
	"Find a random opponent": "Zufälligen Gegner suchen", // NEEDS QC
	"Watch a battle": "Einen Kampf ansehen", // NEEDS QC
	"Find a user": "Benutzer suchen", // NEEDS QC
	"Info & Resources": "Infos & Ressourcen", // NEEDS QC
	"Lobby chat": "Lobby-Chat", // NEEDS QC

	// TRANSLATORS: Challenge/Search UI
	"[Challenge]": "Herausfordern", // NEEDS QC
	"Custom rules": "Eigene Regeln", // NEEDS QC
	// TRANSLATORS: Search countdown. {NUMBER} = a number of seconds
	// TRANSLATORS: English doesn't include the unit (seconds) but your language can
	"Searching in {NUMBER}...": "Suche beginnt in {NUMBER}...", // NEEDS QC
	"Searching...": "Suche Gegner...", // NEEDS QC
	"Pokédex": "Pokédex", // NEEDS QC
	"Replays": "Replays", // NEEDS QC
	"Forum": "Forum", // NEEDS QC
	"Rules": "Regeln", // NEEDS QC
	"Credits": "Credits", // NEEDS QC
	"Privacy": "Datenschutz", // NEEDS QC
	"background by {ARTIST}": "Hintergrund von {ARTIST}", // NEEDS QC

	// TRANSLATORS: errors
	"Wait for this countdown to finish first...": "Warte zuerst, bis dieser Countdown abgelaufen ist...", // NEEDS QC
	"You're already searching for a {FORMAT} battle...": "Du suchst bereits nach einem {FORMAT}-Kampf...", // NEEDS QC
	"You need to go into the Teambuilder and build a team for this format.": "Du musst im Teambuilder ein Team für dieses Format bauen.", // NEEDS QC

	// #endregion Main Menu

	// #region Rooms
	// ==================================================================

	// TRANSLATORS: these go under the user/battle counts, and in English they read as "100 users online"
	// TRANSLATORS: but they don't have to work that way in your language
	"users online": "Benutzer online", // NEEDS QC
	"active battles": "laufende Kämpfe", // NEEDS QC
	"Find an online user": "Online-Benutzer finden", // NEEDS QC
	"Watch an active battle": "Einen laufenden Kampf ansehen", // NEEDS QC
	"Meloetta is PS's mascot! The Aria forme is about using its voice, and represents our chatrooms.": "Meloetta ist PS' Maskottchen! Die Gesangsform nutzt ihre Stimme und steht für unsere Chaträume.", // NEEDS QC
	"Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles.": "Meloetta ist PS' Maskottchen! Die Tanzform ist vom Typ Kampf und steht für unsere Kämpfe.", // NEEDS QC

	"Official chat rooms": "Offizielle Chaträume", // NEEDS QC
	"Hidden rooms": "Versteckte Räume", // NEEDS QC

	"Subrooms": "Unterräume", // NEEDS QC
	"(All rooms)": "(Alle Räume)", // NEEDS QC
	"Join or search for rooms": "Räumen beitreten oder suchen", // NEEDS QC
	"Command": "Befehl", // NEEDS QC
	"Console": "Konsole", // NEEDS QC
	"Enter = run command {INPUT}": "Enter = Befehl {INPUT} ausführen", // NEEDS QC
	"(Subroom of {ROOM})": "(Unterraum von {ROOM})", // NEEDS QC
	"Possible secret room": "Möglicher geheimer Raum", // NEEDS QC
	"(Private room?)": "(Privater Raum?)", // NEEDS QC
	"Search results": "Suchergebnisse", // NEEDS QC

	// #endregion Rooms

	// #region Battle
	// ==================================================================

	// TRANSLATORS: Note that most translations of battle UI are in the server repository
	// TRANSLATORS: In data/text/[lang]/default.ts and data/text/[lang]/names.ts

	// TRANSLATORS: [Team]/[Battle]/[Switch]/[Shift] are buttons in overlay controls
	// TRANSLATORS: But they're section headers in normal battle controls
	// TRANSLATORS: For the "Use move" menu in battle controls
	// TRANSLATORS: This was "Attack" in older Showdown, "FIGHT" on older cart, and "Battle" on modern cart
	// SV battle menu: Kampf
	"[Battle]": "Kampf", // NEEDS QC
	// TRANSLATORS: For the "Switch" menu in battle controls
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Switch]": "Wechseln", // NEEDS QC
	// TRANSLATORS: For the Team Preview menu in battle controls
	// TRANSLATORS: Also replaces "[Switch]" in phases where switching isn't possible
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Team]": "Team", // NEEDS QC
	// TRANSLATORS: The Triples "move to center" button
	// TRANSLATORS: This is "SHIFT" on older cart; Triples doesn't exist on modern cart
	// ORAS battle menu (the last games with Triples): Bewegen
	"[Shift]": "Bewegen", // NEEDS QC

	// TRANSLATORS: Mobile-layout buttons for switching between the battle view and the chat view
	// TRANSLATORS: ("Chat" is also used as a section header in the options popup)
	"Battle": "Kampf", // NEEDS QC
	"Chat": "Chat", // NEEDS QC
	"[Try Fight button]": "Kampf-Button testen", // NEEDS QC
	// TRANSLATORS: For the "where to target this move" menu
	"(empty slot)": "(leerer Platz)", // NEEDS QC
	"Maxed with no max moves": "Keine Dyna-Attacken verfügbar", // NEEDS QC
	"No Z moves": "Keine Z-Attacken", // NEEDS QC

	"[Rematch]": "Revanche", // NEEDS QC
	"[Offer tie]": "Unentschieden anbieten", // NEEDS QC
	"[Forfeit]": "Aufgeben", // NEEDS QC
	"[Forfeit and close]": "Aufgeben und schließen", // NEEDS QC
	"[Replace player]": "Spieler ersetzen", // NEEDS QC
	"[Replace]": "Ersetzen", // NEEDS QC
	"(turn 100+)": "(ab Runde 100)", // NEEDS QC
	"[Stop timer]": "Timer stoppen", // NEEDS QC
	"[Start timer]": "Timer starten", // NEEDS QC
	"Enter player's name": "Gib den Namen des Spielers ein", // NEEDS QC
	"Cannot replace player, battle has already ended.": "Spieler kann nicht ersetzt werden, der Kampf ist bereits beendet.", // NEEDS QC

	// TRANSLATORS: for replay controls
	"[Play]": "Abspielen", // NEEDS QC
	"[Pause]": "Pause", // NEEDS QC
	"[First turn]": "Erste Runde", // NEEDS QC
	"[Prev turn]": "Vorige Runde", // NEEDS QC
	"[Skip turn]": "Nächste Runde", // NEEDS QC
	"[Skip to end]": "Zum Ende springen", // NEEDS QC
	"[Switch viewpoint]": "Perspektive wechseln", // NEEDS QC
	"[Go to turn]": "Zu Runde springen", // NEEDS QC
	"[Skip]": "Überspringen", // NEEDS QC
	"[Skip animation]": "Animation überspringen", // NEEDS QC
	"[Move to center]": "In die Mitte rücken", // NEEDS QC
	"[Upload and share replay]": "Replay hochladen und teilen", // NEEDS QC
	"[Replay]": "Replay", // NEEDS QC
	"(closes this battle)": "(schließt diesen Kampf)", // NEEDS QC

	// TRANSLATORS: for the battle list
	"Minimum Elo": "Mindest-Elo", // NEEDS QC
	"rated {ELO}": "Wertung {ELO}", // NEEDS QC
	// TRANSLATORS: goes between two usernames; the key includes its surrounding spacing so some languages can drop it
	"{PLAYER1} vs. {PLAYER2}": "{PLAYER1} vs. {PLAYER2}", // NEEDS QC
	"(All formats)": "(Alle Formate)", // NEEDS QC
	"Username prefix": "Benutzername-Präfix", // NEEDS QC
	"No battles are going on": "Zurzeit laufen keine Kämpfe", // NEEDS QC
	"{NUMBER} battle": "{NUMBER} Kampf", // NEEDS QC
	"{NUMBER} battles": "{NUMBER} Kämpfe", // NEEDS QC
	"None": "Keine", // NEEDS QC
	"Timer": "Timer", // NEEDS QC
	"Error": "Fehler", // NEEDS QC
	"The battle you're looking for has expired. Battles expire after 15 minutes of inactivity unless they're saved.": "Der gesuchte Kampf ist abgelaufen. Kämpfe laufen nach 15 Minuten Inaktivität ab, sofern sie nicht gespeichert werden.", // NEEDS QC
	"In the future, remember to click \"Save replay\" to save a replay permanently.": "Denke in Zukunft daran, auf „Replay speichern“ zu klicken, um ein Replay dauerhaft zu speichern.", // NEEDS QC
	"Unrecognized HTML file: Only replay files are supported.": "Unbekannte HTML-Datei: Nur Replay-Dateien werden unterstützt.", // NEEDS QC
	"You are still in {ROOM}": "Du bist noch in {ROOM}", // NEEDS QC
	"Battle \"{INPUT}\" not found": "Kampf „{INPUT}“ nicht gefunden", // NEEDS QC
	"Uploaded replay": "Hochgeladenes Replay", // NEEDS QC
	"Team {PLAYER}": "Team {PLAYER}", // NEEDS QC
	"{PLAYER} and friends": "{PLAYER} und Freunde", // NEEDS QC

	// TRANSLATORS: battle log messages
	"[Earlier messages]": "Frühere Nachrichten", // NEEDS QC
	"Register an account to protect your ladder rating!": "Registriere einen Account, um deine Ranglisten-Wertung zu schützen!", // NEEDS QC
	"Open team sheet for {PLAYER}": "Team-Sheet von {PLAYER} öffnen", // NEEDS QC
	"Warning": "Warnung", // NEEDS QC
	"Variation": "Variante", // NEEDS QC
	"Rated battle": "Gewerteter Kampf", // NEEDS QC

	// TRANSLATORS: screen reader labels
	"Active Pokémon": "Aktives Pokémon", // NEEDS QC
	"Your team": "Dein Team", // NEEDS QC
	"Opponent's team": "Gegnerisches Team", // NEEDS QC
	"Statused": "Mit Statusproblem", // NEEDS QC
	"Non-statused": "Ohne Statusproblem", // NEEDS QC
	"Unrevealed Illusion user": "Nicht aufgedeckter Trugbild-Anwender", // NEEDS QC
	"Not revealed": "Nicht aufgedeckt", // NEEDS QC
	"Battle controls": "Kampfsteuerung", // NEEDS QC

	// #endregion Battle

	// #region Chat
	// ==================================================================

	// German singular and plural of "Benutzer" happen to be identical
	"{NUMBER} user": "{NUMBER} Benutzer", // NEEDS QC
	"{NUMBER} users": "{NUMBER} Benutzer", // NEEDS QC
	"[Join]": "Beitreten", // NEEDS QC
	"[Leave]": "Verlassen", // NEEDS QC
	"[Ready!]": "Bereit!", // NEEDS QC
	"In progress": "Läuft", // NEEDS QC
	"Signups": "Anmeldung", // NEEDS QC
	"[Pop-out]": "Eigenes Fenster", // NEEDS QC
	"[Go]": "Los", // NEEDS QC
	"[Visit]": "Öffnen", // NEEDS QC
	"[Choose a name before sending messages]": "Wähle einen Namen, um Nachrichten zu senden", // NEEDS QC
	"Challenging...": "Fordere heraus...", // NEEDS QC
	"Accepting...": "Nehme an...", // NEEDS QC
	"[Commands]": "Befehle", // NEEDS QC
	"Mentioned by {USER} in {ROOM}": "Von {USER} in {ROOM} erwähnt", // NEEDS QC
	"{USERS} joined": "Beigetreten: {USERS}", // NEEDS QC
	// TRANSLATORS: separates "X joined" from "Y left"
	"{JOINEDMESSAGE}; {LEFTMESSAGE}": "{JOINEDMESSAGE}; {LEFTMESSAGE}", // NEEDS QC
	"{USERS} left": "Gegangen: {USERS}", // NEEDS QC
	"{USER} renamed from {OLDUSER}.": "{OLDUSER} heißt jetzt {USER}.", // NEEDS QC
	"(Private to {USER})": "(Privat an {USER})", // NEEDS QC
	"{FORMAT} battle started between {PLAYER1} and {PLAYER2}.": "{FORMAT}-Kampf zwischen {PLAYER1} und {PLAYER2} gestartet.", // NEEDS QC
	// TRANSLATORS: for when the format name already includes "battle"
	"{FORMAT} started between {PLAYER1} and {PLAYER2}.": "{FORMAT} zwischen {PLAYER1} und {PLAYER2} gestartet.", // NEEDS QC
	// TRANSLATORS: for when the format is unknown
	"Battle started between {PLAYER1} and {PLAYER2}.": "Kampf zwischen {PLAYER1} und {PLAYER2} gestartet.", // NEEDS QC
	"({NUMBER} line from {USER} hidden)": "({NUMBER} Zeile von {USER} ausgeblendet)", // NEEDS QC
	"({NUMBER} lines from {USER} hidden)": "({NUMBER} Zeilen von {USER} ausgeblendet)", // NEEDS QC
	"{USER} invited you to join the room \"{ROOM}\"": "{USER} hat dich in den Raum „{ROOM}“ eingeladen", // NEEDS QC
	"[Join {ROOM}]": "{ROOM} beitreten", // NEEDS QC
	"Chat log": "Chatverlauf", // NEEDS QC

	// TRANSLATORS: tournaments
	"Please respond to the tournament within {SECONDS} seconds or you may be automatically disqualified.": "Bitte reagiere innerhalb von {SECONDS} Sekunden auf das Turnier, sonst wirst du möglicherweise automatisch disqualifiziert.", // NEEDS QC
	"Single Elimination": "Einzel-K.-o.", // NEEDS QC
	"Double Elimination": "Doppel-K.-o.", // NEEDS QC
	"Round Robin": "Jeder gegen jeden", // NEEDS QC
	"Double Round Robin": "Jeder gegen jeden (doppelt)", // NEEDS QC
	"{JOINS} joined the tournament": "Dem Turnier beigetreten: {JOINS}", // NEEDS QC
	"{LEAVES} left the tournament": "Das Turnier verlassen: {LEAVES}", // NEEDS QC
	// TRANSLATORS: sentence terminator for messages like the above
	"{SENTENCE}.": "{SENTENCE}.", // NEEDS QC
	"{FORMAT} {TYPE} tournament": "{FORMAT} {TYPE}-Turnier", // NEEDS QC
	"No tournaments are currently running.": "Derzeit laufen keine Turniere.", // NEEDS QC
	"(started)": "(gestartet)", // NEEDS QC
	"{TOURNAMENT} created.": "{TOURNAMENT} erstellt.", // NEEDS QC
	"{TOURNAMENT} created (and hidden).": "{TOURNAMENT} erstellt (und ausgeblendet).", // NEEDS QC
	"Tournament created": "Turnier erstellt", // NEEDS QC
	// TRANSLATORS: label, as in "Room: lobby"
	"Room": "Raum", // NEEDS QC
	"Type": "Typ", // NEEDS QC
	"{USER} has joined the tournament, replacing {OLDUSER}.": "{USER} ist dem Turnier beigetreten und ersetzt {OLDUSER}.", // NEEDS QC
	"({NUMBER} players)": "({NUMBER} Spieler)", // NEEDS QC
	"The tournament has started!": "Das Turnier hat begonnen!", // NEEDS QC
	"{USER} has been disqualified from the tournament.": "{USER} wurde vom Turnier disqualifiziert.", // NEEDS QC
	"The tournament's automatic disqualify timer has been turned off.": "Der automatische Disqualifikations-Timer des Turniers wurde ausgeschaltet.", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minute.": "Der automatische Disqualifikations-Timer des Turniers wurde auf {NUMBER} Minute gesetzt.", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minutes.": "Der automatische Disqualifikations-Timer des Turniers wurde auf {NUMBER} Minuten gesetzt.", // NEEDS QC
	"Tournament automatic disqualification warning": "Warnung vor automatischer Turnier-Disqualifikation", // NEEDS QC
	"Time": "Zeit", // NEEDS QC
	"{NUMBER} sec": "{NUMBER} Sek.", // NEEDS QC
	"The tournament's automatic start is now off.": "Der automatische Start des Turniers ist jetzt aus.", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minute.": "Das Turnier startet automatisch in {NUMBER} Minute.", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minutes.": "Das Turnier startet automatisch in {NUMBER} Minuten.", // NEEDS QC
	"Scouting is now allowed (Tournament players can watch other tournament battles)": "Scouting ist jetzt erlaubt (Turnierspieler können andere Turnierkämpfe anschauen)", // NEEDS QC
	"Scouting is now banned (Tournament players can't watch other tournament battles)": "Scouting ist jetzt verboten (Turnierspieler können keine anderen Turnierkämpfe anschauen)", // NEEDS QC
	"Tournament challenges available": "Turnier-Herausforderungen verfügbar", // NEEDS QC
	"Tournament challenge from {PLAYER}": "Turnier-Herausforderung von {PLAYER}", // NEEDS QC
	"Tournament battle between {PLAYER1} and {PLAYER2} started.": "Turnierkampf zwischen {PLAYER1} und {PLAYER2} gestartet.", // NEEDS QC
	"{PLAYER1} has won the match {SCORE} against {PLAYER2}": "{PLAYER1} hat den Kampf {SCORE} gegen {PLAYER2} gewonnen", // NEEDS QC
	"{PLAYER1} has lost the match {SCORE} against {PLAYER2}": "{PLAYER1} hat den Kampf {SCORE} gegen {PLAYER2} verloren", // NEEDS QC
	"{PLAYER1} has drawn the match {SCORE} against {PLAYER2}": "{PLAYER1} hat den Kampf {SCORE} gegen {PLAYER2} unentschieden beendet", // NEEDS QC
	" but the tournament does not support drawing, so it did not count": ", aber das Turnier unterstützt kein Unentschieden, daher zählt es nicht", // NEEDS QC
	"Congratulations to {WINNERS} for winning the {TOURNAMENT}!": "Herzlichen Glückwunsch an {WINNERS} zum Sieg im {TOURNAMENT}!", // NEEDS QC
	"Runners-up": "Zweitplatzierte", // NEEDS QC
	"Runner-up": "Zweitplatzierter", // NEEDS QC
	"The tournament was forcibly ended.": "Das Turnier wurde zwangsweise beendet.", // NEEDS QC
	"The tournament has already started.": "Das Turnier hat bereits begonnen.", // NEEDS QC
	"The tournament hasn't started yet.": "Das Turnier hat noch nicht begonnen.", // NEEDS QC
	"You are already in the tournament.": "Du bist bereits im Turnier.", // NEEDS QC
	"One of your alts is already in the tournament.": "Einer deiner Alt-Accounts ist bereits im Turnier.", // NEEDS QC
	"You aren't in the tournament.": "Du bist nicht im Turnier.", // NEEDS QC
	"This user isn't in the tournament.": "Dieser Benutzer ist nicht im Turnier.", // NEEDS QC
	"There aren't enough users.": "Es gibt nicht genug Benutzer.", // NEEDS QC
	"That isn't a valid timeout value.": "Das ist kein gültiger Timeout-Wert.", // NEEDS QC
	"That isn't a valid tournament matchup.": "Das ist keine gültige Turnierpaarung.", // NEEDS QC
	"You must have a name in order to join the tournament.": "Du brauchst einen Namen, um dem Turnier beizutreten.", // NEEDS QC
	"The tournament is already at maximum capacity for users.": "Das Turnier hat bereits die maximale Teilnehmerzahl erreicht.", // NEEDS QC
	"You have already been disqualified.": "Du wurdest bereits disqualifiziert.", // NEEDS QC
	"This user has already been disqualified.": "Dieser Benutzer wurde bereits disqualifiziert.", // NEEDS QC
	"You are banned from entering tournaments.": "Du bist von Turnieren ausgeschlossen.", // NEEDS QC
	"Unknown error: {ERROR}": "Unbekannter Fehler: {ERROR}", // NEEDS QC
	"Waiting for battles to become available...": "Warte darauf, dass Kämpfe verfügbar werden...", // NEEDS QC
	"vs. {PLAYER}": "vs. {PLAYER}", // NEEDS QC
	"Or wait for {PLAYERS} to challenge you.": "Oder warte, bis {PLAYERS} dich herausfordert.", // NEEDS QC
	"Waiting for {PLAYERS} to challenge you.": "Warte darauf, dass {PLAYERS} dich herausfordert.", // NEEDS QC
	"Waiting for {PLAYER}...": "Warte auf {PLAYER}...", // NEEDS QC
	"Unavailable": "Nicht verfügbar", // NEEDS QC
	"Waiting": "Wartet", // NEEDS QC
	"Challenging": "Fordert heraus", // NEEDS QC

	// TRANSLATORS: command errors
	"This player does not exist or is not online.": "Dieser Spieler existiert nicht oder ist nicht online.", // NEEDS QC
	"This command can only be used in proper chat rooms.": "Dieser Befehl kann nur in richtigen Chaträumen verwendet werden.", // NEEDS QC
	"Error: corrupted ranking data": "Fehler: beschädigte Ranglisten-Daten", // NEEDS QC
	"You are not in a battle": "Du bist in keinem Kampf", // NEEDS QC
	"Invalid turn number: {NUMBER}": "Ungültige Rundennummer: {NUMBER}", // NEEDS QC
	"Turn navigation is disabled in hardcore mode.": "Die Rundennavigation ist im Hardcore-Modus deaktiviert.", // NEEDS QC
	"You are not a player in this battle": "Du bist kein Spieler in diesem Kampf", // NEEDS QC
	"Can only be used in a DM.": "Kann nur in einer DM verwendet werden.", // NEEDS QC
	"Please wait 5 seconds before challenging again.": "Bitte warte 5 Sekunden, bevor du erneut herausforderst.", // NEEDS QC

	// #endregion Chat

	// #region Teambuilder
	// ==================================================================

	// TRANSLATORS: This is for the Teams list view so it can't be singular
	// TRANSLATORS: Should be something like "Teams List" if you have no singular
	// TRANSLATORS: Can be different from TL.term.teams, which "Teams" as in "plural of Team"
	"Teams": "Teams", // NEEDS QC
	"[New team]": "Neues Team", // NEEDS QC
	"[New team in folder]": "Neues Team im Ordner", // NEEDS QC
	"[New {FORMAT} team]": "Neues {FORMAT}-Team", // NEEDS QC
	"[New box]": "Neue Box", // NEEDS QC
	// TRANSLATORS: When deleting a folder, button to add folder name to all teams in it
	"[Convert to prefix]": "Ordnernamen voranstellen", // NEEDS QC
	"[(add folder)]": "(Ordner hinzufügen)", // NEEDS QC
	"[(add format folder)]": "(Formatordner hinzufügen)", // NEEDS QC
	"Names can't contain slashes, since they're used as a folder separator.": "Namen dürfen keine Schrägstriche enthalten, da sie als Ordnertrenner dienen.", // NEEDS QC
	"Names can't contain the character |, since they're used for storing teams.": "Namen dürfen das Zeichen | nicht enthalten, da es zum Speichern von Teams dient.", // NEEDS QC
	"New name required": "Neuer Name erforderlich", // NEEDS QC
	"Not in a folder": "Nicht in einem Ordner", // NEEDS QC
	"Teams not in any folders": "Teams ohne Ordner", // NEEDS QC
	"All teams": "Alle Teams", // NEEDS QC
	"Folders": "Ordner", // NEEDS QC

	// TRANSLATORS: for Clipboard actions
	"Copied!": "Kopiert!", // NEEDS QC
	"[Paste copy here]": "Kopie hier einfügen", // NEEDS QC
	"[Add to clipboard]": "Zur Zwischenablage hinzufügen", // NEEDS QC
	"[Copy/Move]": "Kopieren/Verschieben", // NEEDS QC
	"[+ Clipboard]": "+ Zwischenablage", // NEEDS QC
	"[Deselect]": "Abwählen", // NEEDS QC
	"[Move here]": "Hierher verschieben", // NEEDS QC

	// TRANSLATORS: for Import/Export
	"[Backup]": "Backup", // NEEDS QC
	"[Backup search results]": "Suchergebnisse sichern", // NEEDS QC
	"[Backup folder]": "Ordner sichern", // NEEDS QC
	"Import/Export": "Import/Export", // NEEDS QC
	"[Import/Export]": "Import/Export", // NEEDS QC
	"[Import]": "Importieren", // NEEDS QC
	"(can't save partial exports)": "(Teilansicht kann nicht gespeichert werden)", // NEEDS QC

	// TRANSLATORS: for uploaded teams
	"Account": "Account", // NEEDS QC
	"Account (public)": "Account (öffentlich)", // NEEDS QC
	"Local": "Lokal", // NEEDS QC
	"Uploaded": "Hochgeladen", // NEEDS QC
	"[Upload for shareable URL]": "Hochladen für teilbare URL", // NEEDS QC
	"[Upload for shareable/searchable URL]": "Hochladen für teilbare/suchbare URL", // NEEDS QC
	"Disconnected (wrong account?)": "Verbindung getrennt (falscher Account?)", // NEEDS QC
	"[Revert to uploaded version]": "Auf hochgeladene Version zurücksetzen", // NEEDS QC
	"[Compare]": "Vergleichen", // NEEDS QC
	"[Upload changes]": "Änderungen hochladen", // NEEDS QC
	"Team was deleted": "Das Team wurde gelöscht", // NEEDS QC
	"Team doesn't exist": "Team existiert nicht", // NEEDS QC
	"Untitled team": "Unbenanntes Team", // NEEDS QC
	"Uploaded by": "Hochgeladen von", // NEEDS QC
	"Views": "Aufrufe", // NEEDS QC
	"Team deleted": "Team gelöscht", // NEEDS QC
	"Not found": "Nicht gefunden", // NEEDS QC

	// TRANSLATORS: for the team editor
	"[Add Pokémon]": "Pokémon hinzufügen", // NEEDS QC
	"(choose ability)": null, // NEEDS TRANSLATION
	"Details": "Details", // NEEDS QC
	// TRANSLATORS: Teambuilder "form" with text boxes inside, not form/forme "form" of a pokemon
	"Form": "Formular", // NEEDS QC
	"Tera": "Tera", // NEEDS QC
	// TRANSLATORS: These two are for Hidden Power type
	// TRANSLATORS: They're both designed to take up very little width, so keep that in mind
	"H.P.": "KR", // NEEDS QC
	"H. Power": "Kraftres.", // NEEDS QC
	"Defensive coverage": "Defensive Abdeckung", // NEEDS QC
	"Teambuilding resources for {FORMAT}": "Teambuilding-Ressourcen für {FORMAT}", // NEEDS QC
	"[See all]": "Alle anzeigen", // NEEDS QC
	"Search species or filter by type, learnable moves, ability, tier, or egg group": "Pokémon suchen oder nach Typ, erlernbaren Attacken, Fähigkeit, Tier oder Ei-Gruppe filtern", // NEEDS QC
	"Search abilities": "Fähigkeiten suchen", // NEEDS QC
	"Search items": "Items suchen", // NEEDS QC
	"Search moves or filter by type or category": "Attacken suchen oder nach Typ oder Kategorie filtern", // NEEDS QC
	"Sample sets": "Beispiel-Sets", // NEEDS QC
	"Box sets": "Box-Sets", // NEEDS QC
	"Guessed spread": "Geschätzte Verteilung", // NEEDS QC
	"(Please choose 4 moves to get a guessed spread)": "(Wähle 4 Attacken, um eine geschätzte Verteilung zu erhalten)", // NEEDS QC
	"Protip": "Profitipp", // NEEDS QC
	"Use a different nature to save {NUMBER} EVs:": "Mit einem anderen Wesen sparst du {NUMBER} EV:", // NEEDS QC
	"Use a different nature to get higher stats:": "Mit einem anderen Wesen erhältst du höhere Statuswerte:", // NEEDS QC
	"Natures cannot raise or lower HP.": "Wesen können KP weder erhöhen noch senken.", // NEEDS QC
	// TRANSLATORS: {STATCHANGES} is +stat/-stat
	"{STATCHANGES} nature": "{STATCHANGES}-Wesen", // NEEDS QC
	// TRANSLATORS: {1} and {2} are the + and - keyboard keys
	"You can also set natures by typing {1} and {2} in the EV box.": "Du kannst Wesen auch setzen, indem du {1} und {2} in das EV-Feld eintippst.", // NEEDS QC
	"Pasted team": "Eingefügtes Team", // NEEDS QC
	"Zoom out forms": "Formulare verkleinern", // NEEDS QC
	"Compact": "Kompakt", // NEEDS QC
	"Comfortable": "Komfortabel", // NEEDS QC
	"Zoom out search results": "Suchergebnisse verkleinern", // NEEDS QC
	"Fetching Paste...": "Paste wird geladen...", // NEEDS QC
	"Import/Export set": "Set importieren/exportieren", // NEEDS QC
	"IV spreads": "IV-Verteilungen", // NEEDS QC
	"min Atk": "min. Angriff", // NEEDS QC
	"min Atk, min Spe": "min. Angriff, min. Init.", // NEEDS QC
	"max all": "alle max.", // NEEDS QC
	"min Spe": "min. Init.", // NEEDS QC
	"Hidden Power {TYPE} IVs": "IVs für Kraftreserve {TYPE}", // NEEDS QC
	"EVs, IVs, and nature": "EVs, IVs und Wesen", // NEEDS QC
	"Base": "Basis", // NEEDS QC
	"Remaining": "Übrig", // NEEDS QC

	// TRANSLATORS: errors
	"You must select a format first.": "Du musst zuerst ein Format auswählen.", // NEEDS QC
	"This team is for a different account. Please log into the correct account to update it.": "Dieses Team gehört zu einem anderen Account. Bitte logge dich mit dem richtigen Account ein, um es zu aktualisieren.", // NEEDS QC
	"Add a Pokémon to your team before uploading it.": "Füge deinem Team ein Pokémon hinzu, bevor du es hochlädst.", // NEEDS QC
	"Must use on an uploaded team.": "Nur bei einem hochgeladenen Team möglich.", // NEEDS QC
	"Team not found: {INPUT}": "Team nicht gefunden: {INPUT}", // NEEDS QC
	"Your file \"{FILENAME}\" is not a valid team.": "Deine Datei „{FILENAME}“ ist kein gültiges Team.", // NEEDS QC

	// #endregion Teambuilder

	// #region Ladder
	// ==================================================================

	"[All formats]": "Alle Formate", // NEEDS QC
	"[How the ladder works]": "So funktioniert die Rangliste", // NEEDS QC
	"[Seasonal rankings]": "Saison-Rangliste", // NEEDS QC
	"[Look up a specific user's rating]": "Wertung eines bestimmten Benutzers nachschlagen", // NEEDS QC
	"Name": "Name", // NEEDS QC
	"Elo rating": "Elo-Wertung", // NEEDS QC
	"user's percentage chance of winning a random battle (Glicko X-Act Estimate)": "geschätzte Gewinnchance in einem zufälligen Kampf (Glicko-X-Act-Schätzung)", // NEEDS QC
	"Glicko-1 rating system: rating±deviation (provisional if deviation>100)": "Glicko-1-Wertungssystem: Wertung±Abweichung (vorläufig bei Abweichung>100)", // NEEDS QC
	"No one has played any ranked games yet.": "Noch niemand hat Ranglistenspiele gespielt.", // NEEDS QC

	// #endregion Ladder

	// #region Misc rooms
	// ==================================================================

	"[Join the Help room for live help]": "Im Help-Raum live Hilfe erhalten", // NEEDS QC
	"Unrecognized command: {INPUT}": "Unbekannter Befehl: {INPUT}", // NEEDS QC

	// #endregion Misc rooms
};
