// Remember, comments starting with "TRANSLATORS:" are from Showdown,
// and are shared between all translations. But other comments can be
// used as notes to yourself or other translators, and are specific
// to the Italian translation.

import type { UIText } from '../build-tools/translations.mts';
export const translations: UIText = {
	// #region Navigation
	// ==================================================================

	// TRANSLATORS: Note that "Home" and "Main Menu" refer to the same place
	// TRANSLATORS: So it's fine if they're the same word in your language
	// "Home" is standard Italian web usage; "Pagina iniziale" would be stilted
	"Home": "Home", // NEEDS QC
	// TRANSLATORS: This is used as a "Back to Home" button after battles
	"[Main menu]": "Menu principale", // NEEDS QC
	// TRANSLATORS: It's fine if "Teambuilder" and "Teams" are the same word in your language
	// TRANSLATORS: Also consider something like "Edit teams" for "Teambuilder"
	"Teambuilder": "Editor di squadre", // NEEDS QC
	"Ladder": "Classifica", // NEEDS QC
	"Tournaments": "Tornei", // NEEDS QC
	"Friends": "Amici", // NEEDS QC
	"Chat rooms": "Stanze di chat", // NEEDS QC
	// "Lotta" is the official Italian term for a battle
	"Battles": "Lotte", // NEEDS QC
	"News": "Notizie", // NEEDS QC
	"Offline": "Offline", // NEEDS QC
	"[Join chat]": "Entra in chat", // NEEDS QC
	"[All tabs]": "Tutte le schede", // NEEDS QC
	"[Menu]": "Menu", // NEEDS QC

	// #endregion Navigation

	// #region Generic UI
	// ==================================================================

	"[Hide]": "Nascondi", // NEEDS QC
	"[Close]": "Chiudi", // NEEDS QC
	"[Done]": "Fatto", // NEEDS QC
	"[Back]": "Indietro", // NEEDS QC
	// TRANSLATORS: A computer copy command, like Ctrl+C
	"[Copy]": "Copia", // NEEDS QC
	"[Edit]": "Modifica", // NEEDS QC
	"[Delete]": "Elimina", // NEEDS QC
	"[Undo delete]": "Annulla eliminazione", // NEEDS QC
	// TRANSLATORS: "DM" is used to label DMs; "[Chat]" is the button to send a DM
	// TRANSLATORS: Feel free to use the same word for both (and for "Chat" in the Battle section)
	// "MP" = messaggio privato, the traditional Italian forum term;
	// "DM" is also widely understood now
	"DM": "MP", // NEEDS QC
	"[Chat]": "Chatta", // NEEDS QC
	"[OK]": "OK", // NEEDS QC
	"[Cancel]": "Annulla", // NEEDS QC
	"[Accept]": "Accetta", // NEEDS QC
	"[Reject]": "Rifiuta", // NEEDS QC
	"Random team": "Squadra casuale", // NEEDS QC
	"[Sound]": "Audio", // NEEDS QC
	"[Options]": "Impostazioni", // NEEDS QC
	"[Battle options]": "Impostazioni di lotta", // NEEDS QC
	"[Revert]": "Ripristina", // NEEDS QC
	"[Refresh]": "Aggiorna", // NEEDS QC
	"[Search]": "Cerca", // NEEDS QC
	"[Validate]": "Verifica", // NEEDS QC
	"[Reconnect]": "Riconnetti", // NEEDS QC
	"Disconnected": "Disconnesso", // NEEDS QC
	"Connecting...": "Connessione...", // NEEDS QC
	"Loading...": "Caricamento...", // NEEDS QC
	"Uploading...": "Invio...", // NEEDS QC
	"[Change]": "Cambia", // NEEDS QC
	"[Add]": "Aggiungi", // NEEDS QC
	"[Look up]": "Cerca", // NEEDS QC
	"[Save changes]": "Salva", // NEEDS QC
	"[Create]": "Crea", // NEEDS QC
	"[Rename]": "Rinomina", // NEEDS QC
	"[Remove]": "Rimuovi", // NEEDS QC
	// TRANSLATORS: intentionally chosen to be very short. do not go longer than three letters for this one
	"Gen {NUMBER}": "Gen {NUMBER}", // NEEDS QC
	"[Maximize]": "Ingrandisci", // NEEDS QC
	"[Expand/collapse]": "Espandi/comprimi", // NEEDS QC

	// TRANSLATORS: connection/team-storage errors
	"Sorry, psim connections are unsupported by your browser.": "Il tuo browser non supporta le connessioni psim.", // NEEDS QC
	"Your browser doesn't support third-party cookies. Some things might not work correctly.": "Il tuo browser non supporta i cookie di terze parti. Alcune cose potrebbero non funzionare correttamente.", // NEEDS QC
	"Your team storage format is too old for PS. You'll need to upgrade it at {URL}": "Il formato di salvataggio delle tue squadre è troppo vecchio per PS. Devi aggiornarlo su {URL}", // NEEDS QC
	"Error loading uploaded teams: {ERROR}": "Errore nel caricamento delle squadre caricate: {ERROR}", // NEEDS QC
	"Error unknown. Try again later.": "Errore sconosciuto. Riprova più tardi.", // NEEDS QC
	"Failed to load team: {ERROR}": "Impossibile caricare la squadra: {ERROR}", // NEEDS QC
	"Error logging in.": "Errore di accesso.", // NEEDS QC
	"Something is interfering with our connection to the login server. Most likely, your internet provider needs you to re-log-in, or your internet provider is blocking Pokémon Showdown.": "Qualcosa interferisce con la connessione al server di accesso. Probabilmente il tuo provider richiede un nuovo accesso, oppure sta bloccando Pokémon Showdown.", // NEEDS QC

	// TRANSLATORS: for constructing lists
	"{FIRST} or {SECOND}": "{FIRST} o {SECOND}", // NEEDS QC
	"{FIRST} and {SECOND}": "{FIRST} e {SECOND}", // NEEDS QC
	", {NEXT}": ", {NEXT}", // NEEDS QC
	", or {LAST}": " o {LAST}", // NEEDS QC
	", and {LAST}": " e {LAST}", // NEEDS QC
	// TRANSLATORS: this is for lists of users specifically
	// TRANSLATORS: (languages with counters should use the "person" counter)
	", and {NUMBER} others": " e altri {NUMBER}", // NEEDS QC

	// #endregion Generic UI

	// #region Popups
	// ==================================================================

	// TRANSLATORS: user popup
	// TRANSLATORS: "Global {RANK}" is a rank, like "Global Moderator"
	"Global {RANK}": "{RANK} globale", // NEEDS QC
	"Chatrooms": "Stanze", // NEEDS QC
	"Private rooms": "Stanze private", // NEEDS QC
	"OFFLINE": "OFFLINE", // NEEDS QC
	"Username": "Nome utente", // NEEDS QC
	"[Register]": "Registrati", // NEEDS QC
	"[Add status]": "Aggiungi stato", // NEEDS QC
	"[Chat self]": "Chatta con te stesso", // NEEDS QC
	"[Change name]": "Cambia nome", // NEEDS QC
	"[Log out]": "Esci", // NEEDS QC
	"[Add friend]": "Aggiungi amico", // NEEDS QC
	"[Unignore]": "Non ignorare più", // NEEDS QC
	"[Ignore]": "Ignora", // NEEDS QC
	"[Report]": "Segnala", // NEEDS QC
	"[Mute]": "Silenzia", // NEEDS QC
	"[7m]": "7 min", // NEEDS QC
	"[Hourmute]": "Silenzia 1 ora", // NEEDS QC
	"[1h]": "1 h", // NEEDS QC
	"[Ban]": "Banna", // NEEDS QC
	"[2d]": "2 g", // NEEDS QC
	"[Weekban]": "Banna 1 settimana", // NEEDS QC
	"[1w]": "1 sett.", // NEEDS QC
	"[Modlog]": "Log moderazione", // NEEDS QC
	// TRANSLATORS: Showdown term for a global mute
	"[Lock]": "Blocca", // NEEDS QC
	"[Weeklock]": "Blocca 1 settimana", // NEEDS QC
	"[Namelock]": "Blocca nome", // NEEDS QC
	"[Global modlog]": "Log moderazione globale", // NEEDS QC
	"[Avatar...]": "Avatar...", // NEEDS QC
	"[Close room]": "Chiudi stanza", // NEEDS QC
	"[Report a user]": "Segnala un utente", // NEEDS QC
	"({NUMBER} sec)": "({NUMBER} s)", // NEEDS QC
	"Room not found": "Stanza non trovata", // NEEDS QC

	// TRANSLATORS: battle options
	"Side-by-side, controls below": "Affiancato, comandi sotto", // NEEDS QC
	"Side-by-side, overlay controls": "Affiancato, comandi sovrapposti", // NEEDS QC
	"Top-and-bottom, controls below": "Impilato, comandi sotto", // NEEDS QC
	"Top-and-bottom, overlay controls": "Impilato, comandi sovrapposti", // NEEDS QC
	"Scrolling, controls below": "Scorrimento, comandi sotto", // NEEDS QC
	"Scrolling, overlay controls": "Scorrimento, comandi sovrapposti", // NEEDS QC
	"Hardcore mode ON: Information not available in-game is now hidden.": "Modalità hardcore ON: le informazioni non disponibili nel gioco ora sono nascoste.", // NEEDS QC
	"Hardcore mode OFF: Information not available in-game is now shown.": "Modalità hardcore OFF: le informazioni non disponibili nel gioco ora sono visibili.", // NEEDS QC
	"Spectators ignored.": "Spettatori ignorati.", // NEEDS QC
	"Spectators no longer ignored.": "Gli spettatori non sono più ignorati.", // NEEDS QC
	"In this battle": "In questa lotta", // NEEDS QC
	"Hardcore mode (hide info not shown in-game)": "Modalità hardcore (nasconde le info non visibili nel gioco)", // NEEDS QC
	"Ignore spectators": "Ignora gli spettatori", // NEEDS QC
	"Ignore opponent": "Ignora l'avversario", // NEEDS QC
	"Ignore nicknames": "Ignora i soprannomi", // NEEDS QC
	"All battles": "Tutte le lotte", // NEEDS QC
	"Layout": "Disposizione", // NEEDS QC
	"Automatic ({SETTING})": "Automatica ({SETTING})", // NEEDS QC
	"Automatic": "Automatica", // NEEDS QC
	"(DESKTOP)": "(DESKTOP)", // NEEDS QC
	"(MOBILE VERTICAL)": "(MOBILE VERTICALE)", // NEEDS QC
	"(MOBILE HORIZONTAL)": "(MOBILE ORIZZONTALE)", // NEEDS QC
	"You can still invite spectators by giving them the URL or using the /invite command": "Puoi comunque invitare spettatori dando loro l'URL o con il comando /invite", // NEEDS QC
	"Invite only (hide from Battles list)": "Solo su invito (nascondi dalla lista delle lotte)", // NEEDS QC
	"Ignore Pokémon nicknames": "Ignora i soprannomi dei Pokémon", // NEEDS QC
	"Automatically start timer": "Avvia automaticamente il timer", // NEEDS QC
	"Hardcore mode": "Modalità hardcore", // NEEDS QC
	"Start at turn 0 when spectating battles": "Parti dal turno 0 quando guardi una lotta", // NEEDS QC
	"Open new battles in the right-side panel": "Apri le nuove lotte nel pannello di destra", // NEEDS QC

	// TRANSLATORS: options
	"General": "Generale", // NEEDS QC
	"Language": "Lingua", // NEEDS QC
	"Appearance": "Aspetto", // NEEDS QC
	"Theme": "Tema", // NEEDS QC
	"Light": "Chiaro", // NEEDS QC
	"Dark": "Scuro", // NEEDS QC
	"Match system theme": "Segui il tema di sistema", // NEEDS QC
	"Two panels (if wide enough)": "Due pannelli (se c'è spazio)", // NEEDS QC
	"Single panel": "Pannello singolo", // NEEDS QC
	"Vertical tabs": "Schede verticali", // NEEDS QC
	"Background": "Sfondo", // NEEDS QC
	"Disable animations": "Disattiva le animazioni", // NEEDS QC
	"Use 2D sprites instead of 3D models": "Usa gli sprite 2D invece dei modelli 3D", // NEEDS QC
	"Use modern sprites for past generations": "Usa gli sprite moderni per le generazioni passate", // NEEDS QC
	"Block DMs": "Blocca gli MP", // NEEDS QC
	"Block challenges": "Blocca le sfide", // NEEDS QC
	"Show DMs in chatrooms": "Mostra gli MP nelle stanze", // NEEDS QC
	"Do not highlight when your name is said in chat": "Non evidenziare quando il tuo nome è menzionato in chat", // NEEDS QC
	"Confirm before leaving a room": "Chiedi conferma prima di uscire da una stanza", // NEEDS QC
	"Confirm before refreshing": "Chiedi conferma prima di aggiornare", // NEEDS QC
	"Always notify": "Notifica sempre", // NEEDS QC
	"Notify when joined": "Notifica se iscritto", // NEEDS QC
	"Hide": "Nascondi", // NEEDS QC
	"Timestamps": "Timestamp", // NEEDS QC
	"Off": "Disattivato", // NEEDS QC
	"Timestamps in DMs": "Timestamp negli MP", // NEEDS QC
	"Chat preferences": "Preferenze della chat", // NEEDS QC
	"[Change background]": "Cambia sfondo", // NEEDS QC
	"[Text formatting...]": "Formattazione testo...", // NEEDS QC
	"[Set as background]": "Imposta come sfondo", // NEEDS QC
	"[Random]": "Casuale", // NEEDS QC

	// TRANSLATORS: team chooser
	"(uncategorized)": "(senza categoria)", // NEEDS QC
	"(all)": "(tutte)", // NEEDS QC
	"[Other gens]": "Altre generazioni", // NEEDS QC
	"Select a team": "Scegli una squadra", // NEEDS QC
	"This team selector is no longer available (the challenge was cancelled or something).": "Questo selettore di squadre non è più disponibile (la sfida è stata annullata o qualcosa del genere).", // NEEDS QC
	"No teams found": "Nessuna squadra trovata", // NEEDS QC
	"This format selector is no longer available.": "Questo selettore di formati non è più disponibile.", // NEEDS QC
	"Search formats": "Cerca formati", // NEEDS QC

	// TRANSLATORS: login
	"[Choose name]": "Scegli nome", // NEEDS QC
	"Logging in...": "Accesso...", // NEEDS QC
	"[Log in]": "Accedi", // NEEDS QC
	"[Try another name]": "Prova un altro nome", // NEEDS QC
	"[Password...]": "Password...", // NEEDS QC
	"[Change password]": "Cambia password", // NEEDS QC
	"[Show password]": "Mostra la password", // NEEDS QC
	"Loading Google log-in button...": "Caricamento del pulsante di accesso Google...", // NEEDS QC
	"(color)": "(colore)", // NEEDS QC
	"(Others will be able to see your name change. To change name privately, use \"Log out\")": "(Gli altri vedranno il tuo cambio di nome. Per cambiarlo in privato, usa \"Esci\")", // NEEDS QC
	"if you registered this name:": "se hai registrato questo nome:", // NEEDS QC
	"if not:": "altrimenti:", // NEEDS QC
	"This is someone else's account. Sorry.": "Questo account appartiene a qualcun altro. Ci dispiace.", // NEEDS QC
	"Password": "Password", // NEEDS QC

	// TRANSLATORS: register / change password
	"All fields are required": "Tutti i campi sono obbligatori", // NEEDS QC
	"Passwords do not match": "Le password non coincidono", // NEEDS QC
	"Your password was successfully changed!": "La password è stata cambiata!", // NEEDS QC
	"Change your password:": "Cambia la tua password:", // NEEDS QC
	"Old password": "Vecchia password", // NEEDS QC
	"New password": "Nuova password", // NEEDS QC
	"New password (confirm)": "Nuova password (conferma)", // NEEDS QC
	"You have been successfully registered.": "La registrazione è avvenuta con successo.", // NEEDS QC
	"Register your account:": "Registra il tuo account:", // NEEDS QC
	"Password (confirm)": "Password (conferma)", // NEEDS QC
	"An Electric-type mouse that is the mascot of the Pokémon franchise.": "Un topo di tipo Elettro, mascotte del franchise Pokémon.", // NEEDS QC
	"What is this Pokémon?": "Che Pokémon è?", // NEEDS QC

	// #endregion Popups

	// #region Main Menu
	// ==================================================================

	// TRANSLATORS: Our famous ladder queue button. Give it some flair :)
	// TRANSLATORS: Might we suggest "Showdown!"
	// conveniently also the official games' "Fight" button
	"[Battle!]": "Combatti!", // NEEDS QC
	"Find a random opponent": "Trova un avversario casuale", // NEEDS QC
	"Watch a battle": "Guarda una lotta", // NEEDS QC
	"Find a user": "Cerca un utente", // NEEDS QC
	"Info & Resources": "Info e risorse", // NEEDS QC
	"Lobby chat": "Chat della lobby", // NEEDS QC

	// TRANSLATORS: Challenge/Search UI
	"[Challenge]": "Sfida", // NEEDS QC
	"Custom rules": "Regole personalizzate", // NEEDS QC
	// TRANSLATORS: Search countdown. {NUMBER} = a number of seconds
	// TRANSLATORS: English doesn't include the unit (seconds) but your language can
	"Searching in {NUMBER}...": "Ricerca tra {NUMBER} s...", // NEEDS QC
	"Searching...": "Ricerca avversario...", // NEEDS QC
	"Pokédex": "Pokédex", // NEEDS QC
	"Replays": "Replay", // NEEDS QC
	"Forum": "Forum", // NEEDS QC
	"Rules": "Regole", // NEEDS QC
	"Credits": "Crediti", // NEEDS QC
	"Privacy": "Privacy", // NEEDS QC
	"background by {ARTIST}": "sfondo di {ARTIST}", // NEEDS QC

	// TRANSLATORS: errors
	"Wait for this countdown to finish first...": "Aspetta prima che finisca il conto alla rovescia...", // NEEDS QC
	"You're already searching for a {FORMAT} battle...": "Stai già cercando una lotta {FORMAT}...", // NEEDS QC
	"You need to go into the Teambuilder and build a team for this format.": "Devi andare nel Teambuilder e creare una squadra per questo formato.", // NEEDS QC

	// #endregion Main Menu

	// #region Rooms
	// ==================================================================

	// TRANSLATORS: these go under the user/battle counts, and in English they read as "100 users online"
	// TRANSLATORS: but they don't have to work that way in your language
	"users online": "utenti online", // NEEDS QC
	"active battles": "lotte in corso", // NEEDS QC
	"Find an online user": "Trova un utente online", // NEEDS QC
	"Watch an active battle": "Guarda una lotta in corso", // NEEDS QC
	"Meloetta is PS's mascot! The Aria forme is about using its voice, and represents our chatrooms.": "Meloetta è la mascotte di PS! La Forma Canto usa la sua voce e rappresenta le nostre chat.", // NEEDS QC
	"Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles.": "Meloetta è la mascotte di PS! La Forma Danza è di tipo Lotta e rappresenta le nostre lotte.", // NEEDS QC

	"Official chat rooms": "Stanze di chat ufficiali", // NEEDS QC
	"Hidden rooms": "Stanze nascoste", // NEEDS QC

	"Subrooms": "Sottostanze", // NEEDS QC
	"(All rooms)": "(Tutte le stanze)", // NEEDS QC
	"Join or search for rooms": "Entra o cerca stanze", // NEEDS QC
	"Command": "Comando", // NEEDS QC
	"Console": "Console", // NEEDS QC
	"Enter = run command {INPUT}": "Invio = esegui il comando {INPUT}", // NEEDS QC
	"(Subroom of {ROOM})": "(Sottostanza di {ROOM})", // NEEDS QC
	"Possible secret room": "Possibile stanza segreta", // NEEDS QC
	"(Private room?)": "(Stanza privata?)", // NEEDS QC
	"Search results": "Risultati della ricerca", // NEEDS QC

	// #endregion Rooms

	// #region Battle
	// ==================================================================

	// TRANSLATORS: Note that most translations of battle UI are in the server repository
	// TRANSLATORS: In data/text/[lang]/default.ts and data/text/[lang]/names.ts

	// TRANSLATORS: [Team]/[Battle]/[Switch]/[Shift] are buttons in overlay controls
	// TRANSLATORS: But they're section headers in normal battle controls
	// TRANSLATORS: For the "Use move" menu in battle controls
	// TRANSLATORS: This was "Attack" in older Showdown, "FIGHT" on older cart, and "Battle" on modern cart
	// SV battle menu: Lotta
	"[Battle]": "Lotta", // NEEDS QC
	// TRANSLATORS: For the "Switch" menu in battle controls
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Switch]": "Cambia", // NEEDS QC
	// TRANSLATORS: For the Team Preview menu in battle controls
	// TRANSLATORS: Also replaces "[Switch]" in phases where switching isn't possible
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Team]": "Squadra", // NEEDS QC
	// TRANSLATORS: The Triples "move to center" button
	// TRANSLATORS: This is "SHIFT" on older cart; Triples doesn't exist on modern cart
	// ORAS battle menu (the last games with Triples): Sposta
	"[Shift]": "Sposta", // NEEDS QC

	// TRANSLATORS: Mobile-layout buttons for switching between the battle view and the chat view
	// TRANSLATORS: ("Chat" is also used as a section header in the options popup)
	"Battle": "Lotta", // NEEDS QC
	"Chat": "Chat", // NEEDS QC
	"[Try Fight button]": "Prova il pulsante Lotta", // NEEDS QC
	// TRANSLATORS: For the "where to target this move" menu
	"(empty slot)": "(posto vuoto)", // NEEDS QC
	"Maxed with no max moves": "Nessuna Dynamossa disponibile", // NEEDS QC
	"No Z moves": "Nessuna mossa Z", // NEEDS QC

	"[Rematch]": "Rivincita", // NEEDS QC
	"[Offer tie]": "Proponi pareggio", // NEEDS QC
	// "Resa" (noun) is an alternative if an imperative feels wrong here
	"[Forfeit]": "Abbandona", // NEEDS QC
	"[Forfeit and close]": "Abbandona e chiudi", // NEEDS QC
	"[Replace player]": "Sostituisci giocatore", // NEEDS QC
	"[Replace]": "Sostituisci", // NEEDS QC
	"(turn 100+)": "(dal turno 100)", // NEEDS QC
	"[Stop timer]": "Ferma il timer", // NEEDS QC
	"[Start timer]": "Avvia il timer", // NEEDS QC
	"Enter player's name": "Inserisci il nome del giocatore", // NEEDS QC
	"Cannot replace player, battle has already ended.": "Impossibile sostituire il giocatore, la lotta è già finita.", // NEEDS QC

	// TRANSLATORS: for replay controls
	"[Play]": "Riproduci", // NEEDS QC
	"[Pause]": "Pausa", // NEEDS QC
	"[First turn]": "Primo turno", // NEEDS QC
	"[Prev turn]": "Turno precedente", // NEEDS QC
	"[Skip turn]": "Turno successivo", // NEEDS QC
	"[Skip to end]": "Vai alla fine", // NEEDS QC
	"[Switch viewpoint]": "Cambia punto di vista", // NEEDS QC
	"[Go to turn]": "Vai al turno", // NEEDS QC
	"[Skip]": "Salta", // NEEDS QC
	"[Skip animation]": "Salta animazione", // NEEDS QC
	"[Move to center]": "Spostati al centro", // NEEDS QC
	"[Upload and share replay]": "Carica e condividi il replay", // NEEDS QC
	"[Replay]": "Replay", // NEEDS QC
	"(closes this battle)": "(chiude questa lotta)", // NEEDS QC

	// TRANSLATORS: for the battle list
	"Minimum Elo": "Elo minimo", // NEEDS QC
	"rated {ELO}": "valutazione {ELO}", // NEEDS QC
	// TRANSLATORS: goes between two usernames; the key includes its surrounding spacing so some languages can drop it
	"{PLAYER1} vs. {PLAYER2}": "{PLAYER1} vs {PLAYER2}", // NEEDS QC
	"(All formats)": "(Tutti i formati)", // NEEDS QC
	"Username prefix": "Prefisso del nome utente", // NEEDS QC
	"No battles are going on": "Nessuna lotta in corso", // NEEDS QC
	"{NUMBER} battle": "{NUMBER} lotta", // NEEDS QC
	"{NUMBER} battles": "{NUMBER} lotte", // NEEDS QC
	"None": "Nessuno", // NEEDS QC
	"Timer": "Timer", // NEEDS QC
	"Error": "Errore", // NEEDS QC
	"The battle you're looking for has expired. Battles expire after 15 minutes of inactivity unless they're saved.": "La lotta che cerchi è scaduta. Le lotte scadono dopo 15 minuti di inattività se non vengono salvate.", // NEEDS QC
	"In the future, remember to click \"Save replay\" to save a replay permanently.": "In futuro, ricorda di cliccare \"Salva replay\" per salvare un replay in modo permanente.", // NEEDS QC
	"Unrecognized HTML file: Only replay files are supported.": "File HTML non riconosciuto: sono supportati solo i file replay.", // NEEDS QC
	"You are still in {ROOM}": "Sei ancora in {ROOM}", // NEEDS QC
	"Battle \"{INPUT}\" not found": "Lotta \"{INPUT}\" non trovata", // NEEDS QC
	"Uploaded replay": "Replay caricato", // NEEDS QC
	"Team {PLAYER}": "Squadra {PLAYER}", // NEEDS QC
	"{PLAYER} and friends": "{PLAYER} e amici", // NEEDS QC

	// TRANSLATORS: battle log messages
	"[Earlier messages]": "Messaggi precedenti", // NEEDS QC
	"Register an account to protect your ladder rating!": "Registra un account per proteggere la tua valutazione in classifica!", // NEEDS QC
	"Open team sheet for {PLAYER}": "Apri la scheda della squadra di {PLAYER}", // NEEDS QC
	"Warning": "Avviso", // NEEDS QC
	"Variation": "Variante", // NEEDS QC
	"Rated battle": "Lotta valutata", // NEEDS QC

	// TRANSLATORS: screen reader labels
	"Active Pokémon": "Pokémon attivo", // NEEDS QC
	"Your team": "La tua squadra", // NEEDS QC
	"Opponent's team": "Squadra dell'avversario", // NEEDS QC
	"Statused": "Con problema di stato", // NEEDS QC
	"Non-statused": "Senza problema di stato", // NEEDS QC
	"Unrevealed Illusion user": "Utilizzatore di Illusione non rivelato", // NEEDS QC
	"Not revealed": "Non rivelato", // NEEDS QC
	"Battle controls": "Comandi della lotta", // NEEDS QC

	// #endregion Battle

	// #region Chat
	// ==================================================================

	"{NUMBER} user": "{NUMBER} utente", // NEEDS QC
	"{NUMBER} users": "{NUMBER} utenti", // NEEDS QC
	"[Join]": "Partecipa", // NEEDS QC
	"[Leave]": "Esci", // NEEDS QC
	"[Ready!]": "Pronto!", // NEEDS QC
	"In progress": "In corso", // NEEDS QC
	"Signups": "Iscrizioni", // NEEDS QC
	"[Pop-out]": "Finestra separata", // NEEDS QC
	"[Go]": "Vai", // NEEDS QC
	"[Visit]": "Apri", // NEEDS QC
	"[Choose a name before sending messages]": "Scegli un nome prima di inviare messaggi", // NEEDS QC
	"Challenging...": "Sfida in corso...", // NEEDS QC
	"Accepting...": "Accettazione...", // NEEDS QC
	"[Commands]": "Comandi", // NEEDS QC
	"Mentioned by {USER} in {ROOM}": "{USER} ti ha menzionato in {ROOM}", // NEEDS QC
	"{USERS} joined": "Ingresso di {USERS}", // NEEDS QC
	// TRANSLATORS: separates "X joined" from "Y left"
	"{JOINEDMESSAGE}; {LEFTMESSAGE}": "{JOINEDMESSAGE}; {LEFTMESSAGE}", // NEEDS QC
	"{USERS} left": "Uscita di {USERS}", // NEEDS QC
	"{USER} renamed from {OLDUSER}.": "{OLDUSER} ora si chiama {USER}.", // NEEDS QC
	"(Private to {USER})": "(In privato a {USER})", // NEEDS QC
	"{FORMAT} battle started between {PLAYER1} and {PLAYER2}.": "Lotta {FORMAT} iniziata tra {PLAYER1} e {PLAYER2}.", // NEEDS QC
	// TRANSLATORS: for when the format name already includes "battle"
	"{FORMAT} started between {PLAYER1} and {PLAYER2}.": "{FORMAT} iniziata tra {PLAYER1} e {PLAYER2}.", // NEEDS QC
	// TRANSLATORS: for when the format is unknown
	"Battle started between {PLAYER1} and {PLAYER2}.": "Lotta iniziata tra {PLAYER1} e {PLAYER2}.", // NEEDS QC
	"({NUMBER} line from {USER} hidden)": "({NUMBER} riga di {USER} nascosta)", // NEEDS QC
	"({NUMBER} lines from {USER} hidden)": "({NUMBER} righe di {USER} nascoste)", // NEEDS QC
	"{USER} invited you to join the room \"{ROOM}\"": "{USER} ti ha invitato nella stanza \"{ROOM}\"", // NEEDS QC
	"[Join {ROOM}]": "Entra in {ROOM}", // NEEDS QC
	"Chat log": "Registro della chat", // NEEDS QC

	// TRANSLATORS: tournaments
	"Please respond to the tournament within {SECONDS} seconds or you may be automatically disqualified.": "Rispondi al torneo entro {SECONDS} secondi o potresti essere squalificato automaticamente.", // NEEDS QC
	"Single Elimination": "Eliminazione diretta", // NEEDS QC
	"Double Elimination": "Doppia eliminazione", // NEEDS QC
	"Round Robin": "Girone all'italiana", // NEEDS QC
	"Double Round Robin": "Doppio girone all'italiana", // NEEDS QC
	"{JOINS} joined the tournament": "Iscrizione di {JOINS} al torneo", // NEEDS QC
	"{LEAVES} left the tournament": "Uscita di {LEAVES} dal torneo", // NEEDS QC
	// TRANSLATORS: sentence terminator for messages like the above
	"{SENTENCE}.": "{SENTENCE}.", // NEEDS QC
	"{FORMAT} {TYPE} tournament": "Torneo {FORMAT} {TYPE}", // NEEDS QC
	"No tournaments are currently running.": "Nessun torneo è attualmente in corso.", // NEEDS QC
	"(started)": "(iniziato)", // NEEDS QC
	"{TOURNAMENT} created.": "{TOURNAMENT} creato.", // NEEDS QC
	"{TOURNAMENT} created (and hidden).": "{TOURNAMENT} creato (e nascosto).", // NEEDS QC
	"Tournament created": "Torneo creato", // NEEDS QC
	// TRANSLATORS: label, as in "Room: lobby"
	"Room": "Stanza", // NEEDS QC
	"Type": "Tipo", // NEEDS QC
	"{USER} has joined the tournament, replacing {OLDUSER}.": "{USER} è entrato nel torneo al posto di {OLDUSER}.", // NEEDS QC
	"({NUMBER} players)": "({NUMBER} giocatori)", // NEEDS QC
	"The tournament has started!": "Il torneo è iniziato!", // NEEDS QC
	"{USER} has been disqualified from the tournament.": "{USER} è stato squalificato dal torneo.", // NEEDS QC
	"The tournament's automatic disqualify timer has been turned off.": "Il timer di squalifica automatica del torneo è stato disattivato.", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minute.": "Il timer di squalifica automatica del torneo è stato impostato su {NUMBER} minuto.", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minutes.": "Il timer di squalifica automatica del torneo è stato impostato su {NUMBER} minuti.", // NEEDS QC
	"Tournament automatic disqualification warning": "Avviso di squalifica automatica dal torneo", // NEEDS QC
	"Time": "Tempo", // NEEDS QC
	"{NUMBER} sec": "{NUMBER} s", // NEEDS QC
	"The tournament's automatic start is now off.": "L'avvio automatico del torneo è disattivato.", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minute.": "Il torneo inizierà automaticamente tra {NUMBER} minuto.", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minutes.": "Il torneo inizierà automaticamente tra {NUMBER} minuti.", // NEEDS QC
	"Scouting is now allowed (Tournament players can watch other tournament battles)": "Lo scouting è ora consentito (i giocatori del torneo possono guardare le altre lotte del torneo)", // NEEDS QC
	"Scouting is now banned (Tournament players can't watch other tournament battles)": "Lo scouting è ora vietato (i giocatori del torneo non possono guardare le altre lotte del torneo)", // NEEDS QC
	"Tournament challenges available": "Sfide del torneo disponibili", // NEEDS QC
	"Tournament challenge from {PLAYER}": "Sfida del torneo da {PLAYER}", // NEEDS QC
	"Tournament battle between {PLAYER1} and {PLAYER2} started.": "Lotta del torneo tra {PLAYER1} e {PLAYER2} iniziata.", // NEEDS QC
	"{PLAYER1} has won the match {SCORE} against {PLAYER2}": "{PLAYER1} ha vinto l'incontro {SCORE} contro {PLAYER2}", // NEEDS QC
	"{PLAYER1} has lost the match {SCORE} against {PLAYER2}": "{PLAYER1} ha perso l'incontro {SCORE} contro {PLAYER2}", // NEEDS QC
	"{PLAYER1} has drawn the match {SCORE} against {PLAYER2}": "{PLAYER1} ha pareggiato l'incontro {SCORE} contro {PLAYER2}", // NEEDS QC
	" but the tournament does not support drawing, so it did not count": ", ma il torneo non supporta i pareggi, quindi non conta", // NEEDS QC
	"Congratulations to {WINNERS} for winning the {TOURNAMENT}!": "Congratulazioni a {WINNERS} per aver vinto il {TOURNAMENT}!", // NEEDS QC
	"Runners-up": "Secondi classificati", // NEEDS QC
	"Runner-up": "Secondo classificato", // NEEDS QC
	"The tournament was forcibly ended.": "Il torneo è stato terminato forzatamente.", // NEEDS QC
	"The tournament has already started.": "Il torneo è già iniziato.", // NEEDS QC
	"The tournament hasn't started yet.": "Il torneo non è ancora iniziato.", // NEEDS QC
	"You are already in the tournament.": "Sei già nel torneo.", // NEEDS QC
	"One of your alts is already in the tournament.": "Uno dei tuoi account alternativi è già nel torneo.", // NEEDS QC
	"You aren't in the tournament.": "Non sei nel torneo.", // NEEDS QC
	"This user isn't in the tournament.": "Questo utente non è nel torneo.", // NEEDS QC
	"There aren't enough users.": "Non ci sono abbastanza utenti.", // NEEDS QC
	"That isn't a valid timeout value.": "Non è un valore di timeout valido.", // NEEDS QC
	"That isn't a valid tournament matchup.": "Non è un abbinamento di torneo valido.", // NEEDS QC
	"You must have a name in order to join the tournament.": "Devi avere un nome per entrare nel torneo.", // NEEDS QC
	"The tournament is already at maximum capacity for users.": "Il torneo è già al massimo della capienza.", // NEEDS QC
	"You have already been disqualified.": "Sei già stato squalificato.", // NEEDS QC
	"This user has already been disqualified.": "Questo utente è già stato squalificato.", // NEEDS QC
	"You are banned from entering tournaments.": "Ti è vietato partecipare ai tornei.", // NEEDS QC
	"Unknown error: {ERROR}": "Errore sconosciuto: {ERROR}", // NEEDS QC
	"Waiting for battles to become available...": "In attesa che le lotte diventino disponibili...", // NEEDS QC
	"vs. {PLAYER}": "vs. {PLAYER}", // NEEDS QC
	"Or wait for {PLAYERS} to challenge you.": "Oppure aspetta che {PLAYERS} ti sfidi.", // NEEDS QC
	"Waiting for {PLAYERS} to challenge you.": "In attesa che {PLAYERS} ti sfidi.", // NEEDS QC
	"Waiting for {PLAYER}...": "In attesa di {PLAYER}...", // NEEDS QC
	"Unavailable": "Non disponibile", // NEEDS QC
	"Waiting": "In attesa", // NEEDS QC
	"Challenging": "Sfida in corso", // NEEDS QC

	// TRANSLATORS: command errors
	"This player does not exist or is not online.": "Questo giocatore non esiste o non è online.", // NEEDS QC
	"This command can only be used in proper chat rooms.": "Questo comando può essere usato solo nelle stanze di chat vere e proprie.", // NEEDS QC
	"Error: corrupted ranking data": "Errore: dati di classifica corrotti", // NEEDS QC
	"You are not in a battle": "Non sei in una lotta", // NEEDS QC
	"Invalid turn number: {NUMBER}": "Numero di turno non valido: {NUMBER}", // NEEDS QC
	"Turn navigation is disabled in hardcore mode.": "La navigazione tra i turni è disattivata in modalità hardcore.", // NEEDS QC
	"You are not a player in this battle": "Non sei un giocatore di questa lotta", // NEEDS QC
	"Can only be used in a DM.": "Utilizzabile solo in un MP.", // NEEDS QC
	"Please wait 5 seconds before challenging again.": "Aspetta 5 secondi prima di sfidare di nuovo.", // NEEDS QC

	// #endregion Chat

	// #region Teambuilder
	// ==================================================================

	// TRANSLATORS: This is for the Teams list view so it can't be singular
	// TRANSLATORS: Should be something like "Teams List" if you have no singular
	// TRANSLATORS: Can be different from TL.term.teams, which "Teams" as in "plural of Team"
	"Teams": "Squadre", // NEEDS QC
	"[New team]": "Nuova squadra", // NEEDS QC
	"[New team in folder]": "Nuova squadra nella cartella", // NEEDS QC
	"[New {FORMAT} team]": "Nuova squadra {FORMAT}", // NEEDS QC
	"[New box]": "Nuovo Box", // NEEDS QC
	// TRANSLATORS: When deleting a folder, button to add folder name to all teams in it
	"[Convert to prefix]": "Metti il nome della cartella come prefisso", // NEEDS QC
	"[(add folder)]": "(aggiungi cartella)", // NEEDS QC
	"[(add format folder)]": "(aggiungi cartella formato)", // NEEDS QC
	"Names can't contain slashes, since they're used as a folder separator.": "I nomi non possono contenere barre, perché sono usate come separatore di cartelle.", // NEEDS QC
	"Names can't contain the character |, since they're used for storing teams.": "I nomi non possono contenere il carattere |, perché è usato per salvare le squadre.", // NEEDS QC
	"New name required": "Nuovo nome richiesto", // NEEDS QC
	"Not in a folder": "Non in una cartella", // NEEDS QC
	"Teams not in any folders": "Squadre senza cartella", // NEEDS QC
	"All teams": "Tutte le squadre", // NEEDS QC
	"Folders": "Cartelle", // NEEDS QC

	// TRANSLATORS: for Clipboard actions
	"Copied!": "Copiato!", // NEEDS QC
	"[Paste copy here]": "Incolla la copia qui", // NEEDS QC
	"[Add to clipboard]": "Aggiungi agli appunti", // NEEDS QC
	"[Copy/Move]": "Copia/Sposta", // NEEDS QC
	"[+ Clipboard]": "+ Appunti", // NEEDS QC
	"[Deselect]": "Deseleziona", // NEEDS QC
	"[Move here]": "Sposta qui", // NEEDS QC

	// TRANSLATORS: for Import/Export
	"[Backup]": "Backup", // NEEDS QC
	"[Backup search results]": "Backup dei risultati", // NEEDS QC
	"[Backup folder]": "Backup della cartella", // NEEDS QC
	"Import/Export": "Importa/Esporta", // NEEDS QC
	"[Import/Export]": "Importa/Esporta", // NEEDS QC
	"[Import]": "Importa", // NEEDS QC
	"(can't save partial exports)": "(impossibile salvare un export parziale)", // NEEDS QC

	// TRANSLATORS: for uploaded teams
	"Account": "Account", // NEEDS QC
	"Account (public)": "Account (pubblico)", // NEEDS QC
	"Local": "Locale", // NEEDS QC
	"Uploaded": "Caricata", // NEEDS QC
	"[Upload for shareable URL]": "Carica per URL condivisibile", // NEEDS QC
	"[Upload for shareable/searchable URL]": "Carica per URL condivisibile e cercabile", // NEEDS QC
	"Disconnected (wrong account?)": "Disconnesso (account sbagliato?)", // NEEDS QC
	"[Revert to uploaded version]": "Ripristina la versione caricata", // NEEDS QC
	"[Compare]": "Confronta", // NEEDS QC
	"[Upload changes]": "Carica le modifiche", // NEEDS QC
	"Team was deleted": "La squadra è stata eliminata", // NEEDS QC
	"Team doesn't exist": "La squadra non esiste", // NEEDS QC
	"Untitled team": "Squadra senza nome", // NEEDS QC
	"Uploaded by": "Caricata da", // NEEDS QC
	"Views": "Visualizzazioni", // NEEDS QC
	"Team deleted": "Squadra eliminata", // NEEDS QC
	"Not found": "Non trovato", // NEEDS QC

	// TRANSLATORS: for the team editor
	"[Add Pokémon]": "Aggiungi Pokémon", // NEEDS QC
	"(choose ability)": null, // NEEDS TRANSLATION
	"Details": "Dettagli", // NEEDS QC
	// TRANSLATORS: Teambuilder "form" with text boxes inside, not form/forme "form" of a pokemon
	"Form": "Modulo", // NEEDS QC
	"Tera": "Tera", // NEEDS QC
	// TRANSLATORS: These two are for Hidden Power type
	// TRANSLATORS: They're both designed to take up very little width, so keep that in mind
	"H.P.": "Introf.", // NEEDS QC
	"H. Power": "Introforza", // NEEDS QC
	"Defensive coverage": "Copertura difensiva", // NEEDS QC
	"Teambuilding resources for {FORMAT}": "Risorse di teambuilding per {FORMAT}", // NEEDS QC
	"[See all]": "Vedi tutto", // NEEDS QC
	"Search species or filter by type, learnable moves, ability, tier, or egg group": "Cerca un Pokémon o filtra per tipo, mosse apprendibili, abilità, tier o gruppo Uova", // NEEDS QC
	"Search abilities": "Cerca abilità", // NEEDS QC
	"Search items": "Cerca strumenti", // NEEDS QC
	"Search moves or filter by type or category": "Cerca mosse o filtra per tipo o categoria", // NEEDS QC
	"Sample sets": "Set di esempio", // NEEDS QC
	"Box sets": "Set del Box", // NEEDS QC
	"Guessed spread": "Distribuzione stimata", // NEEDS QC
	"(Please choose 4 moves to get a guessed spread)": "(Scegli 4 mosse per ottenere una distribuzione stimata)", // NEEDS QC
	"Protip": "Suggerimento", // NEEDS QC
	"Use a different nature to save {NUMBER} EVs:": "Usa una natura diversa per risparmiare {NUMBER} EV:", // NEEDS QC
	"Use a different nature to get higher stats:": "Usa una natura diversa per statistiche più alte:", // NEEDS QC
	"Natures cannot raise or lower HP.": "Le nature non possono aumentare o ridurre i PS.", // NEEDS QC
	// TRANSLATORS: {STATCHANGES} is +stat/-stat
	"{STATCHANGES} nature": "Natura {STATCHANGES}", // NEEDS QC
	// TRANSLATORS: {1} and {2} are the + and - keyboard keys
	"You can also set natures by typing {1} and {2} in the EV box.": "Puoi impostare la natura anche digitando {1} e {2} nella casella degli EV.", // NEEDS QC
	"Pasted team": "Squadra incollata", // NEEDS QC
	"Zoom out forms": "Rimpicciolisci i moduli", // NEEDS QC
	"Compact": "Compatto", // NEEDS QC
	"Comfortable": "Comodo", // NEEDS QC
	"Zoom out search results": "Rimpicciolisci i risultati di ricerca", // NEEDS QC
	"Fetching Paste...": "Recupero del Paste...", // NEEDS QC
	"Import/Export set": "Importa/esporta il set", // NEEDS QC
	"IV spreads": "Spread di IV", // NEEDS QC
	"min Atk": "Att min", // NEEDS QC
	"min Atk, min Spe": "Att min, Vel min", // NEEDS QC
	"max all": "tutto max", // NEEDS QC
	"min Spe": "Vel min", // NEEDS QC
	"Hidden Power {TYPE} IVs": "IV per Introforza {TYPE}", // NEEDS QC
	"EVs, IVs, and nature": "EV, IV e natura", // NEEDS QC
	"Base": "Base", // NEEDS QC
	"Remaining": "Rimanenti", // NEEDS QC

	// TRANSLATORS: errors
	"You must select a format first.": "Devi prima scegliere un formato.", // NEEDS QC
	"This team is for a different account. Please log into the correct account to update it.": "Questa squadra appartiene a un altro account. Accedi con l'account giusto per aggiornarla.", // NEEDS QC
	"Add a Pokémon to your team before uploading it.": "Aggiungi un Pokémon alla squadra prima di caricarla.", // NEEDS QC
	"Must use on an uploaded team.": "Utilizzabile solo su una squadra caricata.", // NEEDS QC
	"Team not found: {INPUT}": "Squadra non trovata: {INPUT}", // NEEDS QC
	"Your file \"{FILENAME}\" is not a valid team.": "Il file \"{FILENAME}\" non è una squadra valida.", // NEEDS QC

	// #endregion Teambuilder

	// #region Ladder
	// ==================================================================

	"[All formats]": "Tutti i formati", // NEEDS QC
	"[How the ladder works]": "Come funziona la classifica", // NEEDS QC
	"[Seasonal rankings]": "Classifiche stagionali", // NEEDS QC
	"[Look up a specific user's rating]": "Consulta la valutazione di un utente specifico", // NEEDS QC
	"Name": "Nome", // NEEDS QC
	"Elo rating": "Valutazione Elo", // NEEDS QC
	"user's percentage chance of winning a random battle (Glicko X-Act Estimate)": "probabilità stimata di vincere una lotta casuale (stima Glicko X-Act)", // NEEDS QC
	"Glicko-1 rating system: rating±deviation (provisional if deviation>100)": "Sistema di valutazione Glicko-1: valutazione±deviazione (provvisoria se deviazione>100)", // NEEDS QC
	"No one has played any ranked games yet.": "Nessuno ha ancora giocato partite classificate.", // NEEDS QC

	// #endregion Ladder

	// #region Misc rooms
	// ==================================================================

	"[Join the Help room for live help]": "Chiedi aiuto nella stanza Help", // NEEDS QC
	"Unrecognized command: {INPUT}": "Comando non riconosciuto: {INPUT}", // NEEDS QC

	// #endregion Misc rooms
};
