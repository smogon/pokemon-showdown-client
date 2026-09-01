// Remember, comments starting with "TRANSLATORS:" are from Showdown,
// and are shared between all translations. But other comments can be
// used as notes to yourself or other translators, and are specific
// to the Korean translation.

import type { UIText } from '../build-tools/translations.mts';
export const translations: UIText = {
	// #region Navigation
	// ==================================================================

	// TRANSLATORS: Note that "Home" and "Main Menu" refer to the same place
	// TRANSLATORS: So it's fine if they're the same word in your language
	"Home": "홈", // NEEDS QC
	// TRANSLATORS: This is used as a "Back to Home" button after battles
	"[Main menu]": "메인 메뉴", // NEEDS QC
	// TRANSLATORS: It's fine if "Teambuilder" and "Teams" are the same word in your language
	// TRANSLATORS: Also consider something like "Edit teams" for "Teambuilder"
	"Teambuilder": "팀 편집", // NEEDS QC
	// Korean players also say "래더" or "레이팅";
	// "랭킹" is clearest for the rankings page this opens
	"Ladder": "랭킹", // NEEDS QC
	// "대회" is a more general alternative
	"Tournaments": "토너먼트", // NEEDS QC
	"Friends": "친구", // NEEDS QC
	"Chat rooms": "채팅방", // NEEDS QC
	"Battles": "배틀", // NEEDS QC
	"News": "뉴스", // NEEDS QC
	"Offline": "오프라인", // NEEDS QC
	"[Join chat]": "채팅 참가", // NEEDS QC
	"[All tabs]": "모든 탭", // NEEDS QC
	"[Menu]": "메뉴", // NEEDS QC

	// #endregion Navigation

	// #region Generic UI
	// ==================================================================

	"[Hide]": "숨기기", // NEEDS QC
	"[Close]": "닫기", // NEEDS QC
	"[Done]": "완료", // NEEDS QC
	"[Back]": "뒤로", // NEEDS QC
	// TRANSLATORS: A computer copy command, like Ctrl+C
	"[Copy]": "복사", // NEEDS QC
	"[Edit]": "편집", // NEEDS QC
	"[Delete]": "삭제", // NEEDS QC
	"[Undo delete]": "삭제 취소", // NEEDS QC
	// TRANSLATORS: "DM" is used to label DMs; "[Chat]" is the button to send a DM
	// TRANSLATORS: Feel free to use the same word for both (and for "Chat" in the Battle section)
	// "귓속말" (whisper) is the traditional Korean gaming term, but "DM" is
	// widely understood now
	"DM": "DM", // NEEDS QC
	"[Chat]": "채팅", // NEEDS QC
	"[OK]": "확인", // NEEDS QC
	"[Cancel]": "취소", // NEEDS QC
	"[Accept]": "수락", // NEEDS QC
	"[Reject]": "거절", // NEEDS QC
	"Random team": "랜덤 팀", // NEEDS QC
	"[Sound]": "사운드", // NEEDS QC
	"[Options]": "설정", // NEEDS QC
	"[Battle options]": "배틀 설정", // NEEDS QC
	"[Revert]": "되돌리기", // NEEDS QC
	"[Refresh]": "새로고침", // NEEDS QC
	"[Search]": "검색", // NEEDS QC
	"[Validate]": "룰 체크", // NEEDS QC
	"[Reconnect]": "재접속", // NEEDS QC
	"Disconnected": "연결이 끊겼습니다", // NEEDS QC
	"Connecting...": "연결 중...", // NEEDS QC
	"Loading...": "로딩 중...", // NEEDS QC
	"Uploading...": "업로드 중...", // NEEDS QC
	"[Change]": "변경", // NEEDS QC
	"[Add]": "추가", // NEEDS QC
	"[Look up]": "검색", // NEEDS QC
	"[Save changes]": "저장", // NEEDS QC
	"[Create]": "만들기", // NEEDS QC
	"[Rename]": "이름 변경", // NEEDS QC
	"[Remove]": "제거", // NEEDS QC
	// TRANSLATORS: intentionally chosen to be very short. do not go longer than three letters for this one
	"Gen {NUMBER}": "{NUMBER}세대", // NEEDS QC
	"[Maximize]": "최대화", // NEEDS QC
	"[Expand/collapse]": "펼치기/접기", // NEEDS QC

	// TRANSLATORS: connection/team-storage errors
	"Sorry, psim connections are unsupported by your browser.": "사용 중인 브라우저는 psim 연결을 지원하지 않습니다.", // NEEDS QC
	"Your browser doesn't support third-party cookies. Some things might not work correctly.": "사용 중인 브라우저는 서드파티 쿠키를 지원하지 않습니다. 일부 기능이 제대로 작동하지 않을 수 있습니다.", // NEEDS QC
	"Your team storage format is too old for PS. You'll need to upgrade it at {URL}": "팀 저장 형식이 너무 오래되었습니다. {URL} 에서 업그레이드해 주세요", // NEEDS QC
	"Error loading uploaded teams: {ERROR}": "업로드된 팀 불러오기 오류: {ERROR}", // NEEDS QC
	"Error unknown. Try again later.": "알 수 없는 오류입니다. 나중에 다시 시도해 주세요.", // NEEDS QC
	"Failed to load team: {ERROR}": "팀을 불러오지 못했습니다: {ERROR}", // NEEDS QC
	"Error logging in.": "로그인 오류입니다.", // NEEDS QC
	"Something is interfering with our connection to the login server. Most likely, your internet provider needs you to re-log-in, or your internet provider is blocking Pokémon Showdown.": "로그인 서버 연결에 문제가 있습니다. 인터넷 제공업체에 재로그인이 필요하거나, 제공업체가 Pokémon Showdown을 차단하고 있을 가능성이 높습니다.", // NEEDS QC

	// TRANSLATORS: for constructing lists
	"{FIRST} or {SECOND}": "{FIRST} 또는 {SECOND}", // NEEDS QC
	"{FIRST} and {SECOND}": "{FIRST}, {SECOND}", // NEEDS QC
	", {NEXT}": ", {NEXT}", // NEEDS QC
	", or {LAST}": " 또는 {LAST}", // NEEDS QC
	", and {LAST}": ", {LAST}", // NEEDS QC
	// TRANSLATORS: this is for lists of users specifically
	// TRANSLATORS: (languages with counters should use the "person" counter)
	", and {NUMBER} others": " 외 {NUMBER}명", // NEEDS QC

	// #endregion Generic UI

	// #region Popups
	// ==================================================================

	// TRANSLATORS: user popup
	// TRANSLATORS: "Global {RANK}" is a rank, like "Global Moderator"
	"Global {RANK}": "글로벌 {RANK}", // NEEDS QC
	"Chatrooms": "채팅방", // NEEDS QC
	"Private rooms": "비공개 방", // NEEDS QC
	"OFFLINE": "오프라인", // NEEDS QC
	"Username": "유저명", // NEEDS QC
	"[Register]": "등록", // NEEDS QC
	"[Add status]": "상태 메시지 추가", // NEEDS QC
	"[Chat self]": "나와의 채팅", // NEEDS QC
	"[Change name]": "이름 변경", // NEEDS QC
	"[Log out]": "로그아웃", // NEEDS QC
	"[Add friend]": "친구 추가", // NEEDS QC
	"[Unignore]": "차단 해제", // NEEDS QC
	"[Ignore]": "차단", // NEEDS QC
	"[Report]": "신고", // NEEDS QC
	"[Mute]": "뮤트", // NEEDS QC
	"[7m]": "7분", // NEEDS QC
	"[Hourmute]": "1시간 뮤트", // NEEDS QC
	"[1h]": "1시간", // NEEDS QC
	"[Ban]": "밴", // NEEDS QC
	"[2d]": "2일", // NEEDS QC
	"[Weekban]": "1주일 밴", // NEEDS QC
	"[1w]": "1주일", // NEEDS QC
	"[Modlog]": "관리 로그", // NEEDS QC
	// TRANSLATORS: Showdown term for a global mute
	"[Lock]": "락", // NEEDS QC
	"[Weeklock]": "1주일 락", // NEEDS QC
	"[Namelock]": "네임락", // NEEDS QC
	"[Global modlog]": "전체 관리 로그", // NEEDS QC
	"[Avatar...]": "아바타...", // NEEDS QC
	"[Close room]": "방 닫기", // NEEDS QC
	"[Report a user]": "유저 신고", // NEEDS QC
	"({NUMBER} sec)": "({NUMBER}초)", // NEEDS QC
	"Room not found": "방을 찾을 수 없습니다", // NEEDS QC

	// TRANSLATORS: battle options
	"Side-by-side, controls below": "좌우 배치, 조작판 아래", // NEEDS QC
	"Side-by-side, overlay controls": "좌우 배치, 조작판 겹침", // NEEDS QC
	"Top-and-bottom, controls below": "상하 배치, 조작판 아래", // NEEDS QC
	"Top-and-bottom, overlay controls": "상하 배치, 조작판 겹침", // NEEDS QC
	"Scrolling, controls below": "스크롤, 조작판 아래", // NEEDS QC
	"Scrolling, overlay controls": "스크롤, 조작판 겹침", // NEEDS QC
	"Hardcore mode ON: Information not available in-game is now hidden.": "하드코어 모드 ON: 게임 내에서 볼 수 없는 정보를 숨깁니다.", // NEEDS QC
	"Hardcore mode OFF: Information not available in-game is now shown.": "하드코어 모드 OFF: 게임 내에서 볼 수 없는 정보를 표시합니다.", // NEEDS QC
	"Spectators ignored.": "관전자를 무시합니다.", // NEEDS QC
	"Spectators no longer ignored.": "관전자 무시를 해제했습니다.", // NEEDS QC
	"In this battle": "이 배틀", // NEEDS QC
	"Hardcore mode (hide info not shown in-game)": "하드코어 모드 (게임 내에서 볼 수 없는 정보 숨김)", // NEEDS QC
	"Ignore spectators": "관전자 무시", // NEEDS QC
	"Ignore opponent": "상대 무시", // NEEDS QC
	"Ignore nicknames": "닉네임 무시", // NEEDS QC
	"All battles": "모든 배틀", // NEEDS QC
	"Layout": "레이아웃", // NEEDS QC
	"Automatic ({SETTING})": "자동 ({SETTING})", // NEEDS QC
	"Automatic": "자동", // NEEDS QC
	"(DESKTOP)": "(데스크톱)", // NEEDS QC
	"(MOBILE VERTICAL)": "(모바일 세로)", // NEEDS QC
	"(MOBILE HORIZONTAL)": "(모바일 가로)", // NEEDS QC
	"You can still invite spectators by giving them the URL or using the /invite command": "URL을 알려주거나 /invite 명령어로 관전자를 초대할 수 있습니다", // NEEDS QC
	"Invite only (hide from Battles list)": "초대 전용 (배틀 목록에서 숨김)", // NEEDS QC
	"Ignore Pokémon nicknames": "포켓몬 닉네임 무시", // NEEDS QC
	"Automatically start timer": "타이머 자동 시작", // NEEDS QC
	"Hardcore mode": "하드코어 모드", // NEEDS QC
	"Start at turn 0 when spectating battles": "관전 시 0턴부터 시작", // NEEDS QC
	"Open new battles in the right-side panel": "새 배틀을 오른쪽 패널에서 열기", // NEEDS QC

	// TRANSLATORS: options
	"General": "일반", // NEEDS QC
	"Language": "언어", // NEEDS QC
	"Appearance": "외관", // NEEDS QC
	"Theme": "테마", // NEEDS QC
	"Light": "라이트", // NEEDS QC
	"Dark": "다크", // NEEDS QC
	"Match system theme": "시스템 테마에 맞춤", // NEEDS QC
	"Two panels (if wide enough)": "2개 패널 (화면이 넓으면)", // NEEDS QC
	"Single panel": "단일 패널", // NEEDS QC
	"Vertical tabs": "세로 탭", // NEEDS QC
	"Background": "배경", // NEEDS QC
	"Disable animations": "애니메이션 끄기", // NEEDS QC
	"Use 2D sprites instead of 3D models": "3D 모델 대신 2D 스프라이트 사용", // NEEDS QC
	"Use modern sprites for past generations": "과거 세대에도 최신 스프라이트 사용", // NEEDS QC
	"Block DMs": "DM 차단", // NEEDS QC
	"Block challenges": "대전 신청 차단", // NEEDS QC
	"Show DMs in chatrooms": "채팅방에 DM 표시", // NEEDS QC
	"Do not highlight when your name is said in chat": "채팅에서 내 이름이 언급돼도 강조하지 않기", // NEEDS QC
	"Confirm before leaving a room": "방을 나가기 전에 확인", // NEEDS QC
	"Confirm before refreshing": "새로고침 전에 확인", // NEEDS QC
	"Always notify": "항상 알림", // NEEDS QC
	"Notify when joined": "참가 중일 때만 알림", // NEEDS QC
	"Hide": "숨기기", // NEEDS QC
	"Timestamps": "타임스탬프", // NEEDS QC
	"Off": "끄기", // NEEDS QC
	"Timestamps in DMs": "DM 타임스탬프", // NEEDS QC
	"Chat preferences": "채팅 설정", // NEEDS QC
	"[Change background]": "배경 변경", // NEEDS QC
	"[Text formatting...]": "텍스트 서식...", // NEEDS QC
	"[Set as background]": "배경으로 설정", // NEEDS QC
	"[Random]": "랜덤", // NEEDS QC

	// TRANSLATORS: team chooser
	"(uncategorized)": "(미분류)", // NEEDS QC
	"(all)": "(전체)", // NEEDS QC
	"[Other gens]": "다른 세대", // NEEDS QC
	"Select a team": "팀 선택", // NEEDS QC
	"This team selector is no longer available (the challenge was cancelled or something).": "이 팀 선택창은 더 이상 사용할 수 없습니다 (대전 신청이 취소되었거나 해서).", // NEEDS QC
	"No teams found": "팀을 찾을 수 없습니다", // NEEDS QC
	"This format selector is no longer available.": "이 포맷 선택창은 더 이상 사용할 수 없습니다.", // NEEDS QC
	"Search formats": "포맷 검색", // NEEDS QC

	// TRANSLATORS: login
	"[Choose name]": "이름 정하기", // NEEDS QC
	"Logging in...": "로그인 중...", // NEEDS QC
	"[Log in]": "로그인", // NEEDS QC
	"[Try another name]": "다른 이름 사용", // NEEDS QC
	"[Password...]": "비밀번호...", // NEEDS QC
	"[Change password]": "비밀번호 변경", // NEEDS QC
	"[Show password]": "비밀번호 표시", // NEEDS QC
	"Loading Google log-in button...": "Google 로그인 버튼 불러오는 중...", // NEEDS QC
	"(color)": "(색)", // NEEDS QC
	"(Others will be able to see your name change. To change name privately, use \"Log out\")": "(다른 사람이 이름 변경을 볼 수 있습니다. 몰래 바꾸려면 \"로그아웃\"을 사용하세요)", // NEEDS QC
	"if you registered this name:": "이 이름을 등록했다면:", // NEEDS QC
	"if not:": "아니라면:", // NEEDS QC
	"This is someone else's account. Sorry.": "다른 사람의 계정입니다. 죄송합니다.", // NEEDS QC
	"Password": "비밀번호", // NEEDS QC

	// TRANSLATORS: register / change password
	"All fields are required": "모든 항목을 입력해 주세요", // NEEDS QC
	"Passwords do not match": "비밀번호가 일치하지 않습니다", // NEEDS QC
	"Your password was successfully changed!": "비밀번호가 변경되었습니다!", // NEEDS QC
	"Change your password:": "비밀번호 변경:", // NEEDS QC
	"Old password": "기존 비밀번호", // NEEDS QC
	"New password": "새 비밀번호", // NEEDS QC
	"New password (confirm)": "새 비밀번호 (확인)", // NEEDS QC
	"You have been successfully registered.": "등록이 완료되었습니다.", // NEEDS QC
	"Register your account:": "계정 등록:", // NEEDS QC
	"Password (confirm)": "비밀번호 (확인)", // NEEDS QC
	"An Electric-type mouse that is the mascot of the Pokémon franchise.": "포켓몬 시리즈의 마스코트인 전기 타입 쥐 포켓몬.", // NEEDS QC
	"What is this Pokémon?": "이 포켓몬은 누구일까요?", // NEEDS QC

	// #endregion Popups

	// #region Main Menu
	// ==================================================================

	// TRANSLATORS: Our famous ladder queue button. Give it some flair :)
	// TRANSLATORS: Might we suggest "Showdown!"
	"[Battle!]": "배틀!", // NEEDS QC
	"Find a random opponent": "랜덤 상대 찾기", // NEEDS QC
	"Watch a battle": "배틀 관전", // NEEDS QC
	"Find a user": "유저 검색", // NEEDS QC
	"Info & Resources": "정보 및 자료", // NEEDS QC
	"Lobby chat": "로비 채팅", // NEEDS QC

	// TRANSLATORS: Challenge/Search UI
	"[Challenge]": "배틀 신청", // NEEDS QC
	"Custom rules": "커스텀 룰", // NEEDS QC
	// TRANSLATORS: Search countdown. {NUMBER} = a number of seconds
	// TRANSLATORS: English doesn't include the unit (seconds) but your language can
	"Searching in {NUMBER}...": "{NUMBER}초 후에 상대를 찾습니다...", // NEEDS QC
	"Searching...": "상대를 찾는 중...", // NEEDS QC
	"Pokédex": "포켓몬 도감", // NEEDS QC
	"Replays": "리플레이", // NEEDS QC
	"Forum": "포럼", // NEEDS QC
	"Rules": "규칙", // NEEDS QC
	"Credits": "크레딧", // NEEDS QC
	"Privacy": "개인정보", // NEEDS QC
	"background by {ARTIST}": "배경: {ARTIST}", // NEEDS QC

	// TRANSLATORS: errors
	"Wait for this countdown to finish first...": "카운트다운이 끝날 때까지 기다려 주세요...", // NEEDS QC
	"You're already searching for a {FORMAT} battle...": "이미 {FORMAT} 배틀 상대를 찾는 중입니다...", // NEEDS QC
	"You need to go into the Teambuilder and build a team for this format.": "팀빌더에서 이 포맷용 팀을 만들어야 합니다.", // NEEDS QC

	// #endregion Main Menu

	// #region Rooms
	// ==================================================================

	// TRANSLATORS: these go under the user/battle counts, and in English they read as "100 users online"
	// TRANSLATORS: but they don't have to work that way in your language
	"users online": "명 접속 중", // NEEDS QC
	// label-style (no counter) to fit the box, like ja's 対戦進行中
	"active battles": "배틀 진행 중", // NEEDS QC
	"Find an online user": "온라인 유저 찾기", // NEEDS QC
	"Watch an active battle": "진행 중인 배틀 관전하기", // NEEDS QC
	"Meloetta is PS's mascot! The Aria forme is about using its voice, and represents our chatrooms.": "메로엣타는 PS의 마스코트! 보이스폼은 목소리를 사용하는 모습으로, 채팅방을 상징합니다.", // NEEDS QC
	"Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles.": "메로엣타는 PS의 마스코트! 스텝폼은 격투타입으로, 배틀을 상징합니다.", // NEEDS QC

	"Official chat rooms": "공식 채팅방", // NEEDS QC
	"Hidden rooms": "숨겨진 방", // NEEDS QC

	"Subrooms": "하위 방", // NEEDS QC
	"(All rooms)": "(모든 방)", // NEEDS QC
	"Join or search for rooms": "방 참가 또는 검색", // NEEDS QC
	"Command": "명령어", // NEEDS QC
	"Console": "콘솔", // NEEDS QC
	"Enter = run command {INPUT}": "Enter = 명령어 {INPUT} 실행", // NEEDS QC
	"(Subroom of {ROOM})": "({ROOM}의 하위 방)", // NEEDS QC
	"Possible secret room": "비밀 방일 가능성", // NEEDS QC
	"(Private room?)": "(비공개 방?)", // NEEDS QC
	"Search results": "검색 결과", // NEEDS QC

	// #endregion Rooms

	// #region Battle
	// ==================================================================

	// TRANSLATORS: Note that most translations of battle UI are in the server repository
	// TRANSLATORS: In data/text/[lang]/default.ts and data/text/[lang]/names.ts

	// TRANSLATORS: [Team]/[Battle]/[Switch]/[Shift] are buttons in overlay controls
	// TRANSLATORS: But they're section headers in normal battle controls
	// TRANSLATORS: For the "Use move" menu in battle controls
	// TRANSLATORS: This was "Attack" in older Showdown, "FIGHT" on older cart, and "Battle" on modern cart
	// SV battle menu: 싸운다
	"[Battle]": "싸운다", // NEEDS QC
	// TRANSLATORS: For the "Switch" menu in battle controls
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Switch]": "교체", // NEEDS QC
	// TRANSLATORS: For the Team Preview menu in battle controls
	// TRANSLATORS: Also replaces "[Switch]" in phases where switching isn't possible
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Team]": "팀", // NEEDS QC
	// TRANSLATORS: The Triples "move to center" button
	// TRANSLATORS: This is "SHIFT" on older cart; Triples doesn't exist on modern cart
	// ORAS battle menu (the last games with Triples): 이동
	"[Shift]": "이동", // NEEDS QC

	// TRANSLATORS: Mobile-layout buttons for switching between the battle view and the chat view
	// TRANSLATORS: ("Chat" is also used as a section header in the options popup)
	"Battle": "배틀", // NEEDS QC
	"Chat": "채팅", // NEEDS QC
	"[Try Fight button]": "싸운다 버튼 시험하기", // NEEDS QC
	// TRANSLATORS: For the "where to target this move" menu
	"(empty slot)": "(빈 슬롯)", // NEEDS QC
	"Maxed with no max moves": "사용할 수 있는 다이맥스 기술이 없습니다", // NEEDS QC
	"No Z moves": "Z기술이 없습니다", // NEEDS QC

	"[Rematch]": "재대결", // NEEDS QC
	"[Offer tie]": "무승부 제안", // NEEDS QC
	"[Forfeit]": "기권", // NEEDS QC
	"[Forfeit and close]": "기권하고 닫기", // NEEDS QC
	"[Replace player]": "플레이어 교대", // NEEDS QC
	"[Replace]": "교대", // NEEDS QC
	"(turn 100+)": "(100턴 이후)", // NEEDS QC
	"[Stop timer]": "타이머 정지", // NEEDS QC
	"[Start timer]": "타이머 시작", // NEEDS QC
	"Enter player's name": "플레이어 이름을 입력해 주세요", // NEEDS QC
	"Cannot replace player, battle has already ended.": "배틀이 이미 끝나서 플레이어를 교체할 수 없습니다.", // NEEDS QC

	// TRANSLATORS: for replay controls
	"[Play]": "재생", // NEEDS QC
	"[Pause]": "일시정지", // NEEDS QC
	"[First turn]": "첫 턴", // NEEDS QC
	"[Prev turn]": "이전 턴", // NEEDS QC
	"[Skip turn]": "다음 턴", // NEEDS QC
	"[Skip to end]": "끝까지 넘기기", // NEEDS QC
	"[Switch viewpoint]": "시점 전환", // NEEDS QC
	"[Go to turn]": "턴 지정", // NEEDS QC
	"[Skip]": "스킵", // NEEDS QC
	"[Skip animation]": "애니메이션 스킵", // NEEDS QC
	"[Move to center]": "중앙으로 이동", // NEEDS QC
	"[Upload and share replay]": "리플레이 업로드 및 공유", // NEEDS QC
	"[Replay]": "리플레이", // NEEDS QC
	"(closes this battle)": "(이 배틀을 닫습니다)", // NEEDS QC

	// TRANSLATORS: for the battle list
	"Minimum Elo": "최소 Elo", // NEEDS QC
	"rated {ELO}": "레이팅 {ELO}", // NEEDS QC
	// TRANSLATORS: goes between two usernames; the key includes its surrounding spacing so some languages can drop it
	"{PLAYER1} vs. {PLAYER2}": "{PLAYER1} vs. {PLAYER2}", // NEEDS QC
	"(All formats)": "(모든 포맷)", // NEEDS QC
	"Username prefix": "유저명 앞부분", // NEEDS QC
	"No battles are going on": "진행 중인 배틀이 없습니다", // NEEDS QC
	"{NUMBER} battle": "배틀 {NUMBER}개", // NEEDS QC
	"{NUMBER} battles": "배틀 {NUMBER}개", // NEEDS QC
	"None": "없음", // NEEDS QC
	"Timer": "타이머", // NEEDS QC
	"Error": "오류", // NEEDS QC
	"The battle you're looking for has expired. Battles expire after 15 minutes of inactivity unless they're saved.": "찾으시는 배틀이 만료되었습니다. 배틀은 저장하지 않으면 15분간 활동이 없을 때 만료됩니다.", // NEEDS QC
	"In the future, remember to click \"Save replay\" to save a replay permanently.": "다음부터는 \"리플레이 저장\"을 누르면 리플레이를 영구히 저장할 수 있습니다.", // NEEDS QC
	"Unrecognized HTML file: Only replay files are supported.": "인식할 수 없는 HTML 파일입니다. 리플레이 파일만 지원합니다.", // NEEDS QC
	"You are still in {ROOM}": "아직 {ROOM}에 참가 중입니다", // NEEDS QC
	"Battle \"{INPUT}\" not found": "배틀 \"{INPUT}\"을(를) 찾을 수 없습니다", // NEEDS QC
	"Uploaded replay": "업로드된 리플레이", // NEEDS QC
	"Team {PLAYER}": "팀 {PLAYER}", // NEEDS QC
	"{PLAYER} and friends": "{PLAYER}와(과) 친구들", // NEEDS QC

	// TRANSLATORS: battle log messages
	"[Earlier messages]": "이전 메시지", // NEEDS QC
	"Register an account to protect your ladder rating!": "계정을 등록해서 레이팅을 보호하세요!", // NEEDS QC
	"Open team sheet for {PLAYER}": "{PLAYER}의 팀 시트 열기", // NEEDS QC
	"Warning": "경고", // NEEDS QC
	"Variation": "변형", // NEEDS QC
	"Rated battle": "레이팅 배틀", // NEEDS QC

	// TRANSLATORS: screen reader labels
	"Active Pokémon": "배틀에 나와 있는 포켓몬", // NEEDS QC
	"Your team": "내 팀", // NEEDS QC
	"Opponent's team": "상대 팀", // NEEDS QC
	"Statused": "상태 이상 있음", // NEEDS QC
	"Non-statused": "상태 이상 없음", // NEEDS QC
	"Unrevealed Illusion user": "정체불명의 일루전 사용자", // NEEDS QC
	"Not revealed": "미공개", // NEEDS QC
	"Battle controls": "배틀 조작", // NEEDS QC

	// #endregion Battle

	// #region Chat
	// ==================================================================

	"{NUMBER} user": "{NUMBER}명", // NEEDS QC
	"{NUMBER} users": "{NUMBER}명", // NEEDS QC
	"[Join]": "참가", // NEEDS QC
	"[Leave]": "나가기", // NEEDS QC
	"[Ready!]": "준비 완료!", // NEEDS QC
	"In progress": "진행 중", // NEEDS QC
	"Signups": "참가 접수 중", // NEEDS QC
	"[Pop-out]": "새 창으로", // NEEDS QC
	"[Go]": "이동", // NEEDS QC
	"[Visit]": "열기", // NEEDS QC
	"[Choose a name before sending messages]": "메시지를 보내려면 이름을 정해 주세요", // NEEDS QC
	"Challenging...": "대전 신청 중...", // NEEDS QC
	"Accepting...": "수락 중...", // NEEDS QC
	"[Commands]": "명령어", // NEEDS QC
	"Mentioned by {USER} in {ROOM}": "{ROOM}에서 {USER}님이 언급했습니다", // NEEDS QC
	"{USERS} joined": "{USERS}님 입장", // NEEDS QC
	// TRANSLATORS: separates "X joined" from "Y left"
	"{JOINEDMESSAGE}; {LEFTMESSAGE}": "{JOINEDMESSAGE}; {LEFTMESSAGE}", // NEEDS QC
	"{USERS} left": "{USERS}님 퇴장", // NEEDS QC
	"{USER} renamed from {OLDUSER}.": "{OLDUSER}님이 {USER}(으)로 이름을 변경했습니다.", // NEEDS QC
	"(Private to {USER})": "({USER}님에게만 보임)", // NEEDS QC
	"{FORMAT} battle started between {PLAYER1} and {PLAYER2}.": "{PLAYER1}님과 {PLAYER2}님의 {FORMAT} 배틀이 시작되었습니다.", // NEEDS QC
	// TRANSLATORS: for when the format name already includes "battle"
	"{FORMAT} started between {PLAYER1} and {PLAYER2}.": "{PLAYER1}님과 {PLAYER2}님의 {FORMAT}이(가) 시작되었습니다.", // NEEDS QC
	// TRANSLATORS: for when the format is unknown
	"Battle started between {PLAYER1} and {PLAYER2}.": "{PLAYER1}님과 {PLAYER2}님의 배틀이 시작되었습니다.", // NEEDS QC
	"({NUMBER} line from {USER} hidden)": "({USER}님의 메시지 {NUMBER}줄 숨김)", // NEEDS QC
	"({NUMBER} lines from {USER} hidden)": "({USER}님의 메시지 {NUMBER}줄 숨김)", // NEEDS QC
	"{USER} invited you to join the room \"{ROOM}\"": "{USER}님이 \"{ROOM}\" 방에 초대했습니다", // NEEDS QC
	"[Join {ROOM}]": "{ROOM} 참가", // NEEDS QC
	"Chat log": "채팅 로그", // NEEDS QC

	// TRANSLATORS: tournaments
	"Please respond to the tournament within {SECONDS} seconds or you may be automatically disqualified.": "{SECONDS}초 안에 토너먼트에 응답하지 않으면 자동으로 실격될 수 있습니다.", // NEEDS QC
	"Single Elimination": "싱글 엘리미네이션", // NEEDS QC
	"Double Elimination": "더블 엘리미네이션", // NEEDS QC
	"Round Robin": "리그전", // NEEDS QC
	"Double Round Robin": "더블 리그전", // NEEDS QC
	"{JOINS} joined the tournament": "{JOINS}님이 토너먼트에 참가했습니다", // NEEDS QC
	"{LEAVES} left the tournament": "{LEAVES}님이 토너먼트에서 나갔습니다", // NEEDS QC
	// TRANSLATORS: sentence terminator for messages like the above
	"{SENTENCE}.": "{SENTENCE}.", // NEEDS QC
	"{FORMAT} {TYPE} tournament": "{FORMAT} {TYPE} 토너먼트", // NEEDS QC
	"No tournaments are currently running.": "현재 진행 중인 토너먼트가 없습니다.", // NEEDS QC
	"(started)": "(시작됨)", // NEEDS QC
	"{TOURNAMENT} created.": "{TOURNAMENT}이(가) 생성되었습니다.", // NEEDS QC
	"{TOURNAMENT} created (and hidden).": "{TOURNAMENT}이(가) 생성되었습니다 (숨겨짐).", // NEEDS QC
	"Tournament created": "토너먼트 생성됨", // NEEDS QC
	// TRANSLATORS: label, as in "Room: lobby"
	"Room": "방", // NEEDS QC
	"Type": "방식", // NEEDS QC
	"{USER} has joined the tournament, replacing {OLDUSER}.": "{USER}님이 {OLDUSER}님을 대신해 토너먼트에 참가했습니다.", // NEEDS QC
	"({NUMBER} players)": "({NUMBER}명)", // NEEDS QC
	"The tournament has started!": "토너먼트가 시작되었습니다!", // NEEDS QC
	"{USER} has been disqualified from the tournament.": "{USER}님이 토너먼트에서 실격되었습니다.", // NEEDS QC
	"The tournament's automatic disqualify timer has been turned off.": "토너먼트 자동 실격 타이머가 꺼졌습니다.", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minute.": "토너먼트 자동 실격 타이머가 {NUMBER}분으로 설정되었습니다.", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minutes.": "토너먼트 자동 실격 타이머가 {NUMBER}분으로 설정되었습니다.", // NEEDS QC
	"Tournament automatic disqualification warning": "토너먼트 자동 실격 경고", // NEEDS QC
	"Time": "시간", // NEEDS QC
	"{NUMBER} sec": "{NUMBER}초", // NEEDS QC
	"The tournament's automatic start is now off.": "토너먼트 자동 시작이 꺼졌습니다.", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minute.": "토너먼트가 {NUMBER}분 후 자동으로 시작됩니다.", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minutes.": "토너먼트가 {NUMBER}분 후 자동으로 시작됩니다.", // NEEDS QC
	"Scouting is now allowed (Tournament players can watch other tournament battles)": "정찰이 허용되었습니다 (토너먼트 참가자가 다른 토너먼트 배틀을 관전할 수 있습니다)", // NEEDS QC
	"Scouting is now banned (Tournament players can't watch other tournament battles)": "정찰이 금지되었습니다 (토너먼트 참가자가 다른 토너먼트 배틀을 관전할 수 없습니다)", // NEEDS QC
	"Tournament challenges available": "토너먼트 대전 신청 가능", // NEEDS QC
	"Tournament challenge from {PLAYER}": "{PLAYER}님의 토너먼트 대전 신청", // NEEDS QC
	"Tournament battle between {PLAYER1} and {PLAYER2} started.": "{PLAYER1}님과 {PLAYER2}님의 토너먼트 배틀이 시작되었습니다.", // NEEDS QC
	"{PLAYER1} has won the match {SCORE} against {PLAYER2}": "{PLAYER1}님이 {PLAYER2}님을 상대로 {SCORE}로 승리했습니다", // NEEDS QC
	"{PLAYER1} has lost the match {SCORE} against {PLAYER2}": "{PLAYER1}님이 {PLAYER2}님을 상대로 {SCORE}로 패배했습니다", // NEEDS QC
	"{PLAYER1} has drawn the match {SCORE} against {PLAYER2}": "{PLAYER1}님이 {PLAYER2}님과 {SCORE}로 무승부를 기록했습니다", // NEEDS QC
	" but the tournament does not support drawing, so it did not count": " (하지만 이 토너먼트는 무승부를 지원하지 않아 무효 처리되었습니다)", // NEEDS QC
	"Congratulations to {WINNERS} for winning the {TOURNAMENT}!": "{TOURNAMENT} 우승을 차지한 {WINNERS}님, 축하합니다!", // NEEDS QC
	"Runners-up": "준우승", // NEEDS QC
	"Runner-up": "준우승", // NEEDS QC
	"The tournament was forcibly ended.": "토너먼트가 강제로 종료되었습니다.", // NEEDS QC
	"The tournament has already started.": "토너먼트가 이미 시작되었습니다.", // NEEDS QC
	"The tournament hasn't started yet.": "토너먼트가 아직 시작되지 않았습니다.", // NEEDS QC
	"You are already in the tournament.": "이미 토너먼트에 참가 중입니다.", // NEEDS QC
	"One of your alts is already in the tournament.": "당신의 다른 계정이 이미 토너먼트에 참가 중입니다.", // NEEDS QC
	"You aren't in the tournament.": "토너먼트에 참가하고 있지 않습니다.", // NEEDS QC
	"This user isn't in the tournament.": "이 유저는 토너먼트에 참가하고 있지 않습니다.", // NEEDS QC
	"There aren't enough users.": "유저 수가 부족합니다.", // NEEDS QC
	"That isn't a valid timeout value.": "잘못된 타이머 값입니다.", // NEEDS QC
	"That isn't a valid tournament matchup.": "잘못된 토너먼트 대진입니다.", // NEEDS QC
	"You must have a name in order to join the tournament.": "토너먼트에 참가하려면 이름이 필요합니다.", // NEEDS QC
	"The tournament is already at maximum capacity for users.": "토너먼트 정원이 가득 찼습니다.", // NEEDS QC
	"You have already been disqualified.": "이미 실격되었습니다.", // NEEDS QC
	"This user has already been disqualified.": "이 유저는 이미 실격되었습니다.", // NEEDS QC
	"You are banned from entering tournaments.": "토너먼트 참가가 금지되어 있습니다.", // NEEDS QC
	"Unknown error: {ERROR}": "알 수 없는 오류: {ERROR}", // NEEDS QC
	"Waiting for battles to become available...": "배틀이 가능해질 때까지 기다려 주세요...", // NEEDS QC
	"vs. {PLAYER}": "vs. {PLAYER}", // NEEDS QC
	"Or wait for {PLAYERS} to challenge you.": "또는 {PLAYERS}님의 신청을 기다리세요.", // NEEDS QC
	"Waiting for {PLAYERS} to challenge you.": "{PLAYERS}님의 신청을 기다리는 중입니다.", // NEEDS QC
	"Waiting for {PLAYER}...": "{PLAYER}님을 기다리는 중...", // NEEDS QC
	"Unavailable": "불가", // NEEDS QC
	"Waiting": "대기 중", // NEEDS QC
	"Challenging": "신청 중", // NEEDS QC

	// TRANSLATORS: command errors
	"This player does not exist or is not online.": "존재하지 않거나 접속 중이 아닌 플레이어입니다.", // NEEDS QC
	"This command can only be used in proper chat rooms.": "이 명령어는 채팅방에서만 사용할 수 있습니다.", // NEEDS QC
	"Error: corrupted ranking data": "오류: 랭킹 데이터가 손상되었습니다", // NEEDS QC
	"You are not in a battle": "배틀 중이 아닙니다", // NEEDS QC
	"Invalid turn number: {NUMBER}": "잘못된 턴 번호: {NUMBER}", // NEEDS QC
	"Turn navigation is disabled in hardcore mode.": "하드코어 모드에서는 턴 이동을 사용할 수 없습니다.", // NEEDS QC
	"You are not a player in this battle": "이 배틀의 플레이어가 아닙니다", // NEEDS QC
	"Can only be used in a DM.": "DM에서만 사용할 수 있습니다.", // NEEDS QC
	"Please wait 5 seconds before challenging again.": "다시 대전 신청하려면 5초 기다려 주세요.", // NEEDS QC

	// #endregion Chat

	// #region Teambuilder
	// ==================================================================

	// TRANSLATORS: This is for the Teams list view so it can't be singular
	// TRANSLATORS: Should be something like "Teams List" if you have no singular
	// TRANSLATORS: Can be different from TL.term.teams, which "Teams" as in "plural of Team"
	"Teams": "팀 목록", // NEEDS QC
	"[New team]": "새 팀", // NEEDS QC
	"[New team in folder]": "폴더에 새 팀", // NEEDS QC
	"[New {FORMAT} team]": "새 {FORMAT} 팀", // NEEDS QC
	"[New box]": "새 박스", // NEEDS QC
	// TRANSLATORS: When deleting a folder, button to add folder name to all teams in it
	"[Convert to prefix]": "폴더명을 팀 이름 앞에 붙이기", // NEEDS QC
	"[(add folder)]": "(폴더 추가)", // NEEDS QC
	"[(add format folder)]": "(포맷 폴더 추가)", // NEEDS QC
	"Names can't contain slashes, since they're used as a folder separator.": "이름에 슬래시를 쓸 수 없습니다 (폴더 구분에 사용되기 때문입니다).", // NEEDS QC
	"Names can't contain the character |, since they're used for storing teams.": "이름에 | 문자를 쓸 수 없습니다 (팀 저장에 사용되기 때문입니다).", // NEEDS QC
	"New name required": "새 이름이 필요합니다", // NEEDS QC
	"Not in a folder": "폴더 안이 아닙니다", // NEEDS QC
	"Teams not in any folders": "폴더에 없는 팀", // NEEDS QC
	"All teams": "모든 팀", // NEEDS QC
	"Folders": "폴더", // NEEDS QC

	// TRANSLATORS: for Clipboard actions
	"Copied!": "복사했습니다!", // NEEDS QC
	"[Paste copy here]": "여기에 복사 붙여넣기", // NEEDS QC
	"[Add to clipboard]": "클립보드에 추가", // NEEDS QC
	"[Copy/Move]": "복사/이동", // NEEDS QC
	"[+ Clipboard]": "+ 클립보드", // NEEDS QC
	"[Deselect]": "선택 해제", // NEEDS QC
	"[Move here]": "여기로 이동", // NEEDS QC

	// TRANSLATORS: for Import/Export
	"[Backup]": "백업", // NEEDS QC
	"[Backup search results]": "검색 결과 백업", // NEEDS QC
	"[Backup folder]": "폴더 백업", // NEEDS QC
	"Import/Export": "가져오기/내보내기", // NEEDS QC
	"[Import/Export]": "가져오기/내보내기", // NEEDS QC
	"[Import]": "가져오기", // NEEDS QC
	"(can't save partial exports)": "(일부만 표시 중일 때는 저장할 수 없습니다)", // NEEDS QC

	// TRANSLATORS: for uploaded teams
	"Account": "계정", // NEEDS QC
	"Account (public)": "계정(공개)", // NEEDS QC
	"Local": "이 기기", // NEEDS QC
	"Uploaded": "업로드됨", // NEEDS QC
	"[Upload for shareable URL]": "업로드하여 공유 URL 만들기", // NEEDS QC
	"[Upload for shareable/searchable URL]": "업로드하여 공유/검색 가능한 URL 만들기", // NEEDS QC
	"Disconnected (wrong account?)": "연결 끊김(다른 계정?)", // NEEDS QC
	"[Revert to uploaded version]": "업로드된 버전으로 되돌리기", // NEEDS QC
	"[Compare]": "비교", // NEEDS QC
	"[Upload changes]": "변경 사항 업로드", // NEEDS QC
	"Team was deleted": "팀이 삭제되었습니다", // NEEDS QC
	"Team doesn't exist": "팀이 존재하지 않습니다", // NEEDS QC
	"Untitled team": "이름 없는 팀", // NEEDS QC
	"Uploaded by": "업로드한 유저", // NEEDS QC
	"Views": "조회수", // NEEDS QC
	"Team deleted": "팀이 삭제됨", // NEEDS QC
	"Not found": "찾을 수 없음", // NEEDS QC

	// TRANSLATORS: for the team editor
	"[Add Pokémon]": "포켓몬 추가", // NEEDS QC
	"(choose ability)": null, // NEEDS TRANSLATION
	"Details": "상세", // NEEDS QC
	// TRANSLATORS: Teambuilder "form" with text boxes inside, not form/forme "form" of a pokemon
	"Form": "양식", // NEEDS QC
	"Tera": "테라스", // NEEDS QC
	// TRANSLATORS: These two are for Hidden Power type
	// TRANSLATORS: They're both designed to take up very little width, so keep that in mind
	"H.P.": "잠재", // NEEDS QC
	"H. Power": "잠재파워", // NEEDS QC
	"Defensive coverage": "방어 상성", // NEEDS QC
	"Teambuilding resources for {FORMAT}": "{FORMAT} 팀 구성 자료", // NEEDS QC
	"[See all]": "모두 보기", // NEEDS QC
	"Search species or filter by type, learnable moves, ability, tier, or egg group": "포켓몬 검색 (타입, 배우는 기술, 특성, 티어, 알그룹으로 필터 가능)", // NEEDS QC
	"Search abilities": "특성 검색", // NEEDS QC
	"Search items": "도구 검색", // NEEDS QC
	"Search moves or filter by type or category": "기술 검색 (타입, 분류로 필터 가능)", // NEEDS QC
	"Sample sets": "샘플 세트", // NEEDS QC
	"Box sets": "박스 세트", // NEEDS QC
	"Guessed spread": "추정 노력치 배분", // NEEDS QC
	"(Please choose 4 moves to get a guessed spread)": "(기술 4개를 선택하면 배분을 추정합니다)", // NEEDS QC
	"Protip": "팁", // NEEDS QC
	"Use a different nature to save {NUMBER} EVs:": "성격을 바꾸면 노력치를 {NUMBER} 절약할 수 있습니다:", // NEEDS QC
	"Use a different nature to get higher stats:": "성격을 바꾸면 능력치가 높아집니다:", // NEEDS QC
	"Natures cannot raise or lower HP.": "성격으로는 HP를 올리거나 내릴 수 없습니다.", // NEEDS QC
	// TRANSLATORS: {STATCHANGES} is +stat/-stat
	"{STATCHANGES} nature": "{STATCHANGES} 성격", // NEEDS QC
	// TRANSLATORS: {1} and {2} are the + and - keyboard keys
	"You can also set natures by typing {1} and {2} in the EV box.": "EV 입력란에 {1} 또는 {2}를 입력해도 성격을 설정할 수 있습니다.", // NEEDS QC
	"Pasted team": "붙여넣은 팀", // NEEDS QC
	"Zoom out forms": "폼 축소 표시", // NEEDS QC
	"Compact": "컴팩트", // NEEDS QC
	"Comfortable": "여유롭게", // NEEDS QC
	"Zoom out search results": "검색 결과 축소 표시", // NEEDS QC
	"Fetching Paste...": "Paste 불러오는 중...", // NEEDS QC
	"Import/Export set": "세트 가져오기/내보내기", // NEEDS QC
	"IV spreads": "개체값 배분", // NEEDS QC
	"min Atk": "공격 최소", // NEEDS QC
	"min Atk, min Spe": "공격·스피드 최소", // NEEDS QC
	"max all": "전부 최대", // NEEDS QC
	"min Spe": "스피드 최소", // NEEDS QC
	"Hidden Power {TYPE} IVs": "잠재파워({TYPE}) 개체값", // NEEDS QC
	"EVs, IVs, and nature": "노력치·개체값·성격", // NEEDS QC
	"Base": "종족값", // NEEDS QC
	"Remaining": "남음", // NEEDS QC

	// TRANSLATORS: errors
	"You must select a format first.": "먼저 포맷을 선택해 주세요.", // NEEDS QC
	"This team is for a different account. Please log into the correct account to update it.": "이 팀은 다른 계정의 팀입니다. 업데이트하려면 올바른 계정으로 로그인해 주세요.", // NEEDS QC
	"Add a Pokémon to your team before uploading it.": "업로드하기 전에 팀에 포켓몬을 추가해 주세요.", // NEEDS QC
	"Must use on an uploaded team.": "업로드된 팀에서만 사용할 수 있습니다.", // NEEDS QC
	"Team not found: {INPUT}": "팀을 찾을 수 없습니다: {INPUT}", // NEEDS QC
	"Your file \"{FILENAME}\" is not a valid team.": "파일 \"{FILENAME}\"은(는) 유효한 팀이 아닙니다.", // NEEDS QC

	// #endregion Teambuilder

	// #region Ladder
	// ==================================================================

	"[All formats]": "모든 포맷", // NEEDS QC
	"[How the ladder works]": "레이팅 안내", // NEEDS QC
	"[Seasonal rankings]": "시즌 랭킹", // NEEDS QC
	"[Look up a specific user's rating]": "특정 유저의 레이팅 찾아보기", // NEEDS QC
	"Name": "이름", // NEEDS QC
	"Elo rating": "Elo 레이팅", // NEEDS QC
	"user's percentage chance of winning a random battle (Glicko X-Act Estimate)": "랜덤 배틀에서 이길 확률의 추정치 (Glicko X-Act 추정)", // NEEDS QC
	"Glicko-1 rating system: rating±deviation (provisional if deviation>100)": "Glicko-1 레이팅 시스템: 레이팅±편차 (편차>100이면 잠정)", // NEEDS QC
	"No one has played any ranked games yet.": "아직 아무도 랭크 게임을 플레이하지 않았습니다.", // NEEDS QC

	// #endregion Ladder

	// #region Misc rooms
	// ==================================================================

	"[Join the Help room for live help]": "헬프 룸에서 도움받기", // NEEDS QC
	"Unrecognized command: {INPUT}": "인식할 수 없는 명령어: {INPUT}", // NEEDS QC

	// #endregion Misc rooms
};
