// Remember, comments starting with "TRANSLATORS:" are from Showdown,
// and are shared between all translations. But other comments can be
// used as notes to yourself or other translators, and are specific
// to the Portuguese translation.

// This translation uses Brazilian Portuguese conventions (equipe,
// usuário), since most of the Showdown Portuguese community is
// Brazilian; European Portuguese would use equipa, utilizador, etc.

import type { UIText } from '../build-tools/translations.mts';
export const translations: UIText = {
	// #region Navigation
	// ==================================================================

	// TRANSLATORS: Note that "Home" and "Main Menu" refer to the same place
	// TRANSLATORS: So it's fine if they're the same word in your language
	"Home": "Início", // NEEDS QC
	// TRANSLATORS: This is used as a "Back to Home" button after battles
	"[Main menu]": "Menu principal", // NEEDS QC
	// TRANSLATORS: It's fine if "Teambuilder" and "Teams" are the same word in your language
	// TRANSLATORS: Also consider something like "Edit teams" for "Teambuilder"
	"Teambuilder": "Editor de equipes", // NEEDS QC
	// "Ranking" is also very common in Brazilian gaming usage
	"Ladder": "Classificação", // NEEDS QC
	"Tournaments": "Torneios", // NEEDS QC
	"Friends": "Amigos", // NEEDS QC
	"Chat rooms": "Salas de chat", // NEEDS QC
	"Battles": "Batalhas", // NEEDS QC
	"News": "Notícias", // NEEDS QC
	"Offline": "Offline", // NEEDS QC
	"[Join chat]": "Entrar no chat", // NEEDS QC
	"[All tabs]": "Todas as abas", // NEEDS QC
	"[Menu]": "Menu", // NEEDS QC

	// #endregion Navigation

	// #region Generic UI
	// ==================================================================

	"[Hide]": "Ocultar", // NEEDS QC
	"[Close]": "Fechar", // NEEDS QC
	"[Done]": "Concluído", // NEEDS QC
	"[Back]": "Voltar", // NEEDS QC
	// TRANSLATORS: A computer copy command, like Ctrl+C
	"[Copy]": "Copiar", // NEEDS QC
	"[Edit]": "Editar", // NEEDS QC
	"[Delete]": "Excluir", // NEEDS QC
	"[Undo delete]": "Desfazer exclusão", // NEEDS QC
	// TRANSLATORS: "DM" is used to label DMs; "[Chat]" is the button to send a DM
	// TRANSLATORS: Feel free to use the same word for both (and for "Chat" in the Battle section)
	// "MP" (mensagem privada) is the traditional forum term, but "DM" is
	// widely understood in Brazilian usage now
	"DM": "DM", // NEEDS QC
	"[Chat]": "Conversar", // NEEDS QC
	"[OK]": "OK", // NEEDS QC
	"[Cancel]": "Cancelar", // NEEDS QC
	"[Accept]": "Aceitar", // NEEDS QC
	"[Reject]": "Recusar", // NEEDS QC
	"Random team": "Equipe aleatória", // NEEDS QC
	"[Sound]": "Som", // NEEDS QC
	"[Options]": "Opções", // NEEDS QC
	"[Battle options]": "Opções de batalha", // NEEDS QC
	"[Revert]": "Reverter", // NEEDS QC
	"[Refresh]": "Atualizar", // NEEDS QC
	"[Search]": "Buscar", // NEEDS QC
	"[Validate]": "Validar", // NEEDS QC
	"[Reconnect]": "Reconectar", // NEEDS QC
	"Disconnected": "Desconectado", // NEEDS QC
	"Connecting...": "Conectando...", // NEEDS QC
	"Loading...": "Carregando...", // NEEDS QC
	"Uploading...": "Enviando...", // NEEDS QC
	"[Change]": "Alterar", // NEEDS QC
	"[Add]": "Adicionar", // NEEDS QC
	"[Look up]": "Buscar", // NEEDS QC
	"[Save changes]": "Salvar", // NEEDS QC
	"[Create]": "Criar", // NEEDS QC
	"[Rename]": "Renomear", // NEEDS QC
	"[Remove]": "Remover", // NEEDS QC
	// TRANSLATORS: intentionally chosen to be very short. do not go longer than three letters for this one
	"Gen {NUMBER}": "Gen {NUMBER}", // NEEDS QC
	"[Maximize]": "Maximizar", // NEEDS QC
	"[Expand/collapse]": "Expandir/recolher", // NEEDS QC

	// TRANSLATORS: connection/team-storage errors
	"Sorry, psim connections are unsupported by your browser.": "Desculpe, seu navegador não suporta conexões psim.", // NEEDS QC
	"Your browser doesn't support third-party cookies. Some things might not work correctly.": "Seu navegador não suporta cookies de terceiros. Algumas coisas podem não funcionar corretamente.", // NEEDS QC
	"Your team storage format is too old for PS. You'll need to upgrade it at {URL}": "O formato de armazenamento das suas equipes é antigo demais para o PS. Você precisará atualizá-lo em {URL}", // NEEDS QC
	"Error loading uploaded teams: {ERROR}": "Erro ao carregar as equipes enviadas: {ERROR}", // NEEDS QC
	"Error unknown. Try again later.": "Erro desconhecido. Tente novamente mais tarde.", // NEEDS QC
	"Failed to load team: {ERROR}": "Falha ao carregar a equipe: {ERROR}", // NEEDS QC
	"Error logging in.": "Erro ao fazer login.", // NEEDS QC
	"Something is interfering with our connection to the login server. Most likely, your internet provider needs you to re-log-in, or your internet provider is blocking Pokémon Showdown.": "Algo está interferindo na nossa conexão com o servidor de login. Provavelmente seu provedor de internet exige que você faça login novamente, ou está bloqueando o Pokémon Showdown.", // NEEDS QC

	// TRANSLATORS: for constructing lists
	"{FIRST} or {SECOND}": "{FIRST} ou {SECOND}", // NEEDS QC
	"{FIRST} and {SECOND}": "{FIRST} e {SECOND}", // NEEDS QC
	", {NEXT}": ", {NEXT}", // NEEDS QC
	", or {LAST}": " ou {LAST}", // NEEDS QC
	", and {LAST}": " e {LAST}", // NEEDS QC
	// TRANSLATORS: this is for lists of users specifically
	// TRANSLATORS: (languages with counters should use the "person" counter)
	", and {NUMBER} others": " e mais {NUMBER}", // NEEDS QC

	// #endregion Generic UI

	// #region Popups
	// ==================================================================

	// TRANSLATORS: user popup
	// TRANSLATORS: "Global {RANK}" is a rank, like "Global Moderator"
	"Global {RANK}": "{RANK} global", // NEEDS QC
	"Chatrooms": "Salas", // NEEDS QC
	"Private rooms": "Salas privadas", // NEEDS QC
	"OFFLINE": "OFFLINE", // NEEDS QC
	"Username": "Nome de usuário", // NEEDS QC
	"[Register]": "Registrar", // NEEDS QC
	"[Add status]": "Adicionar status", // NEEDS QC
	"[Chat self]": "Conversar consigo mesmo", // NEEDS QC
	"[Change name]": "Mudar nome", // NEEDS QC
	"[Log out]": "Sair", // NEEDS QC
	"[Add friend]": "Adicionar amigo", // NEEDS QC
	"[Unignore]": "Deixar de ignorar", // NEEDS QC
	"[Ignore]": "Ignorar", // NEEDS QC
	"[Report]": "Denunciar", // NEEDS QC
	"[Mute]": "Silenciar", // NEEDS QC
	"[7m]": "7 min", // NEEDS QC
	"[Hourmute]": "Silenciar 1 hora", // NEEDS QC
	"[1h]": "1 h", // NEEDS QC
	"[Ban]": "Banir", // NEEDS QC
	"[2d]": "2 dias", // NEEDS QC
	"[Weekban]": "Banir 1 semana", // NEEDS QC
	"[1w]": "1 sem.", // NEEDS QC
	"[Modlog]": "Registro de moderação", // NEEDS QC
	// TRANSLATORS: Showdown term for a global mute
	"[Lock]": "Bloquear", // NEEDS QC
	"[Weeklock]": "Bloquear 1 semana", // NEEDS QC
	"[Namelock]": "Bloquear nome", // NEEDS QC
	"[Global modlog]": "Registro de moderação global", // NEEDS QC
	"[Avatar...]": "Avatar...", // NEEDS QC
	"[Close room]": "Fechar sala", // NEEDS QC
	"[Report a user]": "Denunciar um usuário", // NEEDS QC
	"({NUMBER} sec)": "({NUMBER} s)", // NEEDS QC
	"Room not found": "Sala não encontrada", // NEEDS QC

	// TRANSLATORS: battle options
	"Side-by-side, controls below": "Lado a lado, controles abaixo", // NEEDS QC
	"Side-by-side, overlay controls": "Lado a lado, controles sobrepostos", // NEEDS QC
	"Top-and-bottom, controls below": "Empilhado, controles abaixo", // NEEDS QC
	"Top-and-bottom, overlay controls": "Empilhado, controles sobrepostos", // NEEDS QC
	"Scrolling, controls below": "Rolagem, controles abaixo", // NEEDS QC
	"Scrolling, overlay controls": "Rolagem, controles sobrepostos", // NEEDS QC
	"Hardcore mode ON: Information not available in-game is now hidden.": "Modo hardcore ATIVADO: informações não disponíveis no jogo agora estão ocultas.", // NEEDS QC
	"Hardcore mode OFF: Information not available in-game is now shown.": "Modo hardcore DESATIVADO: informações não disponíveis no jogo agora estão visíveis.", // NEEDS QC
	"Spectators ignored.": "Espectadores ignorados.", // NEEDS QC
	"Spectators no longer ignored.": "Espectadores não são mais ignorados.", // NEEDS QC
	"In this battle": "Nesta batalha", // NEEDS QC
	"Hardcore mode (hide info not shown in-game)": "Modo hardcore (ocultar informações não visíveis no jogo)", // NEEDS QC
	"Ignore spectators": "Ignorar espectadores", // NEEDS QC
	"Ignore opponent": "Ignorar oponente", // NEEDS QC
	"Ignore nicknames": "Ignorar apelidos", // NEEDS QC
	"All battles": "Todas as batalhas", // NEEDS QC
	"Layout": "Layout", // NEEDS QC
	"Automatic ({SETTING})": "Automático ({SETTING})", // NEEDS QC
	"Automatic": "Automático", // NEEDS QC
	"(DESKTOP)": "(DESKTOP)", // NEEDS QC
	"(MOBILE VERTICAL)": "(CELULAR VERTICAL)", // NEEDS QC
	"(MOBILE HORIZONTAL)": "(CELULAR HORIZONTAL)", // NEEDS QC
	"You can still invite spectators by giving them the URL or using the /invite command": "Você ainda pode convidar espectadores compartilhando a URL ou usando o comando /invite", // NEEDS QC
	"Invite only (hide from Battles list)": "Apenas por convite (ocultar da lista de batalhas)", // NEEDS QC
	"Ignore Pokémon nicknames": "Ignorar apelidos dos Pokémon", // NEEDS QC
	"Automatically start timer": "Iniciar o temporizador automaticamente", // NEEDS QC
	"Hardcore mode": "Modo hardcore", // NEEDS QC
	"Start at turn 0 when spectating battles": "Começar no turno 0 ao assistir batalhas", // NEEDS QC
	"Open new battles in the right-side panel": "Abrir novas batalhas no painel direito", // NEEDS QC

	// TRANSLATORS: options
	"General": "Geral", // NEEDS QC
	"Language": "Idioma", // NEEDS QC
	"Appearance": "Aparência", // NEEDS QC
	"Theme": "Tema", // NEEDS QC
	"Light": "Claro", // NEEDS QC
	"Dark": "Escuro", // NEEDS QC
	"Match system theme": "Seguir o tema do sistema", // NEEDS QC
	"Two panels (if wide enough)": "Dois painéis (se houver espaço)", // NEEDS QC
	"Single panel": "Painel único", // NEEDS QC
	"Vertical tabs": "Abas verticais", // NEEDS QC
	"Background": "Plano de fundo", // NEEDS QC
	"Disable animations": "Desativar animações", // NEEDS QC
	"Use 2D sprites instead of 3D models": "Usar sprites 2D em vez de modelos 3D", // NEEDS QC
	"Use modern sprites for past generations": "Usar sprites modernos para gerações passadas", // NEEDS QC
	"Block DMs": "Bloquear DMs", // NEEDS QC
	"Block challenges": "Bloquear desafios", // NEEDS QC
	"Show DMs in chatrooms": "Mostrar DMs nas salas de chat", // NEEDS QC
	"Do not highlight when your name is said in chat": "Não destacar quando seu nome for dito no chat", // NEEDS QC
	"Confirm before leaving a room": "Confirmar antes de sair de uma sala", // NEEDS QC
	"Confirm before refreshing": "Confirmar antes de atualizar", // NEEDS QC
	"Always notify": "Sempre notificar", // NEEDS QC
	"Notify when joined": "Notificar quando participando", // NEEDS QC
	"Hide": "Ocultar", // NEEDS QC
	"Timestamps": "Timestamps", // NEEDS QC
	"Off": "Desativado", // NEEDS QC
	"Timestamps in DMs": "Timestamps em DMs", // NEEDS QC
	"Chat preferences": "Preferências do chat", // NEEDS QC
	"[Change background]": "Mudar plano de fundo", // NEEDS QC
	"[Text formatting...]": "Formatação de texto...", // NEEDS QC
	"[Set as background]": "Definir como plano de fundo", // NEEDS QC
	"[Random]": "Aleatório", // NEEDS QC

	// TRANSLATORS: team chooser
	"(uncategorized)": "(sem categoria)", // NEEDS QC
	"(all)": "(todas)", // NEEDS QC
	"[Other gens]": "Outras gerações", // NEEDS QC
	"Select a team": "Escolher uma equipe", // NEEDS QC
	"This team selector is no longer available (the challenge was cancelled or something).": "Este seletor de equipes não está mais disponível (o desafio foi cancelado ou algo assim).", // NEEDS QC
	"No teams found": "Nenhuma equipe encontrada", // NEEDS QC
	"This format selector is no longer available.": "Este seletor de formatos não está mais disponível.", // NEEDS QC
	"Search formats": "Buscar formatos", // NEEDS QC

	// TRANSLATORS: login
	"[Choose name]": "Escolher nome", // NEEDS QC
	"Logging in...": "Entrando...", // NEEDS QC
	"[Log in]": "Entrar", // NEEDS QC
	"[Try another name]": "Tentar outro nome", // NEEDS QC
	"[Password...]": "Senha...", // NEEDS QC
	"[Change password]": "Mudar senha", // NEEDS QC
	"[Show password]": "Mostrar senha", // NEEDS QC
	"Loading Google log-in button...": "Carregando o botão de login do Google...", // NEEDS QC
	"(color)": "(cor)", // NEEDS QC
	"(Others will be able to see your name change. To change name privately, use \"Log out\")": "(Os outros verão sua mudança de nome. Para mudar em privado, use \"Sair\")", // NEEDS QC
	"if you registered this name:": "se você registrou este nome:", // NEEDS QC
	"if not:": "se não:", // NEEDS QC
	"This is someone else's account. Sorry.": "Esta conta é de outra pessoa. Desculpe.", // NEEDS QC
	"Password": "Senha", // NEEDS QC

	// TRANSLATORS: register / change password
	"All fields are required": "Todos os campos são obrigatórios", // NEEDS QC
	"Passwords do not match": "As senhas não coincidem", // NEEDS QC
	"Your password was successfully changed!": "Sua senha foi alterada com sucesso!", // NEEDS QC
	"Change your password:": "Altere sua senha:", // NEEDS QC
	"Old password": "Senha antiga", // NEEDS QC
	"New password": "Nova senha", // NEEDS QC
	"New password (confirm)": "Nova senha (confirmar)", // NEEDS QC
	"You have been successfully registered.": "Você foi registrado com sucesso.", // NEEDS QC
	"Register your account:": "Registre sua conta:", // NEEDS QC
	"Password (confirm)": "Senha (confirmar)", // NEEDS QC
	"An Electric-type mouse that is the mascot of the Pokémon franchise.": "Um rato do tipo Elétrico que é o mascote da franquia Pokémon.", // NEEDS QC
	"What is this Pokémon?": "Quem é esse Pokémon?", // NEEDS QC

	// #endregion Popups

	// #region Main Menu
	// ==================================================================

	// TRANSLATORS: Our famous ladder queue button. Give it some flair :)
	// TRANSLATORS: Might we suggest "Showdown!"
	// QC: or maybe "Bora batalhar!" if that isn't too slangy
	"[Battle!]": "Vamos batalhar!", // NEEDS QC
	"Find a random opponent": "Procurar um oponente aleatório", // NEEDS QC
	"Watch a battle": "Assistir a uma batalha", // NEEDS QC
	"Find a user": "Procurar um usuário", // NEEDS QC
	"Info & Resources": "Informações e recursos", // NEEDS QC
	"Lobby chat": "Chat do lobby", // NEEDS QC

	// TRANSLATORS: Challenge/Search UI
	"[Challenge]": "Desafiar", // NEEDS QC
	"Custom rules": "Regras personalizadas", // NEEDS QC
	// TRANSLATORS: Search countdown. {NUMBER} = a number of seconds
	// TRANSLATORS: English doesn't include the unit (seconds) but your language can
	"Searching in {NUMBER}...": "Buscando em {NUMBER} s...", // NEEDS QC
	"Searching...": "Buscando oponente...", // NEEDS QC
	"Pokédex": "Pokédex", // NEEDS QC
	"Replays": "Replays", // NEEDS QC
	"Forum": "Fórum", // NEEDS QC
	"Rules": "Regras", // NEEDS QC
	"Credits": "Créditos", // NEEDS QC
	"Privacy": "Privacidade", // NEEDS QC
	"background by {ARTIST}": "fundo por {ARTIST}", // NEEDS QC

	// TRANSLATORS: errors
	"Wait for this countdown to finish first...": "Espere esta contagem regressiva terminar primeiro...", // NEEDS QC
	"You're already searching for a {FORMAT} battle...": "Você já está procurando uma batalha de {FORMAT}...", // NEEDS QC
	"You need to go into the Teambuilder and build a team for this format.": "Você precisa ir ao Teambuilder e montar uma equipe para este formato.", // NEEDS QC

	// #endregion Main Menu

	// #region Rooms
	// ==================================================================

	// TRANSLATORS: these go under the user/battle counts, and in English they read as "100 users online"
	// TRANSLATORS: but they don't have to work that way in your language
	// short label forms to fit the count boxes; "usuários conectados" /
	// "batalhas em andamento" were too wide
	"users online": "conectados", // NEEDS QC
	"active battles": "batalhas", // NEEDS QC
	"Find an online user": "Encontrar um usuário online", // NEEDS QC
	"Watch an active battle": "Assistir a uma batalha em andamento", // NEEDS QC
	"Meloetta is PS's mascot! The Aria forme is about using its voice, and represents our chatrooms.": "Meloetta é a mascote do PS! A Forma Aria usa sua voz e representa nossas salas de chat.", // NEEDS QC
	"Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles.": "Meloetta é a mascote do PS! A Forma Pirouette é do tipo Lutador e representa nossas batalhas.", // NEEDS QC

	"Official chat rooms": "Salas de chat oficiais", // NEEDS QC
	"Hidden rooms": "Salas ocultas", // NEEDS QC

	"Subrooms": "Subsalas", // NEEDS QC
	"(All rooms)": "(Todas as salas)", // NEEDS QC
	"Join or search for rooms": "Entre ou procure salas", // NEEDS QC
	"Command": "Comando", // NEEDS QC
	"Console": "Console", // NEEDS QC
	"Enter = run command {INPUT}": "Enter = executar o comando {INPUT}", // NEEDS QC
	"(Subroom of {ROOM})": "(Subsala de {ROOM})", // NEEDS QC
	"Possible secret room": "Possível sala secreta", // NEEDS QC
	"(Private room?)": "(Sala privada?)", // NEEDS QC
	"Search results": "Resultados da busca", // NEEDS QC

	// #endregion Rooms

	// #region Battle
	// ==================================================================

	// TRANSLATORS: Note that most translations of battle UI are in the server repository
	// TRANSLATORS: In data/text/[lang]/default.ts and data/text/[lang]/names.ts

	// TRANSLATORS: [Team]/[Battle]/[Switch]/[Shift] are buttons in overlay controls
	// TRANSLATORS: But they're section headers in normal battle controls
	// TRANSLATORS: For the "Use move" menu in battle controls
	// TRANSLATORS: This was "Attack" in older Showdown, "FIGHT" on older cart, and "Battle" on modern cart
	// no official pt games; Lutar parallels the other languages' Fight-menu verbs
	"[Battle]": "Lutar", // NEEDS QC
	// TRANSLATORS: For the "Switch" menu in battle controls
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Switch]": "Trocar", // NEEDS QC
	// TRANSLATORS: For the Team Preview menu in battle controls
	// TRANSLATORS: Also replaces "[Switch]" in phases where switching isn't possible
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Team]": "Equipe", // NEEDS QC
	// TRANSLATORS: The Triples "move to center" button
	// TRANSLATORS: This is "SHIFT" on older cart; Triples doesn't exist on modern cart
	// no official pt games; Mover mirrors ORAS's "move" wording (es Mover, it Sposta, ...)
	"[Shift]": "Mover", // NEEDS QC

	// TRANSLATORS: Mobile-layout buttons for switching between the battle view and the chat view
	// TRANSLATORS: ("Chat" is also used as a section header in the options popup)
	"Battle": "Batalha", // NEEDS QC
	"Chat": "Chat", // NEEDS QC
	"[Try Fight button]": "Testar o botão Lutar", // NEEDS QC
	// TRANSLATORS: For the "where to target this move" menu
	"(empty slot)": "(espaço vazio)", // NEEDS QC
	"Maxed with no max moves": "Nenhum movimento Dynamax disponível", // NEEDS QC
	"No Z moves": "Nenhum movimento Z", // NEEDS QC

	"[Rematch]": "Revanche", // NEEDS QC
	"[Offer tie]": "Propor empate", // NEEDS QC
	"[Forfeit]": "Desistir", // NEEDS QC
	"[Forfeit and close]": "Desistir e fechar", // NEEDS QC
	"[Replace player]": "Substituir jogador", // NEEDS QC
	"[Replace]": "Substituir", // NEEDS QC
	"(turn 100+)": "(turno 100+)", // NEEDS QC
	"[Stop timer]": "Parar o temporizador", // NEEDS QC
	"[Start timer]": "Iniciar o temporizador", // NEEDS QC
	"Enter player's name": "Digite o nome do jogador", // NEEDS QC
	"Cannot replace player, battle has already ended.": "Não é possível substituir o jogador, a batalha já terminou.", // NEEDS QC

	// TRANSLATORS: for replay controls
	"[Play]": "Reproduzir", // NEEDS QC
	"[Pause]": "Pausar", // NEEDS QC
	"[First turn]": "Primeiro turno", // NEEDS QC
	"[Prev turn]": "Turno anterior", // NEEDS QC
	"[Skip turn]": "Próximo turno", // NEEDS QC
	"[Skip to end]": "Pular para o fim", // NEEDS QC
	"[Switch viewpoint]": "Trocar de perspectiva", // NEEDS QC
	"[Go to turn]": "Ir para o turno", // NEEDS QC
	"[Skip]": "Pular", // NEEDS QC
	"[Skip animation]": "Pular animação", // NEEDS QC
	"[Move to center]": "Mover para o centro", // NEEDS QC
	"[Upload and share replay]": "Enviar e compartilhar replay", // NEEDS QC
	"[Replay]": "Replay", // NEEDS QC
	"(closes this battle)": "(fecha esta batalha)", // NEEDS QC

	// TRANSLATORS: for the battle list
	"Minimum Elo": "Elo mínimo", // NEEDS QC
	"rated {ELO}": "avaliação {ELO}", // NEEDS QC
	// TRANSLATORS: goes between two usernames; the key includes its surrounding spacing so some languages can drop it
	"{PLAYER1} vs. {PLAYER2}": "{PLAYER1} vs. {PLAYER2}", // NEEDS QC
	"(All formats)": "(Todos os formatos)", // NEEDS QC
	"Username prefix": "Prefixo do nome de usuário", // NEEDS QC
	"No battles are going on": "Nenhuma batalha em andamento", // NEEDS QC
	"{NUMBER} battle": "{NUMBER} batalha", // NEEDS QC
	"{NUMBER} battles": "{NUMBER} batalhas", // NEEDS QC
	"None": "Nenhum", // NEEDS QC
	"Timer": "Temporizador", // NEEDS QC
	"Error": "Erro", // NEEDS QC
	"The battle you're looking for has expired. Battles expire after 15 minutes of inactivity unless they're saved.": "A batalha que você procura expirou. Batalhas expiram após 15 minutos de inatividade, a menos que sejam salvas.", // NEEDS QC
	"In the future, remember to click \"Save replay\" to save a replay permanently.": "No futuro, lembre-se de clicar em \"Salvar replay\" para salvar um replay permanentemente.", // NEEDS QC
	"Unrecognized HTML file: Only replay files are supported.": "Arquivo HTML não reconhecido: apenas arquivos de replay são suportados.", // NEEDS QC
	"You are still in {ROOM}": "Você ainda está em {ROOM}", // NEEDS QC
	"Battle \"{INPUT}\" not found": "Batalha \"{INPUT}\" não encontrada", // NEEDS QC
	"Uploaded replay": "Replay enviado", // NEEDS QC
	"Team {PLAYER}": "Equipe {PLAYER}", // NEEDS QC
	"{PLAYER} and friends": "{PLAYER} e amigos", // NEEDS QC

	// TRANSLATORS: battle log messages
	"[Earlier messages]": "Mensagens anteriores", // NEEDS QC
	"Register an account to protect your ladder rating!": "Registre uma conta para proteger sua avaliação na classificação!", // NEEDS QC
	"Open team sheet for {PLAYER}": "Abrir a folha de equipe de {PLAYER}", // NEEDS QC
	"Warning": "Aviso", // NEEDS QC
	"Variation": "Variante", // NEEDS QC
	"Rated battle": "Batalha avaliada", // NEEDS QC

	// TRANSLATORS: screen reader labels
	"Active Pokémon": "Pokémon ativo", // NEEDS QC
	"Your team": "Sua equipe", // NEEDS QC
	"Opponent's team": "Equipe do oponente", // NEEDS QC
	"Statused": "Com problema de status", // NEEDS QC
	"Non-statused": "Sem problema de status", // NEEDS QC
	"Unrevealed Illusion user": "Usuário de Ilusão não revelado", // NEEDS QC
	"Not revealed": "Não revelado", // NEEDS QC
	"Battle controls": "Controles da batalha", // NEEDS QC

	// #endregion Battle

	// #region Chat
	// ==================================================================

	"{NUMBER} user": "{NUMBER} usuário", // NEEDS QC
	"{NUMBER} users": "{NUMBER} usuários", // NEEDS QC
	"[Join]": "Entrar", // NEEDS QC
	"[Leave]": "Sair", // NEEDS QC
	"[Ready!]": "Pronto!", // NEEDS QC
	"In progress": "Em andamento", // NEEDS QC
	"Signups": "Inscrições", // NEEDS QC
	"[Pop-out]": "Janela separada", // NEEDS QC
	"[Go]": "Ir", // NEEDS QC
	"[Visit]": "Abrir", // NEEDS QC
	"[Choose a name before sending messages]": "Escolha um nome antes de enviar mensagens", // NEEDS QC
	"Challenging...": "Desafiando...", // NEEDS QC
	"Accepting...": "Aceitando...", // NEEDS QC
	"[Commands]": "Comandos", // NEEDS QC
	"Mentioned by {USER} in {ROOM}": "{USER} mencionou você em {ROOM}", // NEEDS QC
	"{USERS} joined": "Entrada de {USERS}", // NEEDS QC
	// TRANSLATORS: separates "X joined" from "Y left"
	"{JOINEDMESSAGE}; {LEFTMESSAGE}": "{JOINEDMESSAGE}; {LEFTMESSAGE}", // NEEDS QC
	"{USERS} left": "Saída de {USERS}", // NEEDS QC
	"{USER} renamed from {OLDUSER}.": "{OLDUSER} agora se chama {USER}.", // NEEDS QC
	"(Private to {USER})": "(Privado para {USER})", // NEEDS QC
	"{FORMAT} battle started between {PLAYER1} and {PLAYER2}.": "Batalha de {FORMAT} iniciada entre {PLAYER1} e {PLAYER2}.", // NEEDS QC
	// TRANSLATORS: for when the format name already includes "battle"
	"{FORMAT} started between {PLAYER1} and {PLAYER2}.": "{FORMAT} iniciada entre {PLAYER1} e {PLAYER2}.", // NEEDS QC
	// TRANSLATORS: for when the format is unknown
	"Battle started between {PLAYER1} and {PLAYER2}.": "Batalha iniciada entre {PLAYER1} e {PLAYER2}.", // NEEDS QC
	"({NUMBER} line from {USER} hidden)": "({NUMBER} linha de {USER} oculta)", // NEEDS QC
	"({NUMBER} lines from {USER} hidden)": "({NUMBER} linhas de {USER} ocultas)", // NEEDS QC
	"{USER} invited you to join the room \"{ROOM}\"": "{USER} convidou você para a sala \"{ROOM}\"", // NEEDS QC
	"[Join {ROOM}]": "Entrar em {ROOM}", // NEEDS QC
	"Chat log": "Registro do chat", // NEEDS QC

	// TRANSLATORS: tournaments
	"Please respond to the tournament within {SECONDS} seconds or you may be automatically disqualified.": "Responda ao torneio em {SECONDS} segundos ou você poderá ser desclassificado automaticamente.", // NEEDS QC
	"Single Elimination": "Eliminação simples", // NEEDS QC
	"Double Elimination": "Eliminação dupla", // NEEDS QC
	"Round Robin": "Todos contra todos", // NEEDS QC
	"Double Round Robin": "Todos contra todos (duplo)", // NEEDS QC
	"{JOINS} joined the tournament": "Inscrição de {JOINS} no torneio", // NEEDS QC
	"{LEAVES} left the tournament": "Saída de {LEAVES} do torneio", // NEEDS QC
	// TRANSLATORS: sentence terminator for messages like the above
	"{SENTENCE}.": "{SENTENCE}.", // NEEDS QC
	"{FORMAT} {TYPE} tournament": "Torneio {FORMAT} {TYPE}", // NEEDS QC
	"No tournaments are currently running.": "Nenhum torneio está em andamento.", // NEEDS QC
	"(started)": "(iniciado)", // NEEDS QC
	"{TOURNAMENT} created.": "{TOURNAMENT} criado.", // NEEDS QC
	"{TOURNAMENT} created (and hidden).": "{TOURNAMENT} criado (e oculto).", // NEEDS QC
	"Tournament created": "Torneio criado", // NEEDS QC
	// TRANSLATORS: label, as in "Room: lobby"
	"Room": "Sala", // NEEDS QC
	"Type": "Tipo", // NEEDS QC
	"{USER} has joined the tournament, replacing {OLDUSER}.": "{USER} entrou no torneio, substituindo {OLDUSER}.", // NEEDS QC
	"({NUMBER} players)": "({NUMBER} jogadores)", // NEEDS QC
	"The tournament has started!": "O torneio começou!", // NEEDS QC
	"{USER} has been disqualified from the tournament.": "{USER} foi desclassificado do torneio.", // NEEDS QC
	"The tournament's automatic disqualify timer has been turned off.": "O temporizador de desclassificação automática do torneio foi desativado.", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minute.": "O temporizador de desclassificação automática do torneio foi definido para {NUMBER} minuto.", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minutes.": "O temporizador de desclassificação automática do torneio foi definido para {NUMBER} minutos.", // NEEDS QC
	"Tournament automatic disqualification warning": "Aviso de desclassificação automática do torneio", // NEEDS QC
	"Time": "Tempo", // NEEDS QC
	"{NUMBER} sec": "{NUMBER} s", // NEEDS QC
	"The tournament's automatic start is now off.": "O início automático do torneio está desativado.", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minute.": "O torneio começará automaticamente em {NUMBER} minuto.", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minutes.": "O torneio começará automaticamente em {NUMBER} minutos.", // NEEDS QC
	"Scouting is now allowed (Tournament players can watch other tournament battles)": "O scouting agora é permitido (jogadores do torneio podem assistir a outras batalhas do torneio)", // NEEDS QC
	"Scouting is now banned (Tournament players can't watch other tournament battles)": "O scouting agora é proibido (jogadores do torneio não podem assistir a outras batalhas do torneio)", // NEEDS QC
	"Tournament challenges available": "Desafios de torneio disponíveis", // NEEDS QC
	"Tournament challenge from {PLAYER}": "Desafio de torneio de {PLAYER}", // NEEDS QC
	"Tournament battle between {PLAYER1} and {PLAYER2} started.": "Batalha de torneio entre {PLAYER1} e {PLAYER2} iniciada.", // NEEDS QC
	"{PLAYER1} has won the match {SCORE} against {PLAYER2}": "{PLAYER1} venceu a partida {SCORE} contra {PLAYER2}", // NEEDS QC
	"{PLAYER1} has lost the match {SCORE} against {PLAYER2}": "{PLAYER1} perdeu a partida {SCORE} contra {PLAYER2}", // NEEDS QC
	"{PLAYER1} has drawn the match {SCORE} against {PLAYER2}": "{PLAYER1} empatou a partida {SCORE} contra {PLAYER2}", // NEEDS QC
	" but the tournament does not support drawing, so it did not count": ", mas o torneio não permite empates, então não contou", // NEEDS QC
	"Congratulations to {WINNERS} for winning the {TOURNAMENT}!": "Parabéns a {WINNERS} por vencer o {TOURNAMENT}!", // NEEDS QC
	"Runners-up": "Vice-campeões", // NEEDS QC
	"Runner-up": "Vice-campeão", // NEEDS QC
	"The tournament was forcibly ended.": "O torneio foi encerrado à força.", // NEEDS QC
	"The tournament has already started.": "O torneio já começou.", // NEEDS QC
	"The tournament hasn't started yet.": "O torneio ainda não começou.", // NEEDS QC
	"You are already in the tournament.": "Você já está no torneio.", // NEEDS QC
	"One of your alts is already in the tournament.": "Uma de suas contas alternativas já está no torneio.", // NEEDS QC
	"You aren't in the tournament.": "Você não está no torneio.", // NEEDS QC
	"This user isn't in the tournament.": "Este usuário não está no torneio.", // NEEDS QC
	"There aren't enough users.": "Não há usuários suficientes.", // NEEDS QC
	"That isn't a valid timeout value.": "Esse não é um valor de tempo válido.", // NEEDS QC
	"That isn't a valid tournament matchup.": "Esse não é um confronto de torneio válido.", // NEEDS QC
	"You must have a name in order to join the tournament.": "Você precisa de um nome para entrar no torneio.", // NEEDS QC
	"The tournament is already at maximum capacity for users.": "O torneio já está na capacidade máxima.", // NEEDS QC
	"You have already been disqualified.": "Você já foi desclassificado.", // NEEDS QC
	"This user has already been disqualified.": "Este usuário já foi desclassificado.", // NEEDS QC
	"You are banned from entering tournaments.": "Você está proibido de participar de torneios.", // NEEDS QC
	"Unknown error: {ERROR}": "Erro desconhecido: {ERROR}", // NEEDS QC
	"Waiting for battles to become available...": "Esperando batalhas ficarem disponíveis...", // NEEDS QC
	"vs. {PLAYER}": "vs. {PLAYER}", // NEEDS QC
	"Or wait for {PLAYERS} to challenge you.": "Ou espere {PLAYERS} desafiar você.", // NEEDS QC
	"Waiting for {PLAYERS} to challenge you.": "Esperando {PLAYERS} desafiar você.", // NEEDS QC
	"Waiting for {PLAYER}...": "Esperando {PLAYER}...", // NEEDS QC
	"Unavailable": "Indisponível", // NEEDS QC
	"Waiting": "Aguardando", // NEEDS QC
	"Challenging": "Desafiando", // NEEDS QC

	// TRANSLATORS: command errors
	"This player does not exist or is not online.": "Este jogador não existe ou não está online.", // NEEDS QC
	"This command can only be used in proper chat rooms.": "Este comando só pode ser usado em salas de chat propriamente ditas.", // NEEDS QC
	"Error: corrupted ranking data": "Erro: dados de classificação corrompidos", // NEEDS QC
	"You are not in a battle": "Você não está em uma batalha", // NEEDS QC
	"Invalid turn number: {NUMBER}": "Número de turno inválido: {NUMBER}", // NEEDS QC
	"Turn navigation is disabled in hardcore mode.": "A navegação entre turnos está desativada no modo hardcore.", // NEEDS QC
	"You are not a player in this battle": "Você não é um jogador desta batalha", // NEEDS QC
	"Can only be used in a DM.": "Só pode ser usado em uma DM.", // NEEDS QC
	"Please wait 5 seconds before challenging again.": "Espere 5 segundos antes de desafiar novamente.", // NEEDS QC

	// #endregion Chat

	// #region Teambuilder
	// ==================================================================

	// TRANSLATORS: This is for the Teams list view so it can't be singular
	// TRANSLATORS: Should be something like "Teams List" if you have no singular
	// TRANSLATORS: Can be different from TL.term.teams, which "Teams" as in "plural of Team"
	"Teams": "Equipes", // NEEDS QC
	"[New team]": "Nova equipe", // NEEDS QC
	"[New team in folder]": "Nova equipe na pasta", // NEEDS QC
	"[New {FORMAT} team]": "Nova equipe de {FORMAT}", // NEEDS QC
	"[New box]": "Nova caixa", // NEEDS QC
	// TRANSLATORS: When deleting a folder, button to add folder name to all teams in it
	"[Convert to prefix]": "Colocar o nome da pasta como prefixo", // NEEDS QC
	"[(add folder)]": "(adicionar pasta)", // NEEDS QC
	"[(add format folder)]": "(adicionar pasta de formato)", // NEEDS QC
	"Names can't contain slashes, since they're used as a folder separator.": "Nomes não podem conter barras, pois são usadas como separador de pastas.", // NEEDS QC
	"Names can't contain the character |, since they're used for storing teams.": "Nomes não podem conter o caractere |, pois é usado para armazenar equipes.", // NEEDS QC
	"New name required": "Novo nome necessário", // NEEDS QC
	"Not in a folder": "Não está em uma pasta", // NEEDS QC
	"Teams not in any folders": "Equipes sem pasta", // NEEDS QC
	"All teams": "Todas as equipes", // NEEDS QC
	"Folders": "Pastas", // NEEDS QC

	// TRANSLATORS: for Clipboard actions
	"Copied!": "Copiado!", // NEEDS QC
	"[Paste copy here]": "Colar cópia aqui", // NEEDS QC
	"[Add to clipboard]": "Adicionar à área de transferência", // NEEDS QC
	"[Copy/Move]": "Copiar/Mover", // NEEDS QC
	"[+ Clipboard]": "+ Área de transferência", // NEEDS QC
	"[Deselect]": "Desmarcar", // NEEDS QC
	"[Move here]": "Mover para cá", // NEEDS QC

	// TRANSLATORS: for Import/Export
	"[Backup]": "Backup", // NEEDS QC
	"[Backup search results]": "Backup dos resultados", // NEEDS QC
	"[Backup folder]": "Backup da pasta", // NEEDS QC
	"Import/Export": "Importar/Exportar", // NEEDS QC
	"[Import/Export]": "Importar/Exportar", // NEEDS QC
	"[Import]": "Importar", // NEEDS QC
	"(can't save partial exports)": "(não é possível salvar uma exibição parcial)", // NEEDS QC

	// TRANSLATORS: for uploaded teams
	"Account": "Conta", // NEEDS QC
	"Account (public)": "Conta (pública)", // NEEDS QC
	"Local": "Local", // NEEDS QC
	"Uploaded": "Enviado", // NEEDS QC
	"[Upload for shareable URL]": "Enviar para URL compartilhável", // NEEDS QC
	"[Upload for shareable/searchable URL]": "Enviar para URL compartilhável e pesquisável", // NEEDS QC
	"Disconnected (wrong account?)": "Desconectado (conta errada?)", // NEEDS QC
	"[Revert to uploaded version]": "Reverter para a versão enviada", // NEEDS QC
	"[Compare]": "Comparar", // NEEDS QC
	"[Upload changes]": "Enviar alterações", // NEEDS QC
	"Team was deleted": "A equipe foi excluída", // NEEDS QC
	"Team doesn't exist": "A equipe não existe", // NEEDS QC
	"Untitled team": "Equipe sem nome", // NEEDS QC
	"Uploaded by": "Enviado por", // NEEDS QC
	"Views": "Visualizações", // NEEDS QC
	"Team deleted": "Equipe excluída", // NEEDS QC
	"Not found": "Não encontrado", // NEEDS QC

	// TRANSLATORS: for the team editor
	"[Add Pokémon]": "Adicionar Pokémon", // NEEDS QC
	"(choose ability)": null, // NEEDS TRANSLATION
	"Details": "Detalhes", // NEEDS QC
	// TRANSLATORS: Teambuilder "form" with text boxes inside, not form/forme "form" of a pokemon
	"Form": "Formulário", // NEEDS QC
	"Tera": "Tera", // NEEDS QC
	// TRANSLATORS: These two are for Hidden Power type
	// TRANSLATORS: They're both designed to take up very little width, so keep that in mind
	"H.P.": "P. Oculto", // NEEDS QC
	"H. Power": "Poder Oculto", // NEEDS QC
	"Defensive coverage": "Cobertura defensiva", // NEEDS QC
	"Teambuilding resources for {FORMAT}": "Recursos de montagem de equipe para {FORMAT}", // NEEDS QC
	"[See all]": "Ver tudo", // NEEDS QC
	"Search species or filter by type, learnable moves, ability, tier, or egg group": "Procure um Pokémon ou filtre por tipo, movimentos aprendíveis, habilidade, tier ou grupo de ovos", // NEEDS QC
	"Search abilities": "Procurar habilidades", // NEEDS QC
	"Search items": "Procurar itens", // NEEDS QC
	"Search moves or filter by type or category": "Procure movimentos ou filtre por tipo ou categoria", // NEEDS QC
	"Sample sets": "Sets de exemplo", // NEEDS QC
	"Box sets": "Sets da caixa", // NEEDS QC
	"Guessed spread": "Distribuição estimada", // NEEDS QC
	"(Please choose 4 moves to get a guessed spread)": "(Escolha 4 movimentos para obter uma distribuição estimada)", // NEEDS QC
	"Protip": "Dica", // NEEDS QC
	"Use a different nature to save {NUMBER} EVs:": "Use uma natureza diferente para economizar {NUMBER} EVs:", // NEEDS QC
	"Use a different nature to get higher stats:": "Use uma natureza diferente para obter estatísticas melhores:", // NEEDS QC
	"Natures cannot raise or lower HP.": "Naturezas não podem aumentar nem diminuir os PS.", // NEEDS QC
	// TRANSLATORS: {STATCHANGES} is +stat/-stat
	"{STATCHANGES} nature": "Natureza {STATCHANGES}", // NEEDS QC
	// TRANSLATORS: {1} and {2} are the + and - keyboard keys
	"You can also set natures by typing {1} and {2} in the EV box.": "Você também pode definir a natureza digitando {1} e {2} na caixa de EVs.", // NEEDS QC
	"Pasted team": "Equipe colada", // NEEDS QC
	"Zoom out forms": "Reduzir os formulários", // NEEDS QC
	"Compact": "Compacto", // NEEDS QC
	"Comfortable": "Confortável", // NEEDS QC
	"Zoom out search results": "Reduzir os resultados de busca", // NEEDS QC
	"Fetching Paste...": "Carregando o Paste...", // NEEDS QC
	"Import/Export set": "Importar/exportar o set", // NEEDS QC
	"IV spreads": "Distribuições de IVs", // NEEDS QC
	"min Atk": "Ataque mín.", // NEEDS QC
	"min Atk, min Spe": "Ataque e Velocidade mín.", // NEEDS QC
	"max all": "tudo no máximo", // NEEDS QC
	"min Spe": "Velocidade mín.", // NEEDS QC
	"Hidden Power {TYPE} IVs": "IVs para Poder Oculto {TYPE}", // NEEDS QC
	"EVs, IVs, and nature": "EVs, IVs e natureza", // NEEDS QC
	"Base": "Base", // NEEDS QC
	"Remaining": "Restantes", // NEEDS QC

	// TRANSLATORS: errors
	"You must select a format first.": "Você precisa escolher um formato primeiro.", // NEEDS QC
	"This team is for a different account. Please log into the correct account to update it.": "Esta equipe é de outra conta. Entre com a conta correta para atualizá-la.", // NEEDS QC
	"Add a Pokémon to your team before uploading it.": "Adicione um Pokémon à sua equipe antes de enviá-la.", // NEEDS QC
	"Must use on an uploaded team.": "Só pode ser usado em uma equipe enviada.", // NEEDS QC
	"Team not found: {INPUT}": "Equipe não encontrada: {INPUT}", // NEEDS QC
	"Your file \"{FILENAME}\" is not a valid team.": "Seu arquivo \"{FILENAME}\" não é uma equipe válida.", // NEEDS QC

	// #endregion Teambuilder

	// #region Ladder
	// ==================================================================

	"[All formats]": "Todos os formatos", // NEEDS QC
	"[How the ladder works]": "Como funciona a classificação", // NEEDS QC
	"[Seasonal rankings]": "Classificações da temporada", // NEEDS QC
	"[Look up a specific user's rating]": "Consultar a avaliação de um usuário específico", // NEEDS QC
	"Name": "Nome", // NEEDS QC
	"Elo rating": "Avaliação Elo", // NEEDS QC
	"user's percentage chance of winning a random battle (Glicko X-Act Estimate)": "chance estimada de vencer uma batalha aleatória (estimativa Glicko X-Act)", // NEEDS QC
	"Glicko-1 rating system: rating±deviation (provisional if deviation>100)": "Sistema de avaliação Glicko-1: avaliação±desvio (provisório se desvio>100)", // NEEDS QC
	"No one has played any ranked games yet.": "Ninguém jogou partidas ranqueadas ainda.", // NEEDS QC

	// #endregion Ladder

	// #region Misc rooms
	// ==================================================================

	"[Join the Help room for live help]": "Peça ajuda na sala Help", // NEEDS QC
	"Unrecognized command: {INPUT}": "Comando não reconhecido: {INPUT}", // NEEDS QC

	// #endregion Misc rooms
};
