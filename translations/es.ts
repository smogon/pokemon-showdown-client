// Remember, comments starting with "TRANSLATORS:" are from Showdown,
// and are shared between all translations. But other comments can be
// used as notes to yourself or other translators, and are specific
// to the Spanish translation.

// This translation defaults to European Spanish (the only official
// Pokémon localization); Latin American alternatives are noted inline.

import type { UIText } from '../build-tools/translations.mts';
export const translations: UIText = {
	// #region Navigation
	// ==================================================================

	// TRANSLATORS: Note that "Home" and "Main Menu" refer to the same place
	// TRANSLATORS: So it's fine if they're the same word in your language
	"Home": "Inicio", // NEEDS QC
	// TRANSLATORS: This is used as a "Back to Home" button after battles
	"[Main menu]": "Menú principal", // NEEDS QC
	// TRANSLATORS: It's fine if "Teambuilder" and "Teams" are the same word in your language
	// TRANSLATORS: Also consider something like "Edit teams" for "Teambuilder"
	"Teambuilder": "Editor de equipos", // NEEDS QC
	// Spanish Showdown players often keep "ladder" untranslated;
	// "Clasificación" is clearest for the rankings page this opens
	"Ladder": "Clasificación", // NEEDS QC
	"Tournaments": "Torneos", // NEEDS QC
	"Friends": "Amigos", // NEEDS QC
	"Chat rooms": "Salas de chat", // NEEDS QC
	"Battles": "Combates", // NEEDS QC
	"News": "Noticias", // NEEDS QC
	"Offline": "Sin conexión", // NEEDS QC
	"[Join chat]": "Unirse al chat", // NEEDS QC
	"[All tabs]": "Todas las pestañas", // NEEDS QC
	"[Menu]": "Menú", // NEEDS QC

	// #endregion Navigation

	// #region Generic UI
	// ==================================================================

	"[Hide]": "Ocultar", // NEEDS QC
	"[Close]": "Cerrar", // NEEDS QC
	"[Done]": "Hecho", // NEEDS QC
	"[Back]": "Volver", // NEEDS QC
	// TRANSLATORS: A computer copy command, like Ctrl+C
	"[Copy]": "Copiar", // NEEDS QC
	"[Edit]": "Editar", // NEEDS QC
	"[Delete]": "Eliminar", // NEEDS QC
	"[Undo delete]": "Deshacer eliminación", // NEEDS QC
	// TRANSLATORS: "DM" is used to label DMs; "[Chat]" is the button to send a DM
	// TRANSLATORS: Feel free to use the same word for both (and for "Chat" in the Battle section)
	"DM": "MD", // NEEDS QC
	"[Chat]": "Chatear", // NEEDS QC
	"[OK]": "Aceptar", // NEEDS QC
	"[Cancel]": "Cancelar", // NEEDS QC
	"[Accept]": "Aceptar", // NEEDS QC
	"[Reject]": "Rechazar", // NEEDS QC
	"Random team": "Equipo aleatorio", // NEEDS QC
	"[Sound]": "Sonido", // NEEDS QC
	"[Options]": "Opciones", // NEEDS QC
	"[Battle options]": "Opciones de combate", // NEEDS QC
	"[Revert]": "Revertir", // NEEDS QC
	"[Refresh]": "Actualizar", // NEEDS QC
	"[Search]": "Buscar", // NEEDS QC
	"[Validate]": "Validar", // NEEDS QC
	"[Reconnect]": "Reconectar", // NEEDS QC
	"Disconnected": "Desconectado", // NEEDS QC
	"Connecting...": "Conectando...", // NEEDS QC
	"Loading...": "Cargando...", // NEEDS QC
	"Uploading...": "Subiendo...", // NEEDS QC
	"[Change]": "Cambiar", // NEEDS QC
	"[Add]": "Añadir", // NEEDS QC
	"[Look up]": "Buscar", // NEEDS QC
	"[Save changes]": "Guardar", // NEEDS QC
	"[Create]": "Crear", // NEEDS QC
	"[Rename]": "Renombrar", // NEEDS QC
	"[Remove]": "Quitar", // NEEDS QC
	// TRANSLATORS: intentionally chosen to be very short. do not go longer than three letters for this one
	"Gen {NUMBER}": "{NUMBER}.ª Gen", // NEEDS QC
	"[Maximize]": "Maximizar", // NEEDS QC
	"[Expand/collapse]": "Expandir/contraer", // NEEDS QC

	// TRANSLATORS: connection/team-storage errors
	"Sorry, psim connections are unsupported by your browser.": "Lo sentimos, tu navegador no admite conexiones psim.", // NEEDS QC
	"Your browser doesn't support third-party cookies. Some things might not work correctly.": "Tu navegador no admite cookies de terceros. Puede que algunas cosas no funcionen correctamente.", // NEEDS QC
	"Your team storage format is too old for PS. You'll need to upgrade it at {URL}": "El formato de almacenamiento de tus equipos es demasiado antiguo para PS. Tendrás que actualizarlo en {URL}", // NEEDS QC
	"Error loading uploaded teams: {ERROR}": "Error al cargar los equipos subidos: {ERROR}", // NEEDS QC
	"Error unknown. Try again later.": "Error desconocido. Inténtalo de nuevo más tarde.", // NEEDS QC
	"Failed to load team: {ERROR}": "No se pudo cargar el equipo: {ERROR}", // NEEDS QC
	"Error logging in.": "Error al iniciar sesión.", // NEEDS QC
	"Something is interfering with our connection to the login server. Most likely, your internet provider needs you to re-log-in, or your internet provider is blocking Pokémon Showdown.": "Algo está interfiriendo con nuestra conexión al servidor de inicio de sesión. Lo más probable es que tu proveedor de internet necesite que vuelvas a iniciar sesión, o que esté bloqueando Pokémon Showdown.", // NEEDS QC

	// TRANSLATORS: for constructing lists
	"{FIRST} or {SECOND}": "{FIRST} o {SECOND}", // NEEDS QC
	"{FIRST} and {SECOND}": "{FIRST} y {SECOND}", // NEEDS QC
	", {NEXT}": ", {NEXT}", // NEEDS QC
	", or {LAST}": " o {LAST}", // NEEDS QC
	", and {LAST}": " y {LAST}", // NEEDS QC
	// TRANSLATORS: this is for lists of users specifically
	// TRANSLATORS: (languages with counters should use the "person" counter)
	", and {NUMBER} others": " y {NUMBER} más", // NEEDS QC

	// #endregion Generic UI

	// #region Popups
	// ==================================================================

	// TRANSLATORS: user popup
	// TRANSLATORS: "Global {RANK}" is a rank, like "Global Moderator"
	"Global {RANK}": "{RANK} global", // NEEDS QC
	"Chatrooms": "Salas", // NEEDS QC
	"Private rooms": "Salas privadas", // NEEDS QC
	"OFFLINE": "SIN CONEXIÓN", // NEEDS QC
	"Username": "Nombre de usuario", // NEEDS QC
	"[Register]": "Registrarse", // NEEDS QC
	"[Add status]": "Añadir estado", // NEEDS QC
	"[Chat self]": "Chatear contigo mismo", // NEEDS QC
	"[Change name]": "Cambiar nombre", // NEEDS QC
	"[Log out]": "Cerrar sesión", // NEEDS QC
	"[Add friend]": "Añadir amigo", // NEEDS QC
	"[Unignore]": "Dejar de ignorar", // NEEDS QC
	"[Ignore]": "Ignorar", // NEEDS QC
	"[Report]": "Denunciar", // NEEDS QC
	"[Mute]": "Silenciar", // NEEDS QC
	"[7m]": "7 min", // NEEDS QC
	"[Hourmute]": "Silenciar 1 hora", // NEEDS QC
	"[1h]": "1 h", // NEEDS QC
	"[Ban]": "Expulsar", // NEEDS QC
	"[2d]": "2 días", // NEEDS QC
	"[Weekban]": "Expulsar 1 semana", // NEEDS QC
	"[1w]": "1 sem.", // NEEDS QC
	"[Modlog]": "Registro de moderación", // NEEDS QC
	// TRANSLATORS: Showdown term for a global mute
	"[Lock]": "Bloquear", // NEEDS QC
	"[Weeklock]": "Bloquear 1 semana", // NEEDS QC
	"[Namelock]": "Bloquear nombre", // NEEDS QC
	"[Global modlog]": "Registro de moderación global", // NEEDS QC
	"[Avatar...]": "Avatar...", // NEEDS QC
	"[Close room]": "Cerrar sala", // NEEDS QC
	"[Report a user]": "Denunciar a un usuario", // NEEDS QC
	"({NUMBER} sec)": "({NUMBER} s)", // NEEDS QC
	"Room not found": "Sala no encontrada", // NEEDS QC

	// TRANSLATORS: battle options
	"Side-by-side, controls below": "Lado a lado, controles debajo", // NEEDS QC
	"Side-by-side, overlay controls": "Lado a lado, controles superpuestos", // NEEDS QC
	"Top-and-bottom, controls below": "Apilado, controles debajo", // NEEDS QC
	"Top-and-bottom, overlay controls": "Apilado, controles superpuestos", // NEEDS QC
	"Scrolling, controls below": "Desplazamiento, controles debajo", // NEEDS QC
	"Scrolling, overlay controls": "Desplazamiento, controles superpuestos", // NEEDS QC
	"Hardcore mode ON: Information not available in-game is now hidden.": "Modo hardcore activado: la información no disponible en el juego ahora está oculta.", // NEEDS QC
	"Hardcore mode OFF: Information not available in-game is now shown.": "Modo hardcore desactivado: la información no disponible en el juego ahora está visible.", // NEEDS QC
	"Spectators ignored.": "Espectadores ignorados.", // NEEDS QC
	"Spectators no longer ignored.": "Ya no se ignora a los espectadores.", // NEEDS QC
	"In this battle": "En este combate", // NEEDS QC
	"Hardcore mode (hide info not shown in-game)": "Modo hardcore (ocultar información no visible en el juego)", // NEEDS QC
	"Ignore spectators": "Ignorar espectadores", // NEEDS QC
	"Ignore opponent": "Ignorar al oponente", // NEEDS QC
	"Ignore nicknames": "Ignorar motes", // NEEDS QC
	"All battles": "Todos los combates", // NEEDS QC
	"Layout": "Disposición", // NEEDS QC
	"Automatic ({SETTING})": "Automática ({SETTING})", // NEEDS QC
	"Automatic": "Automática", // NEEDS QC
	"(DESKTOP)": "(ESCRITORIO)", // NEEDS QC
	"(MOBILE VERTICAL)": "(MÓVIL VERTICAL)", // NEEDS QC
	"(MOBILE HORIZONTAL)": "(MÓVIL HORIZONTAL)", // NEEDS QC
	"You can still invite spectators by giving them the URL or using the /invite command": "Aún puedes invitar espectadores dándoles la URL o con el comando /invite", // NEEDS QC
	"Invite only (hide from Battles list)": "Solo por invitación (ocultar de la lista de combates)", // NEEDS QC
	"Ignore Pokémon nicknames": "Ignorar los motes de los Pokémon", // NEEDS QC
	"Automatically start timer": "Iniciar el temporizador automáticamente", // NEEDS QC
	"Hardcore mode": "Modo hardcore", // NEEDS QC
	"Start at turn 0 when spectating battles": "Empezar en el turno 0 al ver combates", // NEEDS QC
	"Open new battles in the right-side panel": "Abrir combates nuevos en el panel derecho", // NEEDS QC

	// TRANSLATORS: options
	"General": "General", // NEEDS QC
	"Language": "Idioma", // NEEDS QC
	"Appearance": "Apariencia", // NEEDS QC
	"Theme": "Tema", // NEEDS QC
	"Light": "Claro", // NEEDS QC
	"Dark": "Oscuro", // NEEDS QC
	"Match system theme": "Seguir el tema del sistema", // NEEDS QC
	"Two panels (if wide enough)": "Dos paneles (si hay espacio)", // NEEDS QC
	"Single panel": "Panel único", // NEEDS QC
	"Vertical tabs": "Pestañas verticales", // NEEDS QC
	"Background": "Fondo", // NEEDS QC
	"Disable animations": "Desactivar animaciones", // NEEDS QC
	"Use 2D sprites instead of 3D models": "Usar sprites 2D en lugar de modelos 3D", // NEEDS QC
	"Use modern sprites for past generations": "Usar sprites modernos para generaciones pasadas", // NEEDS QC
	"Block DMs": "Bloquear MD", // NEEDS QC
	"Block challenges": "Bloquear retos", // NEEDS QC
	"Show DMs in chatrooms": "Mostrar MD en las salas de chat", // NEEDS QC
	"Do not highlight when your name is said in chat": "No resaltar cuando digan tu nombre en el chat", // NEEDS QC
	"Confirm before leaving a room": "Confirmar antes de salir de una sala", // NEEDS QC
	"Confirm before refreshing": "Confirmar antes de actualizar", // NEEDS QC
	"Always notify": "Notificar siempre", // NEEDS QC
	"Notify when joined": "Notificar si participas", // NEEDS QC
	"Hide": "Ocultar", // NEEDS QC
	"Timestamps": "Marcas de tiempo", // NEEDS QC
	"Off": "Desactivadas", // NEEDS QC
	"Timestamps in DMs": "Marcas de tiempo en MD", // NEEDS QC
	"Chat preferences": "Preferencias del chat", // NEEDS QC
	"[Change background]": "Cambiar fondo", // NEEDS QC
	"[Text formatting...]": "Formato de texto...", // NEEDS QC
	"[Set as background]": "Establecer como fondo", // NEEDS QC
	"[Random]": "Aleatorio", // NEEDS QC

	// TRANSLATORS: team chooser
	"(uncategorized)": "(sin categoría)", // NEEDS QC
	"(all)": "(todos)", // NEEDS QC
	"[Other gens]": "Otras generaciones", // NEEDS QC
	"Select a team": "Elegir un equipo", // NEEDS QC
	"This team selector is no longer available (the challenge was cancelled or something).": "Este selector de equipos ya no está disponible (el reto se canceló o algo así).", // NEEDS QC
	"No teams found": "No se encontraron equipos", // NEEDS QC
	"This format selector is no longer available.": "Este selector de formatos ya no está disponible.", // NEEDS QC
	"Search formats": "Buscar formatos", // NEEDS QC

	// TRANSLATORS: login
	"[Choose name]": "Elegir nombre", // NEEDS QC
	"Logging in...": "Iniciando sesión...", // NEEDS QC
	"[Log in]": "Iniciar sesión", // NEEDS QC
	"[Try another name]": "Probar otro nombre", // NEEDS QC
	"[Password...]": "Contraseña...", // NEEDS QC
	"[Change password]": "Cambiar contraseña", // NEEDS QC
	"[Show password]": "Mostrar contraseña", // NEEDS QC
	"Loading Google log-in button...": "Cargando el botón de inicio de sesión de Google...", // NEEDS QC
	"(color)": "(color)", // NEEDS QC
	"(Others will be able to see your name change. To change name privately, use \"Log out\")": "(Los demás verán tu cambio de nombre. Para cambiarlo en privado, usa \"Cerrar sesión\")", // NEEDS QC
	"if you registered this name:": "si registraste este nombre:", // NEEDS QC
	"if not:": "si no:", // NEEDS QC
	"This is someone else's account. Sorry.": "Esta cuenta es de otra persona. Lo sentimos.", // NEEDS QC
	"Password": "Contraseña", // NEEDS QC

	// TRANSLATORS: register / change password
	"All fields are required": "Todos los campos son obligatorios", // NEEDS QC
	"Passwords do not match": "Las contraseñas no coinciden", // NEEDS QC
	"Your password was successfully changed!": "¡Tu contraseña se ha cambiado correctamente!", // NEEDS QC
	"Change your password:": "Cambia tu contraseña:", // NEEDS QC
	"Old password": "Contraseña anterior", // NEEDS QC
	"New password": "Contraseña nueva", // NEEDS QC
	"New password (confirm)": "Contraseña nueva (confirmar)", // NEEDS QC
	"You have been successfully registered.": "Te has registrado correctamente.", // NEEDS QC
	"Register your account:": "Registra tu cuenta:", // NEEDS QC
	"Password (confirm)": "Contraseña (confirmar)", // NEEDS QC
	"An Electric-type mouse that is the mascot of the Pokémon franchise.": "Un ratón de tipo Eléctrico, la mascota de la franquicia Pokémon.", // NEEDS QC
	"What is this Pokémon?": "¿Quién es ese Pokémon?", // NEEDS QC

	// #endregion Popups

	// #region Main Menu
	// ==================================================================

	// TRANSLATORS: Our famous ladder queue button. Give it some flair :)
	// TRANSLATORS: Might we suggest "Showdown!"
	"[Battle!]": "¡A luchar!", // NEEDS QC
	"Find a random opponent": "Buscar un rival al azar", // NEEDS QC
	"Watch a battle": "Ver un combate", // NEEDS QC
	"Find a user": "Buscar un usuario", // NEEDS QC
	"Info & Resources": "Información y recursos", // NEEDS QC
	"Lobby chat": "Chat del lobby", // NEEDS QC

	// TRANSLATORS: Challenge/Search UI
	"[Challenge]": "Retar", // NEEDS QC
	"Custom rules": "Reglas personalizadas", // NEEDS QC
	// TRANSLATORS: Search countdown. {NUMBER} = a number of seconds
	// TRANSLATORS: English doesn't include the unit (seconds) but your language can
	"Searching in {NUMBER}...": "Buscando en {NUMBER} s...", // NEEDS QC
	"Searching...": "Buscando rival...", // NEEDS QC
	"Pokédex": "Pokédex", // NEEDS QC
	"Replays": "Repeticiones", // NEEDS QC
	"Forum": "Foro", // NEEDS QC
	"Rules": "Reglas", // NEEDS QC
	"Credits": "Créditos", // NEEDS QC
	"Privacy": "Privacidad", // NEEDS QC
	"background by {ARTIST}": "fondo de {ARTIST}", // NEEDS QC

	// TRANSLATORS: errors
	"Wait for this countdown to finish first...": "Espera primero a que termine la cuenta atrás...", // NEEDS QC
	"You're already searching for a {FORMAT} battle...": "Ya estás buscando un combate de {FORMAT}...", // NEEDS QC
	"You need to go into the Teambuilder and build a team for this format.": "Tienes que ir al Teambuilder y crear un equipo para este formato.", // NEEDS QC

	// #endregion Main Menu

	// #region Rooms
	// ==================================================================

	// TRANSLATORS: these go under the user/battle counts, and in English they read as "100 users online"
	// TRANSLATORS: but they don't have to work that way in your language
	// short label forms to fit the count boxes; "usuarios en línea" /
	// "combates en curso" were too wide
	"users online": "conectados", // NEEDS QC
	"active battles": "combates", // NEEDS QC
	"Find an online user": "Buscar un usuario en línea", // NEEDS QC
	"Watch an active battle": "Ver un combate en curso", // NEEDS QC
	"Meloetta is PS's mascot! The Aria forme is about using its voice, and represents our chatrooms.": "¡Meloetta es la mascota de PS! La Forma Lírica usa su voz y representa nuestras salas de chat.", // NEEDS QC
	"Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles.": "¡Meloetta es la mascota de PS! La Forma Danza es de tipo Lucha y representa nuestros combates.", // NEEDS QC

	"Official chat rooms": "Salas de chat oficiales", // NEEDS QC
	"Hidden rooms": "Salas ocultas", // NEEDS QC

	"Subrooms": "Subsalas", // NEEDS QC
	"(All rooms)": "(Todas las salas)", // NEEDS QC
	"Join or search for rooms": "Únete o busca salas", // NEEDS QC
	"Command": "Comando", // NEEDS QC
	"Console": "Consola", // NEEDS QC
	"Enter = run command {INPUT}": "Intro = ejecutar el comando {INPUT}", // NEEDS QC
	"(Subroom of {ROOM})": "(Subsala de {ROOM})", // NEEDS QC
	"Possible secret room": "Posible sala secreta", // NEEDS QC
	"(Private room?)": "(¿Sala privada?)", // NEEDS QC
	"Search results": "Resultados de búsqueda", // NEEDS QC

	// #endregion Rooms

	// #region Battle
	// ==================================================================

	// TRANSLATORS: Note that most translations of battle UI are in the server repository
	// TRANSLATORS: In data/text/[lang]/default.ts and data/text/[lang]/names.ts

	// TRANSLATORS: [Team]/[Battle]/[Switch]/[Shift] are buttons in overlay controls
	// TRANSLATORS: But they're section headers in normal battle controls
	// TRANSLATORS: For the "Use move" menu in battle controls
	// TRANSLATORS: This was "Attack" in older Showdown, "FIGHT" on older cart, and "Battle" on modern cart
	// SV battle menu: Luchar
	"[Battle]": "Luchar", // NEEDS QC
	// TRANSLATORS: For the "Switch" menu in battle controls
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Switch]": "Cambiar", // NEEDS QC
	// TRANSLATORS: For the Team Preview menu in battle controls
	// TRANSLATORS: Also replaces "[Switch]" in phases where switching isn't possible
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Team]": "Equipo", // NEEDS QC
	// TRANSLATORS: The Triples "move to center" button
	// TRANSLATORS: This is "SHIFT" on older cart; Triples doesn't exist on modern cart
	// ORAS battle menu (the last games with Triples): Mover
	"[Shift]": "Mover", // NEEDS QC

	// TRANSLATORS: Mobile-layout buttons for switching between the battle view and the chat view
	// TRANSLATORS: ("Chat" is also used as a section header in the options popup)
	"Battle": "Combate", // NEEDS QC
	"Chat": "Chat", // NEEDS QC
	"[Try Fight button]": "Probar el botón Luchar", // NEEDS QC
	// TRANSLATORS: For the "where to target this move" menu
	"(empty slot)": "(hueco vacío)", // NEEDS QC
	"Maxed with no max moves": "No hay movimientos Dinamax disponibles", // NEEDS QC
	"No Z moves": "No hay movimientos Z", // NEEDS QC

	"[Rematch]": "Revancha", // NEEDS QC
	"[Offer tie]": "Ofrecer empate", // NEEDS QC
	"[Forfeit]": "Rendirse", // NEEDS QC
	"[Forfeit and close]": "Rendirse y cerrar", // NEEDS QC
	"[Replace player]": "Sustituir jugador", // NEEDS QC
	"[Replace]": "Sustituir", // NEEDS QC
	"(turn 100+)": "(turno 100+)", // NEEDS QC
	"[Stop timer]": "Parar el temporizador", // NEEDS QC
	"[Start timer]": "Iniciar el temporizador", // NEEDS QC
	"Enter player's name": "Escribe el nombre del jugador", // NEEDS QC
	"Cannot replace player, battle has already ended.": "No se puede sustituir al jugador, el combate ya ha terminado.", // NEEDS QC

	// TRANSLATORS: for replay controls
	"[Play]": "Reproducir", // NEEDS QC
	"[Pause]": "Pausa", // NEEDS QC
	"[First turn]": "Primer turno", // NEEDS QC
	"[Prev turn]": "Turno anterior", // NEEDS QC
	"[Skip turn]": "Turno siguiente", // NEEDS QC
	"[Skip to end]": "Ir al final", // NEEDS QC
	"[Switch viewpoint]": "Cambiar de perspectiva", // NEEDS QC
	"[Go to turn]": "Ir al turno", // NEEDS QC
	"[Skip]": "Saltar", // NEEDS QC
	"[Skip animation]": "Saltar animación", // NEEDS QC
	"[Move to center]": "Moverse al centro", // NEEDS QC
	"[Upload and share replay]": "Subir y compartir la repetición", // NEEDS QC
	"[Replay]": "Repetición", // NEEDS QC
	"(closes this battle)": "(cierra este combate)", // NEEDS QC

	// TRANSLATORS: for the battle list
	"Minimum Elo": "Elo mínimo", // NEEDS QC
	"rated {ELO}": "puntuación {ELO}", // NEEDS QC
	// TRANSLATORS: goes between two usernames; the key includes its surrounding spacing so some languages can drop it
	"{PLAYER1} vs. {PLAYER2}": "{PLAYER1} vs. {PLAYER2}", // NEEDS QC
	"(All formats)": "(Todos los formatos)", // NEEDS QC
	"Username prefix": "Prefijo del nombre de usuario", // NEEDS QC
	"No battles are going on": "No hay combates en curso", // NEEDS QC
	"{NUMBER} battle": "{NUMBER} combate", // NEEDS QC
	"{NUMBER} battles": "{NUMBER} combates", // NEEDS QC
	"None": "Ninguno", // NEEDS QC
	"Timer": "Temporizador", // NEEDS QC
	"Error": "Error", // NEEDS QC
	"The battle you're looking for has expired. Battles expire after 15 minutes of inactivity unless they're saved.": "El combate que buscas ha caducado. Los combates caducan tras 15 minutos de inactividad si no se guardan.", // NEEDS QC
	"In the future, remember to click \"Save replay\" to save a replay permanently.": "En el futuro, recuerda pulsar \"Guardar repetición\" para guardar una repetición de forma permanente.", // NEEDS QC
	"Unrecognized HTML file: Only replay files are supported.": "Archivo HTML no reconocido: solo se admiten archivos de repetición.", // NEEDS QC
	"You are still in {ROOM}": "Todavía estás en {ROOM}", // NEEDS QC
	"Battle \"{INPUT}\" not found": "Combate \"{INPUT}\" no encontrado", // NEEDS QC
	"Uploaded replay": "Repetición subida", // NEEDS QC
	"Team {PLAYER}": "Equipo {PLAYER}", // NEEDS QC
	"{PLAYER} and friends": "{PLAYER} y compañía", // NEEDS QC

	// TRANSLATORS: battle log messages
	"[Earlier messages]": "Mensajes anteriores", // NEEDS QC
	"Register an account to protect your ladder rating!": "¡Registra una cuenta para proteger tu puntuación en la clasificación!", // NEEDS QC
	"Open team sheet for {PLAYER}": "Abrir la hoja de equipo de {PLAYER}", // NEEDS QC
	"Warning": "Advertencia", // NEEDS QC
	"Variation": "Variante", // NEEDS QC
	"Rated battle": "Combate puntuado", // NEEDS QC

	// TRANSLATORS: screen reader labels
	"Active Pokémon": "Pokémon activo", // NEEDS QC
	"Your team": "Tu equipo", // NEEDS QC
	"Opponent's team": "Equipo del oponente", // NEEDS QC
	"Statused": "Con problema de estado", // NEEDS QC
	"Non-statused": "Sin problema de estado", // NEEDS QC
	"Unrevealed Illusion user": "Usuario de Ilusión sin revelar", // NEEDS QC
	"Not revealed": "Sin revelar", // NEEDS QC
	"Battle controls": "Controles del combate", // NEEDS QC

	// #endregion Battle

	// #region Chat
	// ==================================================================

	"{NUMBER} user": "{NUMBER} usuario", // NEEDS QC
	"{NUMBER} users": "{NUMBER} usuarios", // NEEDS QC
	"[Join]": "Unirse", // NEEDS QC
	"[Leave]": "Salir", // NEEDS QC
	"[Ready!]": "¡Listo!", // NEEDS QC
	"In progress": "En curso", // NEEDS QC
	"Signups": "Inscripciones", // NEEDS QC
	"[Pop-out]": "Ventana aparte", // NEEDS QC
	"[Go]": "Ir", // NEEDS QC
	"[Visit]": "Abrir", // NEEDS QC
	"[Choose a name before sending messages]": "Elige un nombre antes de enviar mensajes", // NEEDS QC
	"Challenging...": "Desafiando...", // NEEDS QC
	"Accepting...": "Aceptando...", // NEEDS QC
	"[Commands]": "Comandos", // NEEDS QC
	"Mentioned by {USER} in {ROOM}": "{USER} te ha mencionado en {ROOM}", // NEEDS QC
	"{USERS} joined": "Entrada de {USERS}", // NEEDS QC
	// TRANSLATORS: separates "X joined" from "Y left"
	"{JOINEDMESSAGE}; {LEFTMESSAGE}": "{JOINEDMESSAGE}; {LEFTMESSAGE}", // NEEDS QC
	"{USERS} left": "Salida de {USERS}", // NEEDS QC
	"{USER} renamed from {OLDUSER}.": "{OLDUSER} ahora se llama {USER}.", // NEEDS QC
	"(Private to {USER})": "(Privado para {USER})", // NEEDS QC
	"{FORMAT} battle started between {PLAYER1} and {PLAYER2}.": "Combate de {FORMAT} iniciado entre {PLAYER1} y {PLAYER2}.", // NEEDS QC
	// TRANSLATORS: for when the format name already includes "battle"
	"{FORMAT} started between {PLAYER1} and {PLAYER2}.": "{FORMAT} iniciado entre {PLAYER1} y {PLAYER2}.", // NEEDS QC
	// TRANSLATORS: for when the format is unknown
	"Battle started between {PLAYER1} and {PLAYER2}.": "Combate iniciado entre {PLAYER1} y {PLAYER2}.", // NEEDS QC
	"({NUMBER} line from {USER} hidden)": "({NUMBER} línea de {USER} oculta)", // NEEDS QC
	"({NUMBER} lines from {USER} hidden)": "({NUMBER} líneas de {USER} ocultas)", // NEEDS QC
	"{USER} invited you to join the room \"{ROOM}\"": "{USER} te ha invitado a la sala \"{ROOM}\"", // NEEDS QC
	"[Join {ROOM}]": "Unirse a {ROOM}", // NEEDS QC
	"Chat log": "Registro del chat", // NEEDS QC

	// TRANSLATORS: tournaments
	"Please respond to the tournament within {SECONDS} seconds or you may be automatically disqualified.": "Responde al torneo en {SECONDS} segundos o podrías ser descalificado automáticamente.", // NEEDS QC
	"Single Elimination": "Eliminación simple", // NEEDS QC
	"Double Elimination": "Eliminación doble", // NEEDS QC
	"Round Robin": "Todos contra todos", // NEEDS QC
	"Double Round Robin": "Todos contra todos (doble)", // NEEDS QC
	"{JOINS} joined the tournament": "Inscripción de {JOINS} al torneo", // NEEDS QC
	"{LEAVES} left the tournament": "Salida de {LEAVES} del torneo", // NEEDS QC
	// TRANSLATORS: sentence terminator for messages like the above
	"{SENTENCE}.": "{SENTENCE}.", // NEEDS QC
	"{FORMAT} {TYPE} tournament": "Torneo {FORMAT} {TYPE}", // NEEDS QC
	"No tournaments are currently running.": "No hay torneos en curso.", // NEEDS QC
	"(started)": "(empezado)", // NEEDS QC
	"{TOURNAMENT} created.": "{TOURNAMENT} creado.", // NEEDS QC
	"{TOURNAMENT} created (and hidden).": "{TOURNAMENT} creado (y oculto).", // NEEDS QC
	"Tournament created": "Torneo creado", // NEEDS QC
	// TRANSLATORS: label, as in "Room: lobby"
	"Room": "Sala", // NEEDS QC
	"Type": "Tipo", // NEEDS QC
	"{USER} has joined the tournament, replacing {OLDUSER}.": "{USER} se ha unido al torneo, sustituyendo a {OLDUSER}.", // NEEDS QC
	"({NUMBER} players)": "({NUMBER} jugadores)", // NEEDS QC
	"The tournament has started!": "¡El torneo ha empezado!", // NEEDS QC
	"{USER} has been disqualified from the tournament.": "{USER} ha sido descalificado del torneo.", // NEEDS QC
	"The tournament's automatic disqualify timer has been turned off.": "El temporizador de descalificación automática del torneo se ha desactivado.", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minute.": "El temporizador de descalificación automática del torneo se ha fijado en {NUMBER} minuto.", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minutes.": "El temporizador de descalificación automática del torneo se ha fijado en {NUMBER} minutos.", // NEEDS QC
	"Tournament automatic disqualification warning": "Aviso de descalificación automática del torneo", // NEEDS QC
	"Time": "Tiempo", // NEEDS QC
	"{NUMBER} sec": "{NUMBER} s", // NEEDS QC
	"The tournament's automatic start is now off.": "El inicio automático del torneo está desactivado.", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minute.": "El torneo empezará automáticamente en {NUMBER} minuto.", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minutes.": "El torneo empezará automáticamente en {NUMBER} minutos.", // NEEDS QC
	"Scouting is now allowed (Tournament players can watch other tournament battles)": "El scouting está permitido (los jugadores del torneo pueden ver otros combates del torneo)", // NEEDS QC
	"Scouting is now banned (Tournament players can't watch other tournament battles)": "El scouting está prohibido (los jugadores del torneo no pueden ver otros combates del torneo)", // NEEDS QC
	"Tournament challenges available": "Retos de torneo disponibles", // NEEDS QC
	"Tournament challenge from {PLAYER}": "Reto de torneo de {PLAYER}", // NEEDS QC
	"Tournament battle between {PLAYER1} and {PLAYER2} started.": "Combate de torneo entre {PLAYER1} y {PLAYER2} iniciado.", // NEEDS QC
	"{PLAYER1} has won the match {SCORE} against {PLAYER2}": "{PLAYER1} ha ganado el combate {SCORE} contra {PLAYER2}", // NEEDS QC
	"{PLAYER1} has lost the match {SCORE} against {PLAYER2}": "{PLAYER1} ha perdido el combate {SCORE} contra {PLAYER2}", // NEEDS QC
	"{PLAYER1} has drawn the match {SCORE} against {PLAYER2}": "{PLAYER1} ha empatado el combate {SCORE} contra {PLAYER2}", // NEEDS QC
	" but the tournament does not support drawing, so it did not count": ", pero el torneo no admite empates, así que no cuenta", // NEEDS QC
	"Congratulations to {WINNERS} for winning the {TOURNAMENT}!": "¡Enhorabuena a {WINNERS} por ganar el {TOURNAMENT}!", // NEEDS QC
	"Runners-up": "Subcampeones", // NEEDS QC
	"Runner-up": "Subcampeón", // NEEDS QC
	"The tournament was forcibly ended.": "El torneo se ha finalizado a la fuerza.", // NEEDS QC
	"The tournament has already started.": "El torneo ya ha empezado.", // NEEDS QC
	"The tournament hasn't started yet.": "El torneo aún no ha empezado.", // NEEDS QC
	"You are already in the tournament.": "Ya estás en el torneo.", // NEEDS QC
	"One of your alts is already in the tournament.": "Una de tus cuentas alternativas ya está en el torneo.", // NEEDS QC
	"You aren't in the tournament.": "No estás en el torneo.", // NEEDS QC
	"This user isn't in the tournament.": "Este usuario no está en el torneo.", // NEEDS QC
	"There aren't enough users.": "No hay suficientes usuarios.", // NEEDS QC
	"That isn't a valid timeout value.": "No es un valor de tiempo válido.", // NEEDS QC
	"That isn't a valid tournament matchup.": "No es un emparejamiento de torneo válido.", // NEEDS QC
	"You must have a name in order to join the tournament.": "Debes tener un nombre para unirte al torneo.", // NEEDS QC
	"The tournament is already at maximum capacity for users.": "El torneo ya está al máximo de su capacidad.", // NEEDS QC
	"You have already been disqualified.": "Ya has sido descalificado.", // NEEDS QC
	"This user has already been disqualified.": "Este usuario ya ha sido descalificado.", // NEEDS QC
	"You are banned from entering tournaments.": "Tienes prohibido participar en torneos.", // NEEDS QC
	"Unknown error: {ERROR}": "Error desconocido: {ERROR}", // NEEDS QC
	"Waiting for battles to become available...": "Esperando a que haya combates disponibles...", // NEEDS QC
	"vs. {PLAYER}": "vs. {PLAYER}", // NEEDS QC
	"Or wait for {PLAYERS} to challenge you.": "O espera a que {PLAYERS} te rete.", // NEEDS QC
	"Waiting for {PLAYERS} to challenge you.": "Esperando a que {PLAYERS} te rete.", // NEEDS QC
	"Waiting for {PLAYER}...": "Esperando a {PLAYER}...", // NEEDS QC
	"Unavailable": "No disponible", // NEEDS QC
	"Waiting": "Esperando", // NEEDS QC
	"Challenging": "Retando", // NEEDS QC

	// TRANSLATORS: command errors
	"This player does not exist or is not online.": "Este jugador no existe o no está conectado.", // NEEDS QC
	"This command can only be used in proper chat rooms.": "Este comando solo se puede usar en salas de chat propiamente dichas.", // NEEDS QC
	"Error: corrupted ranking data": "Error: datos de clasificación corruptos", // NEEDS QC
	"You are not in a battle": "No estás en un combate", // NEEDS QC
	"Invalid turn number: {NUMBER}": "Número de turno no válido: {NUMBER}", // NEEDS QC
	"Turn navigation is disabled in hardcore mode.": "La navegación entre turnos está desactivada en el modo hardcore.", // NEEDS QC
	"You are not a player in this battle": "No eres un jugador de este combate", // NEEDS QC
	"Can only be used in a DM.": "Solo se puede usar en un MD.", // NEEDS QC
	"Please wait 5 seconds before challenging again.": "Espera 5 segundos antes de volver a retar.", // NEEDS QC

	// #endregion Chat

	// #region Teambuilder
	// ==================================================================

	// TRANSLATORS: This is for the Teams list view so it can't be singular
	// TRANSLATORS: Should be something like "Teams List" if you have no singular
	// TRANSLATORS: Can be different from TL.term.teams, which "Teams" as in "plural of Team"
	"Teams": "Equipos", // NEEDS QC
	"[New team]": "Nuevo equipo", // NEEDS QC
	"[New team in folder]": "Nuevo equipo en la carpeta", // NEEDS QC
	"[New {FORMAT} team]": "Nuevo equipo de {FORMAT}", // NEEDS QC
	"[New box]": "Nueva caja", // NEEDS QC
	// TRANSLATORS: When deleting a folder, button to add folder name to all teams in it
	"[Convert to prefix]": "Poner el nombre de la carpeta como prefijo", // NEEDS QC
	"[(add folder)]": "(añadir carpeta)", // NEEDS QC
	"[(add format folder)]": "(añadir carpeta de formato)", // NEEDS QC
	"Names can't contain slashes, since they're used as a folder separator.": "Los nombres no pueden contener barras, porque se usan como separador de carpetas.", // NEEDS QC
	"Names can't contain the character |, since they're used for storing teams.": "Los nombres no pueden contener el carácter |, porque se usa para guardar equipos.", // NEEDS QC
	"New name required": "Se requiere un nombre nuevo", // NEEDS QC
	"Not in a folder": "No está en una carpeta", // NEEDS QC
	"Teams not in any folders": "Equipos sin carpeta", // NEEDS QC
	"All teams": "Todos los equipos", // NEEDS QC
	"Folders": "Carpetas", // NEEDS QC

	// TRANSLATORS: for Clipboard actions
	"Copied!": "¡Copiado!", // NEEDS QC
	"[Paste copy here]": "Pegar copia aquí", // NEEDS QC
	"[Add to clipboard]": "Añadir al portapapeles", // NEEDS QC
	"[Copy/Move]": "Copiar/Mover", // NEEDS QC
	"[+ Clipboard]": "+ Portapapeles", // NEEDS QC
	"[Deselect]": "Deseleccionar", // NEEDS QC
	"[Move here]": "Mover aquí", // NEEDS QC

	// TRANSLATORS: for Import/Export
	"[Backup]": "Copia de seguridad", // NEEDS QC
	"[Backup search results]": "Guardar resultados de búsqueda", // NEEDS QC
	"[Backup folder]": "Guardar carpeta", // NEEDS QC
	"Import/Export": "Importar/Exportar", // NEEDS QC
	"[Import/Export]": "Importar/Exportar", // NEEDS QC
	"[Import]": "Importar", // NEEDS QC
	"(can't save partial exports)": "(no se puede guardar una vista parcial)", // NEEDS QC

	// TRANSLATORS: for uploaded teams
	"Account": "Cuenta", // NEEDS QC
	"Account (public)": "Cuenta (pública)", // NEEDS QC
	"Local": "Local", // NEEDS QC
	"Uploaded": "Subido", // NEEDS QC
	"[Upload for shareable URL]": "Subir para URL compartible", // NEEDS QC
	"[Upload for shareable/searchable URL]": "Subir para URL compartible y buscable", // NEEDS QC
	"Disconnected (wrong account?)": "Desconectado (¿cuenta equivocada?)", // NEEDS QC
	"[Revert to uploaded version]": "Volver a la versión subida", // NEEDS QC
	"[Compare]": "Comparar", // NEEDS QC
	"[Upload changes]": "Subir cambios", // NEEDS QC
	"Team was deleted": "El equipo fue eliminado", // NEEDS QC
	"Team doesn't exist": "El equipo no existe", // NEEDS QC
	"Untitled team": "Equipo sin nombre", // NEEDS QC
	"Uploaded by": "Subido por", // NEEDS QC
	"Views": "Visitas", // NEEDS QC
	"Team deleted": "Equipo eliminado", // NEEDS QC
	"Not found": "No encontrado", // NEEDS QC

	// TRANSLATORS: for the team editor
	// "Agregar" instead of "Añadir" in Latin American Spanish
	"[Add Pokémon]": "Añadir Pokémon", // NEEDS QC
	"(choose ability)": null, // NEEDS TRANSLATION
	"Details": "Detalles", // NEEDS QC
	// TRANSLATORS: Teambuilder "form" with text boxes inside, not form/forme "form" of a pokemon
	"Form": "Formulario", // NEEDS QC
	"Tera": "Tera", // NEEDS QC
	// TRANSLATORS: These two are for Hidden Power type
	// TRANSLATORS: They're both designed to take up very little width, so keep that in mind
	"H.P.": "P.O.", // NEEDS QC
	"H. Power": "P. Oculto", // NEEDS QC
	"Defensive coverage": "Cobertura defensiva", // NEEDS QC
	"Teambuilding resources for {FORMAT}": "Recursos de creación de equipos para {FORMAT}", // NEEDS QC
	"[See all]": "Ver todo", // NEEDS QC
	"Search species or filter by type, learnable moves, ability, tier, or egg group": "Busca un Pokémon o filtra por tipo, movimientos aprendibles, habilidad, tier o grupo huevo", // NEEDS QC
	"Search abilities": "Buscar habilidades", // NEEDS QC
	"Search items": "Buscar objetos", // NEEDS QC
	"Search moves or filter by type or category": "Busca movimientos o filtra por tipo o categoría", // NEEDS QC
	"Sample sets": "Sets de ejemplo", // NEEDS QC
	"Box sets": "Sets de la caja", // NEEDS QC
	"Guessed spread": "Reparto estimado", // NEEDS QC
	"(Please choose 4 moves to get a guessed spread)": "(Elige 4 movimientos para obtener un reparto estimado)", // NEEDS QC
	"Protip": "Consejo", // NEEDS QC
	"Use a different nature to save {NUMBER} EVs:": "Usa una naturaleza distinta para ahorrar {NUMBER} EV:", // NEEDS QC
	"Use a different nature to get higher stats:": "Usa una naturaleza distinta para obtener mejores estadísticas:", // NEEDS QC
	"Natures cannot raise or lower HP.": "Las naturalezas no pueden subir ni bajar los PS.", // NEEDS QC
	// TRANSLATORS: {STATCHANGES} is +stat/-stat
	"{STATCHANGES} nature": "Naturaleza {STATCHANGES}", // NEEDS QC
	// TRANSLATORS: {1} and {2} are the + and - keyboard keys
	"You can also set natures by typing {1} and {2} in the EV box.": "También puedes elegir la naturaleza escribiendo {1} y {2} en la casilla de EVs.", // NEEDS QC
	"Pasted team": "Equipo pegado", // NEEDS QC
	"Zoom out forms": "Reducir los formularios", // NEEDS QC
	"Compact": "Compacto", // NEEDS QC
	"Comfortable": "Cómodo", // NEEDS QC
	"Zoom out search results": "Reducir los resultados de búsqueda", // NEEDS QC
	"Fetching Paste...": "Obteniendo el Paste...", // NEEDS QC
	"Import/Export set": "Importar/exportar el set", // NEEDS QC
	"IV spreads": "Repartos de IVs", // NEEDS QC
	"min Atk": "Ataque mín.", // NEEDS QC
	"min Atk, min Spe": "Ataque y Velocidad mín.", // NEEDS QC
	"max all": "todo al máximo", // NEEDS QC
	"min Spe": "Velocidad mín.", // NEEDS QC
	"Hidden Power {TYPE} IVs": "IVs para Poder Oculto {TYPE}", // NEEDS QC
	"EVs, IVs, and nature": "EVs, IVs y naturaleza", // NEEDS QC
	"Base": "Base", // NEEDS QC
	"Remaining": "Restantes", // NEEDS QC

	// TRANSLATORS: errors
	"You must select a format first.": "Primero debes elegir un formato.", // NEEDS QC
	"This team is for a different account. Please log into the correct account to update it.": "Este equipo es de otra cuenta. Inicia sesión con la cuenta correcta para actualizarlo.", // NEEDS QC
	"Add a Pokémon to your team before uploading it.": "Añade un Pokémon a tu equipo antes de subirlo.", // NEEDS QC
	"Must use on an uploaded team.": "Solo se puede usar con un equipo subido.", // NEEDS QC
	"Team not found: {INPUT}": "Equipo no encontrado: {INPUT}", // NEEDS QC
	"Your file \"{FILENAME}\" is not a valid team.": "Tu archivo \"{FILENAME}\" no es un equipo válido.", // NEEDS QC

	// #endregion Teambuilder

	// #region Ladder
	// ==================================================================

	"[All formats]": "Todos los formatos", // NEEDS QC
	"[How the ladder works]": "Cómo funciona la clasificación", // NEEDS QC
	"[Seasonal rankings]": "Clasificación de temporada", // NEEDS QC
	"[Look up a specific user's rating]": "Consultar la puntuación de un usuario concreto", // NEEDS QC
	"Name": "Nombre", // NEEDS QC
	"Elo rating": "Puntuación Elo", // NEEDS QC
	"user's percentage chance of winning a random battle (Glicko X-Act Estimate)": "probabilidad estimada de ganar un combate aleatorio (estimación Glicko X-Act)", // NEEDS QC
	"Glicko-1 rating system: rating±deviation (provisional if deviation>100)": "Sistema de puntuación Glicko-1: puntuación±desviación (provisional si desviación>100)", // NEEDS QC
	"No one has played any ranked games yet.": "Nadie ha jugado partidas clasificatorias todavía.", // NEEDS QC

	// #endregion Ladder

	// #region Misc rooms
	// ==================================================================

	"[Join the Help room for live help]": "Pide ayuda en la sala Help", // NEEDS QC
	"Unrecognized command: {INPUT}": "Comando no reconocido: {INPUT}", // NEEDS QC

	// #endregion Misc rooms
};
