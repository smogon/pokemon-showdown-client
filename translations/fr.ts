// Remember, comments starting with "TRANSLATORS:" are from Showdown,
// and are shared between all translations. But other comments can be
// used as notes to yourself or other translators, and are specific
// to the French translation.

// French typography wants a (narrow) no-break space before : and !
// We use regular spaces for now; consider U+00A0 if line breaks
// ever split a label before its punctuation.

import type { UIText } from '../build-tools/translations.mts';
export const translations: UIText = {
	// #region Navigation
	// ==================================================================

	// TRANSLATORS: Note that "Home" and "Main Menu" refer to the same place
	// TRANSLATORS: So it's fine if they're the same word in your language
	"Home": "Accueil", // NEEDS QC
	// TRANSLATORS: This is used as a "Back to Home" button after battles
	"[Main menu]": "Menu principal", // NEEDS QC
	// TRANSLATORS: It's fine if "Teambuilder" and "Teams" are the same word in your language
	// TRANSLATORS: Also consider something like "Edit teams" for "Teambuilder"
	"Teambuilder": "Éditeur d'équipes", // NEEDS QC
	"Ladder": "Classement", // NEEDS QC
	"Tournaments": "Tournois", // NEEDS QC
	"Friends": "Amis", // NEEDS QC
	"Chat rooms": "Salons de discussion", // NEEDS QC
	"Battles": "Combats", // NEEDS QC
	"News": "Actualités", // NEEDS QC
	"Offline": "Hors ligne", // NEEDS QC
	"[Join chat]": "Rejoindre le chat", // NEEDS QC
	"[All tabs]": "Tous les onglets", // NEEDS QC
	"[Menu]": "Menu", // NEEDS QC

	// #endregion Navigation

	// #region Generic UI
	// ==================================================================

	"[Hide]": "Masquer", // NEEDS QC
	"[Close]": "Fermer", // NEEDS QC
	"[Done]": "Terminé", // NEEDS QC
	"[Back]": "Retour", // NEEDS QC
	// TRANSLATORS: A computer copy command, like Ctrl+C
	"[Copy]": "Copier", // NEEDS QC
	"[Edit]": "Modifier", // NEEDS QC
	"[Delete]": "Supprimer", // NEEDS QC
	"[Undo delete]": "Annuler la suppression", // NEEDS QC
	// TRANSLATORS: "DM" is used to label DMs; "[Chat]" is the button to send a DM
	// TRANSLATORS: Feel free to use the same word for both (and for "Chat" in the Battle section)
	// "MP" = message privé, the standard French forum/gaming term
	"DM": "MP", // NEEDS QC
	"[Chat]": "Discuter", // NEEDS QC
	"[OK]": "OK", // NEEDS QC
	"[Cancel]": "Annuler", // NEEDS QC
	"[Accept]": "Accepter", // NEEDS QC
	"[Reject]": "Refuser", // NEEDS QC
	"Random team": "Équipe aléatoire", // NEEDS QC
	"[Sound]": "Son", // NEEDS QC
	"[Options]": "Options", // NEEDS QC
	"[Battle options]": "Options de combat", // NEEDS QC
	"[Revert]": "Rétablir", // NEEDS QC
	"[Refresh]": "Actualiser", // NEEDS QC
	"[Search]": "Rechercher", // NEEDS QC
	"[Validate]": "Vérifier", // NEEDS QC
	"[Reconnect]": "Se reconnecter", // NEEDS QC
	"Disconnected": "Déconnecté", // NEEDS QC
	"Connecting...": "Connexion...", // NEEDS QC
	"Loading...": "Chargement...", // NEEDS QC
	"Uploading...": "Envoi...", // NEEDS QC
	"[Change]": "Modifier", // NEEDS QC
	"[Add]": "Ajouter", // NEEDS QC
	"[Look up]": "Rechercher", // NEEDS QC
	"[Save changes]": "Enregistrer", // NEEDS QC
	"[Create]": "Créer", // NEEDS QC
	"[Rename]": "Renommer", // NEEDS QC
	"[Remove]": "Retirer", // NEEDS QC
	// TRANSLATORS: intentionally chosen to be very short. do not go longer than three letters for this one
	"Gen {NUMBER}": "Gén {NUMBER}", // NEEDS QC
	"[Maximize]": "Agrandir", // NEEDS QC
	"[Expand/collapse]": "Déplier/replier", // NEEDS QC

	// TRANSLATORS: connection/team-storage errors
	"Sorry, psim connections are unsupported by your browser.": "Désolé, ton navigateur ne prend pas en charge les connexions psim.", // NEEDS QC
	"Your browser doesn't support third-party cookies. Some things might not work correctly.": "Ton navigateur ne prend pas en charge les cookies tiers. Certaines choses risquent de ne pas fonctionner correctement.", // NEEDS QC
	"Your team storage format is too old for PS. You'll need to upgrade it at {URL}": "Le format de stockage de tes équipes est trop ancien pour PS. Tu dois le mettre à jour sur {URL}", // NEEDS QC
	"Error loading uploaded teams: {ERROR}": "Erreur de chargement des équipes envoyées : {ERROR}", // NEEDS QC
	"Error unknown. Try again later.": "Erreur inconnue. Réessaie plus tard.", // NEEDS QC
	"Failed to load team: {ERROR}": "Impossible de charger l'équipe : {ERROR}", // NEEDS QC
	"Error logging in.": "Erreur de connexion.", // NEEDS QC
	"Something is interfering with our connection to the login server. Most likely, your internet provider needs you to re-log-in, or your internet provider is blocking Pokémon Showdown.": "Quelque chose interfère avec notre connexion au serveur de connexion. Ton fournisseur d'accès exige probablement que tu te reconnectes, ou bien il bloque Pokémon Showdown.", // NEEDS QC

	// TRANSLATORS: for constructing lists
	"{FIRST} or {SECOND}": "{FIRST} ou {SECOND}", // NEEDS QC
	"{FIRST} and {SECOND}": "{FIRST} et {SECOND}", // NEEDS QC
	", {NEXT}": ", {NEXT}", // NEEDS QC
	", or {LAST}": " ou {LAST}", // NEEDS QC
	", and {LAST}": " et {LAST}", // NEEDS QC
	// TRANSLATORS: this is for lists of users specifically
	// TRANSLATORS: (languages with counters should use the "person" counter)
	", and {NUMBER} others": " et {NUMBER} autres", // NEEDS QC

	// #endregion Generic UI

	// #region Popups
	// ==================================================================

	// TRANSLATORS: user popup
	// TRANSLATORS: "Global {RANK}" is a rank, like "Global Moderator"
	"Global {RANK}": "{RANK} global", // NEEDS QC
	"Chatrooms": "Salons", // NEEDS QC
	"Private rooms": "Salons privés", // NEEDS QC
	"OFFLINE": "HORS LIGNE", // NEEDS QC
	"Username": "Nom d'utilisateur", // NEEDS QC
	"[Register]": "S'inscrire", // NEEDS QC
	"[Add status]": "Ajouter un statut", // NEEDS QC
	"[Chat self]": "Discuter avec soi-même", // NEEDS QC
	"[Change name]": "Changer de nom", // NEEDS QC
	"[Log out]": "Se déconnecter", // NEEDS QC
	"[Add friend]": "Ajouter en ami", // NEEDS QC
	"[Unignore]": "Ne plus ignorer", // NEEDS QC
	"[Ignore]": "Ignorer", // NEEDS QC
	"[Report]": "Signaler", // NEEDS QC
	"[Mute]": "Rendre muet", // NEEDS QC
	"[7m]": "7 min", // NEEDS QC
	"[Hourmute]": "Muet 1 heure", // NEEDS QC
	"[1h]": "1 h", // NEEDS QC
	"[Ban]": "Bannir", // NEEDS QC
	"[2d]": "2 j", // NEEDS QC
	"[Weekban]": "Bannir 1 semaine", // NEEDS QC
	"[1w]": "1 sem.", // NEEDS QC
	"[Modlog]": "Journal de modération", // NEEDS QC
	// TRANSLATORS: Showdown term for a global mute
	"[Lock]": "Verrouiller", // NEEDS QC
	"[Weeklock]": "Verrouiller 1 semaine", // NEEDS QC
	"[Namelock]": "Verrouiller le nom", // NEEDS QC
	"[Global modlog]": "Journal de modération global", // NEEDS QC
	"[Avatar...]": "Avatar...", // NEEDS QC
	"[Close room]": "Fermer le salon", // NEEDS QC
	"[Report a user]": "Signaler un utilisateur", // NEEDS QC
	"({NUMBER} sec)": "({NUMBER} s)", // NEEDS QC
	"Room not found": "Salon introuvable", // NEEDS QC

	// TRANSLATORS: battle options
	"Side-by-side, controls below": "Côte à côte, commandes en dessous", // NEEDS QC
	"Side-by-side, overlay controls": "Côte à côte, commandes superposées", // NEEDS QC
	"Top-and-bottom, controls below": "Empilé, commandes en dessous", // NEEDS QC
	"Top-and-bottom, overlay controls": "Empilé, commandes superposées", // NEEDS QC
	"Scrolling, controls below": "Défilement, commandes en dessous", // NEEDS QC
	"Scrolling, overlay controls": "Défilement, commandes superposées", // NEEDS QC
	"Hardcore mode ON: Information not available in-game is now hidden.": "Mode hardcore activé : les informations non disponibles en jeu sont désormais masquées.", // NEEDS QC
	"Hardcore mode OFF: Information not available in-game is now shown.": "Mode hardcore désactivé : les informations non disponibles en jeu sont désormais affichées.", // NEEDS QC
	"Spectators ignored.": "Les spectateurs sont ignorés.", // NEEDS QC
	"Spectators no longer ignored.": "Les spectateurs ne sont plus ignorés.", // NEEDS QC
	"In this battle": "Dans ce combat", // NEEDS QC
	"Hardcore mode (hide info not shown in-game)": "Mode hardcore (masquer les infos non visibles en jeu)", // NEEDS QC
	"Ignore spectators": "Ignorer les spectateurs", // NEEDS QC
	"Ignore opponent": "Ignorer l'adversaire", // NEEDS QC
	"Ignore nicknames": "Ignorer les surnoms", // NEEDS QC
	"All battles": "Tous les combats", // NEEDS QC
	"Layout": "Disposition", // NEEDS QC
	"Automatic ({SETTING})": "Automatique ({SETTING})", // NEEDS QC
	"Automatic": "Automatique", // NEEDS QC
	"(DESKTOP)": "(ORDINATEUR)", // NEEDS QC
	"(MOBILE VERTICAL)": "(MOBILE VERTICAL)", // NEEDS QC
	"(MOBILE HORIZONTAL)": "(MOBILE HORIZONTAL)", // NEEDS QC
	"You can still invite spectators by giving them the URL or using the /invite command": "Tu peux toujours inviter des spectateurs en leur donnant l'URL ou avec la commande /invite", // NEEDS QC
	"Invite only (hide from Battles list)": "Sur invitation (masquer de la liste des combats)", // NEEDS QC
	"Ignore Pokémon nicknames": "Ignorer les surnoms des Pokémon", // NEEDS QC
	"Automatically start timer": "Démarrer automatiquement le minuteur", // NEEDS QC
	"Hardcore mode": "Mode hardcore", // NEEDS QC
	"Start at turn 0 when spectating battles": "Commencer au tour 0 en regardant un combat", // NEEDS QC
	"Open new battles in the right-side panel": "Ouvrir les nouveaux combats dans le panneau de droite", // NEEDS QC

	// TRANSLATORS: options
	"General": "Général", // NEEDS QC
	"Language": "Langue", // NEEDS QC
	"Appearance": "Apparence", // NEEDS QC
	"Theme": "Thème", // NEEDS QC
	"Light": "Clair", // NEEDS QC
	"Dark": "Sombre", // NEEDS QC
	"Match system theme": "Suivre le thème du système", // NEEDS QC
	"Two panels (if wide enough)": "Deux panneaux (si assez large)", // NEEDS QC
	"Single panel": "Panneau unique", // NEEDS QC
	"Vertical tabs": "Onglets verticaux", // NEEDS QC
	"Background": "Arrière-plan", // NEEDS QC
	"Disable animations": "Désactiver les animations", // NEEDS QC
	"Use 2D sprites instead of 3D models": "Utiliser des sprites 2D au lieu des modèles 3D", // NEEDS QC
	"Use modern sprites for past generations": "Utiliser les sprites modernes pour les anciennes générations", // NEEDS QC
	"Block DMs": "Bloquer les MP", // NEEDS QC
	"Block challenges": "Bloquer les défis", // NEEDS QC
	"Show DMs in chatrooms": "Afficher les MP dans les salons", // NEEDS QC
	"Do not highlight when your name is said in chat": "Ne pas surligner quand ton nom est mentionné", // NEEDS QC
	"Confirm before leaving a room": "Confirmer avant de quitter un salon", // NEEDS QC
	"Confirm before refreshing": "Confirmer avant d'actualiser", // NEEDS QC
	"Always notify": "Toujours notifier", // NEEDS QC
	"Notify when joined": "Notifier si inscrit", // NEEDS QC
	"Hide": "Masquer", // NEEDS QC
	"Timestamps": "Horodatage", // NEEDS QC
	"Off": "Désactivé", // NEEDS QC
	"Timestamps in DMs": "Horodatage des MP", // NEEDS QC
	"Chat preferences": "Préférences du chat", // NEEDS QC
	"[Change background]": "Changer le fond", // NEEDS QC
	"[Text formatting...]": "Mise en forme du texte...", // NEEDS QC
	"[Set as background]": "Définir comme fond", // NEEDS QC
	"[Random]": "Aléatoire", // NEEDS QC

	// TRANSLATORS: team chooser
	"(uncategorized)": "(sans catégorie)", // NEEDS QC
	"(all)": "(tout)", // NEEDS QC
	"[Other gens]": "Autres générations", // NEEDS QC
	"Select a team": "Choisir une équipe", // NEEDS QC
	"This team selector is no longer available (the challenge was cancelled or something).": "Ce sélecteur d'équipe n'est plus disponible (le défi a été annulé ou quelque chose comme ça).", // NEEDS QC
	"No teams found": "Aucune équipe trouvée", // NEEDS QC
	"This format selector is no longer available.": "Ce sélecteur de format n'est plus disponible.", // NEEDS QC
	"Search formats": "Rechercher un format", // NEEDS QC

	// TRANSLATORS: login
	"[Choose name]": "Choisir un nom", // NEEDS QC
	"Logging in...": "Connexion...", // NEEDS QC
	"[Log in]": "Se connecter", // NEEDS QC
	"[Try another name]": "Essayer un autre nom", // NEEDS QC
	"[Password...]": "Mot de passe...", // NEEDS QC
	"[Change password]": "Changer le mot de passe", // NEEDS QC
	"[Show password]": "Afficher le mot de passe", // NEEDS QC
	"Loading Google log-in button...": "Chargement du bouton de connexion Google...", // NEEDS QC
	"(color)": "(couleur)", // NEEDS QC
	"(Others will be able to see your name change. To change name privately, use \"Log out\")": "(Les autres verront ton changement de nom. Pour en changer discrètement, utilise « Se déconnecter »)", // NEEDS QC
	"if you registered this name:": "si tu as enregistré ce nom :", // NEEDS QC
	"if not:": "sinon :", // NEEDS QC
	"This is someone else's account. Sorry.": "Ce compte appartient à quelqu'un d'autre. Désolé.", // NEEDS QC
	"Password": "Mot de passe", // NEEDS QC

	// TRANSLATORS: register / change password
	"All fields are required": "Tous les champs sont requis", // NEEDS QC
	"Passwords do not match": "Les mots de passe ne correspondent pas", // NEEDS QC
	"Your password was successfully changed!": "Ton mot de passe a bien été changé !", // NEEDS QC
	"Change your password:": "Change ton mot de passe :", // NEEDS QC
	"Old password": "Ancien mot de passe", // NEEDS QC
	"New password": "Nouveau mot de passe", // NEEDS QC
	"New password (confirm)": "Nouveau mot de passe (confirmation)", // NEEDS QC
	"You have been successfully registered.": "Ton compte a bien été enregistré.", // NEEDS QC
	"Register your account:": "Enregistre ton compte :", // NEEDS QC
	"Password (confirm)": "Mot de passe (confirmation)", // NEEDS QC
	"An Electric-type mouse that is the mascot of the Pokémon franchise.": "Une souris de type Électrik, mascotte de la franchise Pokémon.", // NEEDS QC
	"What is this Pokémon?": "Quel est ce Pokémon ?", // NEEDS QC

	// #endregion Popups

	// #region Main Menu
	// ==================================================================

	// TRANSLATORS: Our famous ladder queue button. Give it some flair :)
	// TRANSLATORS: Might we suggest "Showdown!"
	"[Battle!]": "Au combat !", // NEEDS QC
	"Find a random opponent": "Trouver un adversaire au hasard", // NEEDS QC
	"Watch a battle": "Regarder un combat", // NEEDS QC
	"Find a user": "Rechercher un utilisateur", // NEEDS QC
	"Info & Resources": "Infos et ressources", // NEEDS QC
	"Lobby chat": "Chat du lobby", // NEEDS QC

	// TRANSLATORS: Challenge/Search UI
	"[Challenge]": "Défier", // NEEDS QC
	"Custom rules": "Règles personnalisées", // NEEDS QC
	// TRANSLATORS: Search countdown. {NUMBER} = a number of seconds
	// TRANSLATORS: English doesn't include the unit (seconds) but your language can
	"Searching in {NUMBER}...": "Recherche dans {NUMBER} s...", // NEEDS QC
	"Searching...": "Recherche d'un adversaire...", // NEEDS QC
	"Pokédex": "Pokédex", // NEEDS QC
	"Replays": "Replays", // NEEDS QC
	"Forum": "Forum", // NEEDS QC
	"Rules": "Règles", // NEEDS QC
	"Credits": "Crédits", // NEEDS QC
	"Privacy": "Confidentialité", // NEEDS QC
	"background by {ARTIST}": "arrière-plan par {ARTIST}", // NEEDS QC

	// TRANSLATORS: errors
	"Wait for this countdown to finish first...": "Attends d'abord la fin du compte à rebours...", // NEEDS QC
	"You're already searching for a {FORMAT} battle...": "Tu cherches déjà un combat {FORMAT}...", // NEEDS QC
	"You need to go into the Teambuilder and build a team for this format.": "Tu dois aller dans le Teambuilder et créer une équipe pour ce format.", // NEEDS QC

	// #endregion Main Menu

	// #region Rooms
	// ==================================================================

	// TRANSLATORS: these go under the user/battle counts, and in English they read as "100 users online"
	// TRANSLATORS: but they don't have to work that way in your language
	// short label forms to fit the count boxes; "utilisateurs en ligne" /
	// "combats en cours" were too wide
	"users online": "connectés", // NEEDS QC
	"active battles": "combats", // NEEDS QC
	"Find an online user": "Trouver un utilisateur en ligne", // NEEDS QC
	"Watch an active battle": "Regarder un combat en cours", // NEEDS QC
	"Meloetta is PS's mascot! The Aria forme is about using its voice, and represents our chatrooms.": "Meloetta est la mascotte de PS ! La Forme Chant utilise sa voix et représente nos salons de discussion.", // NEEDS QC
	"Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles.": "Meloetta est la mascotte de PS ! La Forme Danse est de type Combat et représente nos combats.", // NEEDS QC

	"Official chat rooms": "Salons de discussion officiels", // NEEDS QC
	"Hidden rooms": "Salons cachés", // NEEDS QC

	"Subrooms": "Sous-salons", // NEEDS QC
	"(All rooms)": "(Tous les salons)", // NEEDS QC
	"Join or search for rooms": "Rejoindre ou chercher un salon", // NEEDS QC
	"Command": "Commande", // NEEDS QC
	"Console": "Console", // NEEDS QC
	"Enter = run command {INPUT}": "Entrée = exécuter la commande {INPUT}", // NEEDS QC
	"(Subroom of {ROOM})": "(Sous-salon de {ROOM})", // NEEDS QC
	"Possible secret room": "Salon secret possible", // NEEDS QC
	"(Private room?)": "(Salon privé ?)", // NEEDS QC
	"Search results": "Résultats de recherche", // NEEDS QC

	// #endregion Rooms

	// #region Battle
	// ==================================================================

	// TRANSLATORS: Note that most translations of battle UI are in the server repository
	// TRANSLATORS: In data/text/[lang]/default.ts and data/text/[lang]/names.ts

	// TRANSLATORS: [Team]/[Battle]/[Switch]/[Shift] are buttons in overlay controls
	// TRANSLATORS: But they're section headers in normal battle controls
	// TRANSLATORS: For the "Use move" menu in battle controls
	// TRANSLATORS: This was "Attack" in older Showdown, "FIGHT" on older cart, and "Battle" on modern cart
	// SV battle menu: Attaque
	"[Battle]": "Attaque", // NEEDS QC
	// TRANSLATORS: For the "Switch" menu in battle controls
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	// SV labels this menu Équipe, but that word is [Team]'s here, so [Switch] gets a plain verb
	"[Switch]": "Changer", // NEEDS QC
	// TRANSLATORS: For the Team Preview menu in battle controls
	// TRANSLATORS: Also replaces "[Switch]" in phases where switching isn't possible
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Team]": "Équipe", // NEEDS QC
	// TRANSLATORS: The Triples "move to center" button
	// TRANSLATORS: This is "SHIFT" on older cart; Triples doesn't exist on modern cart
	// ORAS battle menu (the last games with Triples): Déplacer
	"[Shift]": "Déplacer", // NEEDS QC

	// TRANSLATORS: Mobile-layout buttons for switching between the battle view and the chat view
	// TRANSLATORS: ("Chat" is also used as a section header in the options popup)
	"Battle": "Combat", // NEEDS QC
	"Chat": "Chat", // NEEDS QC
	"[Try Fight button]": "Essayer le bouton Attaque", // NEEDS QC
	// TRANSLATORS: For the "where to target this move" menu
	"(empty slot)": "(emplacement vide)", // NEEDS QC
	"Maxed with no max moves": "Aucune capacité Dynamax disponible", // NEEDS QC
	"No Z moves": "Aucune capacité Z", // NEEDS QC

	"[Rematch]": "Revanche", // NEEDS QC
	"[Offer tie]": "Proposer l'égalité", // NEEDS QC
	// "Déclarer forfait" is more precise but longer
	"[Forfeit]": "Abandonner", // NEEDS QC
	"[Forfeit and close]": "Abandonner et fermer", // NEEDS QC
	"[Replace player]": "Remplacer le joueur", // NEEDS QC
	"[Replace]": "Remplacer", // NEEDS QC
	"(turn 100+)": "(tour 100+)", // NEEDS QC
	"[Stop timer]": "Arrêter le chrono", // NEEDS QC
	"[Start timer]": "Lancer le chrono", // NEEDS QC
	"Enter player's name": "Entre le nom du joueur", // NEEDS QC
	"Cannot replace player, battle has already ended.": "Impossible de remplacer le joueur, le combat est déjà terminé.", // NEEDS QC

	// TRANSLATORS: for replay controls
	"[Play]": "Lecture", // NEEDS QC
	"[Pause]": "Pause", // NEEDS QC
	"[First turn]": "Premier tour", // NEEDS QC
	"[Prev turn]": "Tour précédent", // NEEDS QC
	"[Skip turn]": "Tour suivant", // NEEDS QC
	"[Skip to end]": "Aller à la fin", // NEEDS QC
	"[Switch viewpoint]": "Changer de point de vue", // NEEDS QC
	"[Go to turn]": "Aller au tour", // NEEDS QC
	"[Skip]": "Passer", // NEEDS QC
	"[Skip animation]": "Passer l'animation", // NEEDS QC
	"[Move to center]": "Se déplacer au centre", // NEEDS QC
	"[Upload and share replay]": "Mettre en ligne et partager le replay", // NEEDS QC
	"[Replay]": "Replay", // NEEDS QC
	"(closes this battle)": "(ferme ce combat)", // NEEDS QC

	// TRANSLATORS: for the battle list
	"Minimum Elo": "Elo minimum", // NEEDS QC
	"rated {ELO}": "classé {ELO}", // NEEDS QC
	// TRANSLATORS: goes between two usernames; the key includes its surrounding spacing so some languages can drop it
	"{PLAYER1} vs. {PLAYER2}": "{PLAYER1} vs {PLAYER2}", // NEEDS QC
	"(All formats)": "(Tous les formats)", // NEEDS QC
	"Username prefix": "Préfixe du nom d'utilisateur", // NEEDS QC
	"No battles are going on": "Aucun combat en cours", // NEEDS QC
	"{NUMBER} battle": "{NUMBER} combat", // NEEDS QC
	"{NUMBER} battles": "{NUMBER} combats", // NEEDS QC
	"None": "Aucun", // NEEDS QC
	"Timer": "Minuteur", // NEEDS QC
	"Error": "Erreur", // NEEDS QC
	"The battle you're looking for has expired. Battles expire after 15 minutes of inactivity unless they're saved.": "Le combat que tu cherches a expiré. Les combats expirent après 15 minutes d'inactivité s'ils ne sont pas sauvegardés.", // NEEDS QC
	"In the future, remember to click \"Save replay\" to save a replay permanently.": "À l'avenir, pense à cliquer sur « Sauvegarder le replay » pour conserver un replay définitivement.", // NEEDS QC
	"Unrecognized HTML file: Only replay files are supported.": "Fichier HTML non reconnu : seuls les fichiers replay sont pris en charge.", // NEEDS QC
	"You are still in {ROOM}": "Tu es encore dans {ROOM}", // NEEDS QC
	"Battle \"{INPUT}\" not found": "Combat « {INPUT} » introuvable", // NEEDS QC
	"Uploaded replay": "Replay téléversé", // NEEDS QC
	"Team {PLAYER}": "Équipe {PLAYER}", // NEEDS QC
	"{PLAYER} and friends": "{PLAYER} et compagnie", // NEEDS QC

	// TRANSLATORS: battle log messages
	"[Earlier messages]": "Messages précédents", // NEEDS QC
	"Register an account to protect your ladder rating!": "Enregistre un compte pour protéger ton classement !", // NEEDS QC
	"Open team sheet for {PLAYER}": "Ouvrir la feuille d'équipe de {PLAYER}", // NEEDS QC
	"Warning": "Avertissement", // NEEDS QC
	"Variation": "Variante", // NEEDS QC
	"Rated battle": "Combat classé", // NEEDS QC

	// TRANSLATORS: screen reader labels
	"Active Pokémon": "Pokémon actif", // NEEDS QC
	"Your team": "Ton équipe", // NEEDS QC
	"Opponent's team": "Équipe de l'adversaire", // NEEDS QC
	"Statused": "Avec problème de statut", // NEEDS QC
	"Non-statused": "Sans problème de statut", // NEEDS QC
	"Unrevealed Illusion user": "Utilisateur d'Illusion non révélé", // NEEDS QC
	"Not revealed": "Non révélé", // NEEDS QC
	"Battle controls": "Commandes du combat", // NEEDS QC

	// #endregion Battle

	// #region Chat
	// ==================================================================

	"{NUMBER} user": "{NUMBER} utilisateur", // NEEDS QC
	"{NUMBER} users": "{NUMBER} utilisateurs", // NEEDS QC
	"[Join]": "Rejoindre", // NEEDS QC
	"[Leave]": "Quitter", // NEEDS QC
	"[Ready!]": "Prêt !", // NEEDS QC
	"In progress": "En cours", // NEEDS QC
	"Signups": "Inscriptions", // NEEDS QC
	"[Pop-out]": "Fenêtre séparée", // NEEDS QC
	"[Go]": "Aller", // NEEDS QC
	"[Visit]": "Ouvrir", // NEEDS QC
	"[Choose a name before sending messages]": "Choisis un nom avant d'envoyer des messages", // NEEDS QC
	"Challenging...": "Défi en cours...", // NEEDS QC
	"Accepting...": "Acceptation...", // NEEDS QC
	"[Commands]": "Commandes", // NEEDS QC
	"Mentioned by {USER} in {ROOM}": "{USER} t'a mentionné dans {ROOM}", // NEEDS QC
	"{USERS} joined": "Arrivée de {USERS}", // NEEDS QC
	// TRANSLATORS: separates "X joined" from "Y left"
	"{JOINEDMESSAGE}; {LEFTMESSAGE}": "{JOINEDMESSAGE} ; {LEFTMESSAGE}", // NEEDS QC
	"{USERS} left": "Départ de {USERS}", // NEEDS QC
	"{USER} renamed from {OLDUSER}.": "{OLDUSER} s'appelle désormais {USER}.", // NEEDS QC
	"(Private to {USER})": "(En privé à {USER})", // NEEDS QC
	"{FORMAT} battle started between {PLAYER1} and {PLAYER2}.": "Combat {FORMAT} lancé entre {PLAYER1} et {PLAYER2}.", // NEEDS QC
	// TRANSLATORS: for when the format name already includes "battle"
	"{FORMAT} started between {PLAYER1} and {PLAYER2}.": "{FORMAT} lancé entre {PLAYER1} et {PLAYER2}.", // NEEDS QC
	// TRANSLATORS: for when the format is unknown
	"Battle started between {PLAYER1} and {PLAYER2}.": "Combat lancé entre {PLAYER1} et {PLAYER2}.", // NEEDS QC
	"({NUMBER} line from {USER} hidden)": "({NUMBER} ligne de {USER} masquée)", // NEEDS QC
	"({NUMBER} lines from {USER} hidden)": "({NUMBER} lignes de {USER} masquées)", // NEEDS QC
	"{USER} invited you to join the room \"{ROOM}\"": "{USER} t'invite à rejoindre le salon « {ROOM} »", // NEEDS QC
	"[Join {ROOM}]": "Rejoindre {ROOM}", // NEEDS QC
	"Chat log": "Journal du chat", // NEEDS QC

	// TRANSLATORS: tournaments
	"Please respond to the tournament within {SECONDS} seconds or you may be automatically disqualified.": "Réponds au tournoi dans les {SECONDS} secondes ou tu risques d'être disqualifié automatiquement.", // NEEDS QC
	"Single Elimination": "Élimination simple", // NEEDS QC
	"Double Elimination": "Élimination double", // NEEDS QC
	"Round Robin": "Round Robin", // NEEDS QC
	"Double Round Robin": "Double Round Robin", // NEEDS QC
	"{JOINS} joined the tournament": "Inscription de {JOINS} au tournoi", // NEEDS QC
	"{LEAVES} left the tournament": "Départ de {LEAVES} du tournoi", // NEEDS QC
	// TRANSLATORS: sentence terminator for messages like the above
	"{SENTENCE}.": "{SENTENCE}.", // NEEDS QC
	"{FORMAT} {TYPE} tournament": "Tournoi {FORMAT} {TYPE}", // NEEDS QC
	"No tournaments are currently running.": "Aucun tournoi n'est en cours.", // NEEDS QC
	"(started)": "(commencé)", // NEEDS QC
	"{TOURNAMENT} created.": "{TOURNAMENT} créé.", // NEEDS QC
	"{TOURNAMENT} created (and hidden).": "{TOURNAMENT} créé (et masqué).", // NEEDS QC
	"Tournament created": "Tournoi créé", // NEEDS QC
	// TRANSLATORS: label, as in "Room: lobby"
	"Room": "Salon", // NEEDS QC
	"Type": "Type", // NEEDS QC
	"{USER} has joined the tournament, replacing {OLDUSER}.": "{USER} a rejoint le tournoi, remplaçant {OLDUSER}.", // NEEDS QC
	"({NUMBER} players)": "({NUMBER} joueurs)", // NEEDS QC
	"The tournament has started!": "Le tournoi a commencé !", // NEEDS QC
	"{USER} has been disqualified from the tournament.": "{USER} a été disqualifié du tournoi.", // NEEDS QC
	"The tournament's automatic disqualify timer has been turned off.": "Le minuteur de disqualification automatique du tournoi a été désactivé.", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minute.": "Le minuteur de disqualification automatique du tournoi a été réglé sur {NUMBER} minute.", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minutes.": "Le minuteur de disqualification automatique du tournoi a été réglé sur {NUMBER} minutes.", // NEEDS QC
	"Tournament automatic disqualification warning": "Avertissement de disqualification automatique du tournoi", // NEEDS QC
	"Time": "Temps", // NEEDS QC
	"{NUMBER} sec": "{NUMBER} s", // NEEDS QC
	"The tournament's automatic start is now off.": "Le démarrage automatique du tournoi est désactivé.", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minute.": "Le tournoi commencera automatiquement dans {NUMBER} minute.", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minutes.": "Le tournoi commencera automatiquement dans {NUMBER} minutes.", // NEEDS QC
	"Scouting is now allowed (Tournament players can watch other tournament battles)": "Le scouting est maintenant autorisé (les joueurs du tournoi peuvent regarder les autres combats du tournoi)", // NEEDS QC
	"Scouting is now banned (Tournament players can't watch other tournament battles)": "Le scouting est maintenant interdit (les joueurs du tournoi ne peuvent pas regarder les autres combats du tournoi)", // NEEDS QC
	"Tournament challenges available": "Défis de tournoi disponibles", // NEEDS QC
	"Tournament challenge from {PLAYER}": "Défi de tournoi de {PLAYER}", // NEEDS QC
	"Tournament battle between {PLAYER1} and {PLAYER2} started.": "Combat de tournoi entre {PLAYER1} et {PLAYER2} lancé.", // NEEDS QC
	"{PLAYER1} has won the match {SCORE} against {PLAYER2}": "{PLAYER1} a gagné le match {SCORE} contre {PLAYER2}", // NEEDS QC
	"{PLAYER1} has lost the match {SCORE} against {PLAYER2}": "{PLAYER1} a perdu le match {SCORE} contre {PLAYER2}", // NEEDS QC
	"{PLAYER1} has drawn the match {SCORE} against {PLAYER2}": "{PLAYER1} a fait match nul {SCORE} contre {PLAYER2}", // NEEDS QC
	" but the tournament does not support drawing, so it did not count": ", mais le tournoi ne prend pas en charge les matchs nuls, donc il ne compte pas", // NEEDS QC
	"Congratulations to {WINNERS} for winning the {TOURNAMENT}!": "Félicitations à {WINNERS} pour sa victoire dans le {TOURNAMENT} !", // NEEDS QC
	"Runners-up": "Finalistes", // NEEDS QC
	"Runner-up": "Finaliste", // NEEDS QC
	"The tournament was forcibly ended.": "Le tournoi a été terminé de force.", // NEEDS QC
	"The tournament has already started.": "Le tournoi a déjà commencé.", // NEEDS QC
	"The tournament hasn't started yet.": "Le tournoi n'a pas encore commencé.", // NEEDS QC
	"You are already in the tournament.": "Tu es déjà dans le tournoi.", // NEEDS QC
	"One of your alts is already in the tournament.": "Un de tes autres comptes est déjà dans le tournoi.", // NEEDS QC
	"You aren't in the tournament.": "Tu n'es pas dans le tournoi.", // NEEDS QC
	"This user isn't in the tournament.": "Cet utilisateur n'est pas dans le tournoi.", // NEEDS QC
	"There aren't enough users.": "Il n'y a pas assez d'utilisateurs.", // NEEDS QC
	"That isn't a valid timeout value.": "Ce n'est pas une valeur de délai valide.", // NEEDS QC
	"That isn't a valid tournament matchup.": "Ce n'est pas un affrontement de tournoi valide.", // NEEDS QC
	"You must have a name in order to join the tournament.": "Tu dois avoir un nom pour rejoindre le tournoi.", // NEEDS QC
	"The tournament is already at maximum capacity for users.": "Le tournoi a déjà atteint sa capacité maximale.", // NEEDS QC
	"You have already been disqualified.": "Tu as déjà été disqualifié.", // NEEDS QC
	"This user has already been disqualified.": "Cet utilisateur a déjà été disqualifié.", // NEEDS QC
	"You are banned from entering tournaments.": "Tu es banni des tournois.", // NEEDS QC
	"Unknown error: {ERROR}": "Erreur inconnue : {ERROR}", // NEEDS QC
	"Waiting for battles to become available...": "En attente de combats disponibles...", // NEEDS QC
	"vs. {PLAYER}": "vs. {PLAYER}", // NEEDS QC
	"Or wait for {PLAYERS} to challenge you.": "Ou attends que {PLAYERS} te défie.", // NEEDS QC
	"Waiting for {PLAYERS} to challenge you.": "En attente que {PLAYERS} te défie.", // NEEDS QC
	"Waiting for {PLAYER}...": "En attente de {PLAYER}...", // NEEDS QC
	"Unavailable": "Indisponible", // NEEDS QC
	"Waiting": "En attente", // NEEDS QC
	"Challenging": "Défi en cours", // NEEDS QC

	// TRANSLATORS: command errors
	"This player does not exist or is not online.": "Ce joueur n'existe pas ou n'est pas en ligne.", // NEEDS QC
	"This command can only be used in proper chat rooms.": "Cette commande ne peut être utilisée que dans un vrai salon de discussion.", // NEEDS QC
	"Error: corrupted ranking data": "Erreur : données de classement corrompues", // NEEDS QC
	"You are not in a battle": "Tu n'es pas dans un combat", // NEEDS QC
	"Invalid turn number: {NUMBER}": "Numéro de tour invalide : {NUMBER}", // NEEDS QC
	"Turn navigation is disabled in hardcore mode.": "La navigation entre les tours est désactivée en mode hardcore.", // NEEDS QC
	"You are not a player in this battle": "Tu n'es pas un joueur de ce combat", // NEEDS QC
	"Can only be used in a DM.": "Utilisable uniquement en MP.", // NEEDS QC
	"Please wait 5 seconds before challenging again.": "Attends 5 secondes avant de défier à nouveau.", // NEEDS QC

	// #endregion Chat

	// #region Teambuilder
	// ==================================================================

	// TRANSLATORS: This is for the Teams list view so it can't be singular
	// TRANSLATORS: Should be something like "Teams List" if you have no singular
	// TRANSLATORS: Can be different from TL.term.teams, which "Teams" as in "plural of Team"
	"Teams": "Équipes", // NEEDS QC
	"[New team]": "Nouvelle équipe", // NEEDS QC
	"[New team in folder]": "Nouvelle équipe dans le dossier", // NEEDS QC
	"[New {FORMAT} team]": "Nouvelle équipe {FORMAT}", // NEEDS QC
	"[New box]": "Nouvelle boîte", // NEEDS QC
	// TRANSLATORS: When deleting a folder, button to add folder name to all teams in it
	"[Convert to prefix]": "Mettre le nom du dossier en préfixe", // NEEDS QC
	"[(add folder)]": "(ajouter un dossier)", // NEEDS QC
	"[(add format folder)]": "(ajouter un dossier de format)", // NEEDS QC
	"Names can't contain slashes, since they're used as a folder separator.": "Les noms ne peuvent pas contenir de barres obliques, car elles servent de séparateur de dossiers.", // NEEDS QC
	"Names can't contain the character |, since they're used for storing teams.": "Les noms ne peuvent pas contenir le caractère |, car il sert à enregistrer les équipes.", // NEEDS QC
	"New name required": "Nouveau nom requis", // NEEDS QC
	"Not in a folder": "Pas dans un dossier", // NEEDS QC
	"Teams not in any folders": "Équipes sans dossier", // NEEDS QC
	"All teams": "Toutes les équipes", // NEEDS QC
	"Folders": "Dossiers", // NEEDS QC

	// TRANSLATORS: for Clipboard actions
	"Copied!": "Copié !", // NEEDS QC
	"[Paste copy here]": "Coller la copie ici", // NEEDS QC
	"[Add to clipboard]": "Ajouter au presse-papiers", // NEEDS QC
	"[Copy/Move]": "Copier/Déplacer", // NEEDS QC
	"[+ Clipboard]": "+ Presse-papiers", // NEEDS QC
	"[Deselect]": "Désélectionner", // NEEDS QC
	"[Move here]": "Déplacer ici", // NEEDS QC

	// TRANSLATORS: for Import/Export
	"[Backup]": "Sauvegarder", // NEEDS QC
	"[Backup search results]": "Sauvegarder les résultats", // NEEDS QC
	"[Backup folder]": "Sauvegarder le dossier", // NEEDS QC
	"Import/Export": "Import/Export", // NEEDS QC
	"[Import/Export]": "Import/Export", // NEEDS QC
	"[Import]": "Importer", // NEEDS QC
	"(can't save partial exports)": "(impossible d'enregistrer un export partiel)", // NEEDS QC

	// TRANSLATORS: for uploaded teams
	"Account": "Compte", // NEEDS QC
	"Account (public)": "Compte (public)", // NEEDS QC
	"Local": "Local", // NEEDS QC
	"Uploaded": "Téléversé", // NEEDS QC
	"[Upload for shareable URL]": "Mettre en ligne pour une URL partageable", // NEEDS QC
	"[Upload for shareable/searchable URL]": "Mettre en ligne pour une URL partageable et trouvable", // NEEDS QC
	"Disconnected (wrong account?)": "Déconnecté (mauvais compte ?)", // NEEDS QC
	"[Revert to uploaded version]": "Revenir à la version en ligne", // NEEDS QC
	"[Compare]": "Comparer", // NEEDS QC
	"[Upload changes]": "Envoyer les modifications", // NEEDS QC
	"Team was deleted": "L'équipe a été supprimée", // NEEDS QC
	"Team doesn't exist": "L'équipe n'existe pas", // NEEDS QC
	"Untitled team": "Équipe sans nom", // NEEDS QC
	"Uploaded by": "Téléversée par", // NEEDS QC
	"Views": "Vues", // NEEDS QC
	"Team deleted": "Équipe supprimée", // NEEDS QC
	"Not found": "Introuvable", // NEEDS QC

	// TRANSLATORS: for the team editor
	"[Add Pokémon]": "Ajouter un Pokémon", // NEEDS QC
	"(choose ability)": null, // NEEDS TRANSLATION
	"Details": "Détails", // NEEDS QC
	// TRANSLATORS: Teambuilder "form" with text boxes inside, not form/forme "form" of a pokemon
	"Form": "Formulaire", // NEEDS QC
	"Tera": "Téra", // NEEDS QC
	// TRANSLATORS: These two are for Hidden Power type
	// TRANSLATORS: They're both designed to take up very little width, so keep that in mind
	"H.P.": "P.C.", // NEEDS QC
	"H. Power": "P. Cachée", // NEEDS QC
	"Defensive coverage": "Couverture défensive", // NEEDS QC
	"Teambuilding resources for {FORMAT}": "Ressources de teambuilding pour {FORMAT}", // NEEDS QC
	"[See all]": "Tout voir", // NEEDS QC
	"Search species or filter by type, learnable moves, ability, tier, or egg group": "Chercher un Pokémon ou filtrer par type, capacités apprises, talent, tier ou groupe d'Œufs", // NEEDS QC
	"Search abilities": "Chercher un talent", // NEEDS QC
	"Search items": "Chercher un objet", // NEEDS QC
	"Search moves or filter by type or category": "Chercher une capacité ou filtrer par type ou catégorie", // NEEDS QC
	"Sample sets": "Sets d'exemple", // NEEDS QC
	"Box sets": "Sets de la Boîte", // NEEDS QC
	"Guessed spread": "Répartition estimée", // NEEDS QC
	"(Please choose 4 moves to get a guessed spread)": "(Choisis 4 capacités pour obtenir une répartition estimée)", // NEEDS QC
	"Protip": "Astuce", // NEEDS QC
	"Use a different nature to save {NUMBER} EVs:": "Utilise une autre nature pour économiser {NUMBER} EV :", // NEEDS QC
	"Use a different nature to get higher stats:": "Utilise une autre nature pour de meilleures stats :", // NEEDS QC
	"Natures cannot raise or lower HP.": "Les natures ne peuvent pas augmenter ni réduire les PV.", // NEEDS QC
	// TRANSLATORS: {STATCHANGES} is +stat/-stat
	"{STATCHANGES} nature": "Nature {STATCHANGES}", // NEEDS QC
	// TRANSLATORS: {1} and {2} are the + and - keyboard keys
	"You can also set natures by typing {1} and {2} in the EV box.": "Tu peux aussi définir la nature en tapant {1} et {2} dans le champ des EVs.", // NEEDS QC
	"Pasted team": "Équipe collée", // NEEDS QC
	"Zoom out forms": "Dézoomer les formulaires", // NEEDS QC
	"Compact": "Compact", // NEEDS QC
	"Comfortable": "Confortable", // NEEDS QC
	"Zoom out search results": "Dézoomer les résultats de recherche", // NEEDS QC
	"Fetching Paste...": "Récupération du Paste...", // NEEDS QC
	"Import/Export set": "Importer/exporter le set", // NEEDS QC
	"IV spreads": "Répartitions d'IV", // NEEDS QC
	"min Atk": "Atq min", // NEEDS QC
	"min Atk, min Spe": "Atq min, Vit min", // NEEDS QC
	"max all": "tout max", // NEEDS QC
	"min Spe": "Vit min", // NEEDS QC
	"Hidden Power {TYPE} IVs": "IV pour Puissance Cachée {TYPE}", // NEEDS QC
	"EVs, IVs, and nature": "EVs, IVs et nature", // NEEDS QC
	"Base": "Base", // NEEDS QC
	"Remaining": "Restant", // NEEDS QC

	// TRANSLATORS: errors
	"You must select a format first.": "Tu dois d'abord choisir un format.", // NEEDS QC
	"This team is for a different account. Please log into the correct account to update it.": "Cette équipe appartient à un autre compte. Connecte-toi au bon compte pour la mettre à jour.", // NEEDS QC
	"Add a Pokémon to your team before uploading it.": "Ajoute un Pokémon à ton équipe avant de l'envoyer.", // NEEDS QC
	"Must use on an uploaded team.": "Utilisable uniquement sur une équipe envoyée.", // NEEDS QC
	"Team not found: {INPUT}": "Équipe introuvable : {INPUT}", // NEEDS QC
	"Your file \"{FILENAME}\" is not a valid team.": "Ton fichier « {FILENAME} » n'est pas une équipe valide.", // NEEDS QC

	// #endregion Teambuilder

	// #region Ladder
	// ==================================================================

	"[All formats]": "Tous les formats", // NEEDS QC
	"[How the ladder works]": "Fonctionnement du classement", // NEEDS QC
	"[Seasonal rankings]": "Classements saisonniers", // NEEDS QC
	"[Look up a specific user's rating]": "Consulter le classement d'un utilisateur précis", // NEEDS QC
	"Name": "Nom", // NEEDS QC
	"Elo rating": "Classement Elo", // NEEDS QC
	"user's percentage chance of winning a random battle (Glicko X-Act Estimate)": "probabilité estimée de gagner un combat aléatoire (estimation Glicko X-Act)", // NEEDS QC
	"Glicko-1 rating system: rating±deviation (provisional if deviation>100)": "Système de classement Glicko-1 : classement±déviation (provisoire si déviation>100)", // NEEDS QC
	"No one has played any ranked games yet.": "Personne n'a encore joué de partie classée.", // NEEDS QC

	// #endregion Ladder

	// #region Misc rooms
	// ==================================================================

	"[Join the Help room for live help]": "Obtenir de l'aide dans le salon Help", // NEEDS QC
	"Unrecognized command: {INPUT}": "Commande non reconnue : {INPUT}", // NEEDS QC

	// #endregion Misc rooms
};
