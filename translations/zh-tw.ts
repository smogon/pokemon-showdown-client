// Remember, comments starting with "TRANSLATORS:" are from Showdown,
// and are shared between all translations. But other comments can be
// used as notes to yourself or other translators, and are specific
// to the Traditional Chinese translation.

import type { UIText } from '../build-tools/translations.mts';
export const translations: UIText = {
	// #region Navigation
	// ==================================================================

	// TRANSLATORS: Note that "Home" and "Main Menu" refer to the same place
	// TRANSLATORS: So it's fine if they're the same word in your language
	"Home": "首頁", // NEEDS QC
	// TRANSLATORS: This is used as a "Back to Home" button after battles
	"[Main menu]": "主選單", // NEEDS QC
	// TRANSLATORS: It's fine if "Teambuilder" and "Teams" are the same word in your language
	// TRANSLATORS: Also consider something like "Edit teams" for "Teambuilder"
	"Teambuilder": "編輯隊伍", // NEEDS QC
	"Ladder": "天梯", // NEEDS QC
	"Tournaments": "錦標賽", // NEEDS QC
	"Friends": "好友", // NEEDS QC
	"Chat rooms": "聊天室", // NEEDS QC
	"Battles": "對戰", // NEEDS QC
	"News": "新聞", // NEEDS QC
	"Offline": "離線", // NEEDS QC
	"[Join chat]": "加入聊天", // NEEDS QC
	"[All tabs]": "所有分頁", // NEEDS QC
	"[Menu]": "選單", // NEEDS QC

	// #endregion Navigation

	// #region Generic UI
	// ==================================================================

	"[Hide]": "隱藏", // NEEDS QC
	"[Close]": "關閉", // NEEDS QC
	"[Done]": "完成", // NEEDS QC
	"[Back]": "返回", // NEEDS QC
	// TRANSLATORS: A computer copy command, like Ctrl+C
	"[Copy]": "複製", // NEEDS QC
	"[Edit]": "編輯", // NEEDS QC
	"[Delete]": "刪除", // NEEDS QC
	"[Undo delete]": "復原刪除", // NEEDS QC
	// TRANSLATORS: "DM" is used to label DMs; "[Chat]" is the button to send a DM
	// TRANSLATORS: Feel free to use the same word for both (and for "Chat" in the Battle section)
	"DM": "私訊", // NEEDS QC
	"[Chat]": "聊天", // NEEDS QC
	"[OK]": "確定", // NEEDS QC
	"[Cancel]": "取消", // NEEDS QC
	"[Accept]": "接受", // NEEDS QC
	"[Reject]": "拒絕", // NEEDS QC
	"Random team": "隨機隊伍", // NEEDS QC
	// "音效" is a common alternative, but it implies sound *effects* only;
	// "聲音" covers music too
	"[Sound]": "聲音", // NEEDS QC
	"[Options]": "選項", // NEEDS QC
	"[Battle options]": "對戰選項", // NEEDS QC
	"[Revert]": "還原", // NEEDS QC
	"[Refresh]": "重新整理", // NEEDS QC
	"[Search]": "搜尋", // NEEDS QC
	"[Validate]": "規則檢查", // NEEDS QC
	"[Reconnect]": "重新連線", // NEEDS QC
	"Disconnected": "連線已中斷", // NEEDS QC
	"Connecting...": "連線中...", // NEEDS QC
	"Loading...": "載入中...", // NEEDS QC
	"Uploading...": "上傳中...", // NEEDS QC
	"[Change]": "變更", // NEEDS QC
	"[Add]": "新增", // NEEDS QC
	"[Look up]": "查詢", // NEEDS QC
	"[Save changes]": "儲存", // NEEDS QC
	"[Create]": "建立", // NEEDS QC
	"[Rename]": "重新命名", // NEEDS QC
	"[Remove]": "移除", // NEEDS QC
	// TRANSLATORS: intentionally chosen to be very short. do not go longer than three letters for this one
	"Gen {NUMBER}": "第{NUMBER}世代", // NEEDS QC
	"[Maximize]": "最大化", // NEEDS QC
	"[Expand/collapse]": "展開/摺疊", // NEEDS QC

	// TRANSLATORS: connection/team-storage errors
	"Sorry, psim connections are unsupported by your browser.": "抱歉，你的瀏覽器不支援psim連線。", // NEEDS QC
	"Your browser doesn't support third-party cookies. Some things might not work correctly.": "你的瀏覽器不支援第三方Cookie。部分功能可能無法正常運作。", // NEEDS QC
	"Your team storage format is too old for PS. You'll need to upgrade it at {URL}": "你的隊伍儲存格式過舊。請在 {URL} 升級", // NEEDS QC
	"Error loading uploaded teams: {ERROR}": "載入已上傳隊伍時發生錯誤：{ERROR}", // NEEDS QC
	"Error unknown. Try again later.": "未知錯誤。請稍後再試。", // NEEDS QC
	"Failed to load team: {ERROR}": "載入隊伍失敗：{ERROR}", // NEEDS QC
	"Error logging in.": "登入錯誤。", // NEEDS QC
	"Something is interfering with our connection to the login server. Most likely, your internet provider needs you to re-log-in, or your internet provider is blocking Pokémon Showdown.": "與登入伺服器的連線受到干擾。很可能是你的網路業者需要你重新登入，或者網路業者封鎖了Pokémon Showdown。", // NEEDS QC

	// TRANSLATORS: for constructing lists
	"{FIRST} or {SECOND}": "{FIRST}或{SECOND}", // NEEDS QC
	"{FIRST} and {SECOND}": "{FIRST}和{SECOND}", // NEEDS QC
	", {NEXT}": "、{NEXT}", // NEEDS QC
	", or {LAST}": "或{LAST}", // NEEDS QC
	", and {LAST}": "和{LAST}", // NEEDS QC
	// TRANSLATORS: this is for lists of users specifically
	// TRANSLATORS: (languages with counters should use the "person" counter)
	", and {NUMBER} others": "等{NUMBER}人", // NEEDS QC

	// #endregion Generic UI

	// #region Popups
	// ==================================================================

	// TRANSLATORS: user popup
	// TRANSLATORS: "Global {RANK}" is a rank, like "Global Moderator"
	"Global {RANK}": "全服{RANK}", // NEEDS QC
	"Chatrooms": "聊天室", // NEEDS QC
	"Private rooms": "私密房間", // NEEDS QC
	"OFFLINE": "離線", // NEEDS QC
	"Username": "使用者名稱", // NEEDS QC
	"[Register]": "註冊", // NEEDS QC
	"[Add status]": "新增狀態訊息", // NEEDS QC
	"[Chat self]": "與自己聊天", // NEEDS QC
	"[Change name]": "變更名稱", // NEEDS QC
	"[Log out]": "登出", // NEEDS QC
	"[Add friend]": "新增好友", // NEEDS QC
	"[Unignore]": "取消封鎖", // NEEDS QC
	"[Ignore]": "封鎖", // NEEDS QC
	"[Report]": "檢舉", // NEEDS QC
	"[Mute]": "禁言", // NEEDS QC
	"[7m]": "7分鐘", // NEEDS QC
	"[Hourmute]": "1小時禁言", // NEEDS QC
	"[1h]": "1小時", // NEEDS QC
	"[Ban]": "封禁", // NEEDS QC
	"[2d]": "2天", // NEEDS QC
	"[Weekban]": "1週封禁", // NEEDS QC
	"[1w]": "1週", // NEEDS QC
	"[Modlog]": "管理日誌", // NEEDS QC
	// TRANSLATORS: Showdown term for a global mute
	"[Lock]": "全域禁言", // NEEDS QC
	"[Weeklock]": "1週全域禁言", // NEEDS QC
	"[Namelock]": "名稱鎖定", // NEEDS QC
	"[Global modlog]": "全站管理日誌", // NEEDS QC
	"[Avatar...]": "頭像...", // NEEDS QC
	"[Close room]": "關閉房間", // NEEDS QC
	"[Report a user]": "檢舉使用者", // NEEDS QC
	"({NUMBER} sec)": "（{NUMBER}秒）", // NEEDS QC
	"Room not found": "找不到房間", // NEEDS QC

	// TRANSLATORS: battle options
	"Side-by-side, controls below": "左右排列，操作欄在下", // NEEDS QC
	"Side-by-side, overlay controls": "左右排列，操作欄疊加", // NEEDS QC
	"Top-and-bottom, controls below": "上下排列，操作欄在下", // NEEDS QC
	"Top-and-bottom, overlay controls": "上下排列，操作欄疊加", // NEEDS QC
	"Scrolling, controls below": "捲動排列，操作欄在下", // NEEDS QC
	"Scrolling, overlay controls": "捲動排列，操作欄疊加", // NEEDS QC
	"Hardcore mode ON: Information not available in-game is now hidden.": "硬核模式已開啟：遊戲內無法得知的資訊現已隱藏。", // NEEDS QC
	"Hardcore mode OFF: Information not available in-game is now shown.": "硬核模式已關閉：遊戲內無法得知的資訊現已顯示。", // NEEDS QC
	"Spectators ignored.": "已忽略觀戰者。", // NEEDS QC
	"Spectators no longer ignored.": "不再忽略觀戰者。", // NEEDS QC
	"In this battle": "本場對戰", // NEEDS QC
	"Hardcore mode (hide info not shown in-game)": "硬核模式（隱藏遊戲內無法得知的資訊）", // NEEDS QC
	"Ignore spectators": "忽略觀戰者", // NEEDS QC
	"Ignore opponent": "忽略對手", // NEEDS QC
	"Ignore nicknames": "忽略暱稱", // NEEDS QC
	"All battles": "所有對戰", // NEEDS QC
	"Layout": "版面配置", // NEEDS QC
	"Automatic ({SETTING})": "自動（{SETTING}）", // NEEDS QC
	"Automatic": "自動", // NEEDS QC
	"(DESKTOP)": "（桌面）", // NEEDS QC
	"(MOBILE VERTICAL)": "（手機直向）", // NEEDS QC
	"(MOBILE HORIZONTAL)": "（手機橫向）", // NEEDS QC
	"You can still invite spectators by giving them the URL or using the /invite command": "你仍然可以透過分享網址或使用/invite指令邀請觀戰者", // NEEDS QC
	"Invite only (hide from Battles list)": "僅限邀請（不在對戰清單中顯示）", // NEEDS QC
	"Ignore Pokémon nicknames": "忽略寶可夢暱稱", // NEEDS QC
	"Automatically start timer": "自動開啟計時器", // NEEDS QC
	"Hardcore mode": "硬核模式", // NEEDS QC
	"Start at turn 0 when spectating battles": "觀戰時從第0回合開始", // NEEDS QC
	"Open new battles in the right-side panel": "在右側面板開啟新對戰", // NEEDS QC

	// TRANSLATORS: options
	"General": "一般", // NEEDS QC
	"Language": "語言", // NEEDS QC
	"Appearance": "外觀", // NEEDS QC
	"Theme": "主題", // NEEDS QC
	"Light": "淺色", // NEEDS QC
	"Dark": "深色", // NEEDS QC
	"Match system theme": "跟隨系統主題", // NEEDS QC
	"Two panels (if wide enough)": "雙面板（寬度足夠時）", // NEEDS QC
	"Single panel": "單面板", // NEEDS QC
	"Vertical tabs": "垂直分頁", // NEEDS QC
	"Background": "背景", // NEEDS QC
	"Disable animations": "停用動畫", // NEEDS QC
	"Use 2D sprites instead of 3D models": "使用2D圖像代替3D模型", // NEEDS QC
	"Use modern sprites for past generations": "過去世代也使用現代圖像", // NEEDS QC
	"Block DMs": "封鎖私訊", // NEEDS QC
	"Block challenges": "封鎖挑戰", // NEEDS QC
	"Show DMs in chatrooms": "在聊天室中顯示私訊", // NEEDS QC
	"Do not highlight when your name is said in chat": "聊天中提到你的名字時不特別標示", // NEEDS QC
	"Confirm before leaving a room": "離開房間前確認", // NEEDS QC
	"Confirm before refreshing": "重新整理前確認", // NEEDS QC
	"Always notify": "總是通知", // NEEDS QC
	"Notify when joined": "僅在參加時通知", // NEEDS QC
	"Hide": "隱藏", // NEEDS QC
	"Timestamps": "時間戳記", // NEEDS QC
	"Off": "關閉", // NEEDS QC
	"Timestamps in DMs": "私訊時間戳記", // NEEDS QC
	"Chat preferences": "聊天偏好設定", // NEEDS QC
	"[Change background]": "變更背景", // NEEDS QC
	"[Text formatting...]": "文字格式...", // NEEDS QC
	"[Set as background]": "設為背景", // NEEDS QC
	"[Random]": "隨機", // NEEDS QC

	// TRANSLATORS: team chooser
	"(uncategorized)": "（未分類）", // NEEDS QC
	"(all)": "（全部）", // NEEDS QC
	"[Other gens]": "其他世代", // NEEDS QC
	"Select a team": "選擇隊伍", // NEEDS QC
	"This team selector is no longer available (the challenge was cancelled or something).": "該隊伍選擇器已不可用（挑戰被取消了之類的）。", // NEEDS QC
	"No teams found": "找不到隊伍", // NEEDS QC
	"This format selector is no longer available.": "該對戰格式選擇器已不可用。", // NEEDS QC
	"Search formats": "搜尋對戰格式", // NEEDS QC

	// TRANSLATORS: login
	"[Choose name]": "選擇名稱", // NEEDS QC
	"Logging in...": "登入中...", // NEEDS QC
	"[Log in]": "登入", // NEEDS QC
	"[Try another name]": "換一個名稱", // NEEDS QC
	"[Password...]": "密碼...", // NEEDS QC
	"[Change password]": "變更密碼", // NEEDS QC
	"[Show password]": "顯示密碼", // NEEDS QC
	"Loading Google log-in button...": "正在載入Google登入按鈕...", // NEEDS QC
	"(color)": "（顏色）", // NEEDS QC
	"(Others will be able to see your name change. To change name privately, use \"Log out\")": "（其他人可以看到你的改名。要私下改名，請使用「登出」）", // NEEDS QC
	"if you registered this name:": "如果你註冊過這個名字：", // NEEDS QC
	"if not:": "如果不是：", // NEEDS QC
	"This is someone else's account. Sorry.": "這是別人的帳號。抱歉。", // NEEDS QC
	"Password": "密碼", // NEEDS QC

	// TRANSLATORS: register / change password
	"All fields are required": "所有欄位皆為必填", // NEEDS QC
	"Passwords do not match": "兩次輸入的密碼不一致", // NEEDS QC
	"Your password was successfully changed!": "密碼修改成功！", // NEEDS QC
	"Change your password:": "修改密碼：", // NEEDS QC
	"Old password": "舊密碼", // NEEDS QC
	"New password": "新密碼", // NEEDS QC
	"New password (confirm)": "新密碼（確認）", // NEEDS QC
	"You have been successfully registered.": "註冊成功。", // NEEDS QC
	"Register your account:": "註冊帳號：", // NEEDS QC
	"Password (confirm)": "密碼（確認）", // NEEDS QC
	"An Electric-type mouse that is the mascot of the Pokémon franchise.": "寶可夢系列的吉祥物，電屬性的老鼠寶可夢。", // NEEDS QC
	"What is this Pokémon?": "這是什麼寶可夢？", // NEEDS QC

	// #endregion Popups

	// #region Main Menu
	// ==================================================================

	// TRANSLATORS: Our famous ladder queue button. Give it some flair :)
	// TRANSLATORS: Might we suggest "Showdown!"
	"[Battle!]": "開戰！", // NEEDS QC
	"Find a random opponent": "尋找隨機對手", // NEEDS QC
	"Watch a battle": "觀看對戰", // NEEDS QC
	"Find a user": "搜尋使用者", // NEEDS QC
	"Info & Resources": "資訊與資源", // NEEDS QC
	"Lobby chat": "大廳聊天", // NEEDS QC

	// TRANSLATORS: Challenge/Search UI
	"[Challenge]": "挑戰", // NEEDS QC
	"Custom rules": "自訂規則", // NEEDS QC
	// TRANSLATORS: Search countdown. {NUMBER} = a number of seconds
	// TRANSLATORS: English doesn't include the unit (seconds) but your language can
	"Searching in {NUMBER}...": "{NUMBER}秒後開始搜尋...", // NEEDS QC
	"Searching...": "正在搜尋對手...", // NEEDS QC
	"Pokédex": "寶可夢圖鑑", // NEEDS QC
	"Replays": "對戰重播", // NEEDS QC
	"Forum": "論壇", // NEEDS QC
	"Rules": "規則", // NEEDS QC
	"Credits": "製作人員", // NEEDS QC
	"Privacy": "隱私", // NEEDS QC
	"background by {ARTIST}": "背景：{ARTIST}", // NEEDS QC

	// TRANSLATORS: errors
	"Wait for this countdown to finish first...": "請先等待倒數結束...", // NEEDS QC
	"You're already searching for a {FORMAT} battle...": "你已經在搜尋{FORMAT}對戰了...", // NEEDS QC
	"You need to go into the Teambuilder and build a team for this format.": "你需要在隊伍構築器中為該格式組建一支隊伍。", // NEEDS QC

	// #endregion Main Menu

	// #region Rooms
	// ==================================================================

	// TRANSLATORS: these go under the user/battle counts, and in English they read as "100 users online"
	// TRANSLATORS: but they don't have to work that way in your language
	"users online": "位使用者在線上", // NEEDS QC
	"active battles": "場對戰進行中", // NEEDS QC
	"Find an online user": "尋找線上使用者", // NEEDS QC
	"Watch an active battle": "觀看進行中的對戰", // NEEDS QC
	"Meloetta is PS's mascot! The Aria forme is about using its voice, and represents our chatrooms.": "美洛耶塔是PS的吉祥物！歌聲形態以歌聲為特點，象徵著我們的聊天室。", // NEEDS QC
	"Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles.": "美洛耶塔是PS的吉祥物！舞步形態是格鬥屬性，象徵著我們的對戰。", // NEEDS QC

	"Official chat rooms": "官方聊天室", // NEEDS QC
	"Hidden rooms": "隱藏房間", // NEEDS QC

	"Subrooms": "子房間", // NEEDS QC
	"(All rooms)": "（所有房間）", // NEEDS QC
	"Join or search for rooms": "加入或搜尋房間", // NEEDS QC
	"Command": "命令", // NEEDS QC
	"Console": "控制台", // NEEDS QC
	"Enter = run command {INPUT}": "Enter = 執行命令{INPUT}", // NEEDS QC
	"(Subroom of {ROOM})": "（{ROOM}的子房間）", // NEEDS QC
	"Possible secret room": "可能是秘密房間", // NEEDS QC
	"(Private room?)": "（私密房間？）", // NEEDS QC
	"Search results": "搜尋結果", // NEEDS QC

	// #endregion Rooms

	// #region Battle
	// ==================================================================

	// TRANSLATORS: Note that most translations of battle UI are in the server repository
	// TRANSLATORS: In data/text/[lang]/default.ts and data/text/[lang]/names.ts

	// TRANSLATORS: [Team]/[Battle]/[Switch]/[Shift] are buttons in overlay controls
	// TRANSLATORS: But they're section headers in normal battle controls
	// TRANSLATORS: For the "Use move" menu in battle controls
	// TRANSLATORS: This was "Attack" in older Showdown, "FIGHT" on older cart, and "Battle" on modern cart
	// SV battle menu: 戰鬥
	"[Battle]": "戰鬥", // NEEDS QC
	// TRANSLATORS: For the "Switch" menu in battle controls
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Switch]": "更換", // NEEDS QC
	// TRANSLATORS: For the Team Preview menu in battle controls
	// TRANSLATORS: Also replaces "[Switch]" in phases where switching isn't possible
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Team]": "隊伍", // NEEDS QC
	// TRANSLATORS: The Triples "move to center" button
	// TRANSLATORS: This is "SHIFT" on older cart; Triples doesn't exist on modern cart
	// Triples predate official Chinese; 移動 mirrors ORAS's "move" wording (ja いどう, es Mover, ...)
	"[Shift]": "移動", // NEEDS QC

	// TRANSLATORS: Mobile-layout buttons for switching between the battle view and the chat view
	// TRANSLATORS: ("Chat" is also used as a section header in the options popup)
	"Battle": "對戰", // NEEDS QC
	"Chat": "聊天", // NEEDS QC
	"[Try Fight button]": "試按戰鬥按鈕", // NEEDS QC
	// TRANSLATORS: For the "where to target this move" menu
	"(empty slot)": "（空位）", // NEEDS QC
	"Maxed with no max moves": "沒有可用的極巨招式", // NEEDS QC
	"No Z moves": "沒有Z招式", // NEEDS QC

	"[Rematch]": "再戰", // NEEDS QC
	"[Offer tie]": "提議平手", // NEEDS QC
	"[Forfeit]": "認輸", // NEEDS QC
	"[Forfeit and close]": "認輸並關閉", // NEEDS QC
	"[Replace player]": "替換玩家", // NEEDS QC
	"[Replace]": "替換", // NEEDS QC
	"(turn 100+)": "（100回合後）", // NEEDS QC
	"[Stop timer]": "停止計時器", // NEEDS QC
	"[Start timer]": "開始計時器", // NEEDS QC
	"Enter player's name": "請輸入玩家名稱", // NEEDS QC
	"Cannot replace player, battle has already ended.": "對戰已結束，無法替換玩家。", // NEEDS QC

	// TRANSLATORS: for replay controls
	"[Play]": "播放", // NEEDS QC
	"[Pause]": "暫停", // NEEDS QC
	"[First turn]": "第一回合", // NEEDS QC
	"[Prev turn]": "上一回合", // NEEDS QC
	"[Skip turn]": "下一回合", // NEEDS QC
	"[Skip to end]": "跳到結尾", // NEEDS QC
	"[Switch viewpoint]": "切換視角", // NEEDS QC
	"[Go to turn]": "跳轉回合", // NEEDS QC
	"[Skip]": "跳過", // NEEDS QC
	"[Skip animation]": "跳過動畫", // NEEDS QC
	"[Move to center]": "移動到中央", // NEEDS QC
	"[Upload and share replay]": "上傳並分享對戰重播", // NEEDS QC
	"[Replay]": "對戰重播", // NEEDS QC
	"(closes this battle)": "（將關閉此對戰）", // NEEDS QC

	// TRANSLATORS: for the battle list
	"Minimum Elo": "最低Elo", // NEEDS QC
	"rated {ELO}": "評分{ELO}", // NEEDS QC
	// TRANSLATORS: goes between two usernames; the key includes its surrounding spacing so some languages can drop it
	"{PLAYER1} vs. {PLAYER2}": "{PLAYER1} 對 {PLAYER2}", // NEEDS QC
	"(All formats)": "（所有對戰模式）", // NEEDS QC
	"Username prefix": "使用者名稱前綴", // NEEDS QC
	"No battles are going on": "目前沒有進行中的對戰", // NEEDS QC
	"{NUMBER} battle": "{NUMBER}場對戰", // NEEDS QC
	"{NUMBER} battles": "{NUMBER}場對戰", // NEEDS QC
	"None": "無", // NEEDS QC
	"Timer": "計時器", // NEEDS QC
	"Error": "錯誤", // NEEDS QC
	"The battle you're looking for has expired. Battles expire after 15 minutes of inactivity unless they're saved.": "你要找的對戰已過期。對戰若未儲存，15分鐘無活動後就會過期。", // NEEDS QC
	"In the future, remember to click \"Save replay\" to save a replay permanently.": "今後記得點擊「儲存重播」來永久儲存重播。", // NEEDS QC
	"Unrecognized HTML file: Only replay files are supported.": "無法識別的HTML檔案：僅支援重播檔案。", // NEEDS QC
	"You are still in {ROOM}": "你仍在{ROOM}中", // NEEDS QC
	"Battle \"{INPUT}\" not found": "找不到對戰「{INPUT}」", // NEEDS QC
	"Uploaded replay": "已上傳的重播", // NEEDS QC
	"Team {PLAYER}": "{PLAYER}隊", // NEEDS QC
	"{PLAYER} and friends": "{PLAYER}和夥伴們", // NEEDS QC

	// TRANSLATORS: battle log messages
	"[Earlier messages]": "更早的訊息", // NEEDS QC
	"Register an account to protect your ladder rating!": "註冊帳號以保護你的天梯評分！", // NEEDS QC
	"Open team sheet for {PLAYER}": "打開{PLAYER}的隊伍表單", // NEEDS QC
	"Warning": "警告", // NEEDS QC
	"Variation": "變體", // NEEDS QC
	"Rated battle": "評分對戰", // NEEDS QC

	// TRANSLATORS: screen reader labels
	"Active Pokémon": "場上寶可夢", // NEEDS QC
	"Your team": "我方隊伍", // NEEDS QC
	"Opponent's team": "對方隊伍", // NEEDS QC
	"Statused": "有異常狀態", // NEEDS QC
	"Non-statused": "無異常狀態", // NEEDS QC
	"Unrevealed Illusion user": "未暴露的幻覺使用者", // NEEDS QC
	"Not revealed": "未亮相", // NEEDS QC
	"Battle controls": "對戰操作", // NEEDS QC

	// #endregion Battle

	// #region Chat
	// ==================================================================

	"{NUMBER} user": "{NUMBER}位使用者", // NEEDS QC
	"{NUMBER} users": "{NUMBER}位使用者", // NEEDS QC
	"[Join]": "加入", // NEEDS QC
	"[Leave]": "離開", // NEEDS QC
	"[Ready!]": "準備完成！", // NEEDS QC
	"In progress": "進行中", // NEEDS QC
	"Signups": "報名中", // NEEDS QC
	"[Pop-out]": "彈出視窗", // NEEDS QC
	"[Go]": "前往", // NEEDS QC
	"[Visit]": "開啟", // NEEDS QC
	"[Choose a name before sending messages]": "傳送訊息前請先選擇名稱", // NEEDS QC
	"Challenging...": "挑戰中...", // NEEDS QC
	"Accepting...": "接受中...", // NEEDS QC
	"[Commands]": "指令", // NEEDS QC
	"Mentioned by {USER} in {ROOM}": "{USER}在{ROOM}中提到了你", // NEEDS QC
	"{USERS} joined": "{USERS}加入了", // NEEDS QC
	// TRANSLATORS: separates "X joined" from "Y left"
	"{JOINEDMESSAGE}; {LEFTMESSAGE}": "{JOINEDMESSAGE}；{LEFTMESSAGE}", // NEEDS QC
	"{USERS} left": "{USERS}離開了", // NEEDS QC
	"{USER} renamed from {OLDUSER}.": "{OLDUSER}已改名為{USER}。", // NEEDS QC
	"(Private to {USER})": "（私訊給{USER}）", // NEEDS QC
	"{FORMAT} battle started between {PLAYER1} and {PLAYER2}.": "{PLAYER1}和{PLAYER2}的{FORMAT}對戰開始了。", // NEEDS QC
	// TRANSLATORS: for when the format name already includes "battle"
	"{FORMAT} started between {PLAYER1} and {PLAYER2}.": "{PLAYER1}和{PLAYER2}的{FORMAT}開始了。", // NEEDS QC
	// TRANSLATORS: for when the format is unknown
	"Battle started between {PLAYER1} and {PLAYER2}.": "{PLAYER1}和{PLAYER2}的對戰開始了。", // NEEDS QC
	"({NUMBER} line from {USER} hidden)": "（已隱藏{USER}的{NUMBER}行訊息）", // NEEDS QC
	"({NUMBER} lines from {USER} hidden)": "（已隱藏{USER}的{NUMBER}行訊息）", // NEEDS QC
	"{USER} invited you to join the room \"{ROOM}\"": "{USER}邀請你加入房間「{ROOM}」", // NEEDS QC
	"[Join {ROOM}]": "加入{ROOM}", // NEEDS QC
	"Chat log": "聊天紀錄", // NEEDS QC

	// TRANSLATORS: tournaments
	"Please respond to the tournament within {SECONDS} seconds or you may be automatically disqualified.": "請在{SECONDS}秒內回應錦標賽，否則可能被自動取消資格。", // NEEDS QC
	"Single Elimination": "單敗淘汰賽", // NEEDS QC
	"Double Elimination": "雙敗淘汰賽", // NEEDS QC
	"Round Robin": "循環賽", // NEEDS QC
	"Double Round Robin": "雙循環賽", // NEEDS QC
	"{JOINS} joined the tournament": "{JOINS}加入了錦標賽", // NEEDS QC
	"{LEAVES} left the tournament": "{LEAVES}離開了錦標賽", // NEEDS QC
	// TRANSLATORS: sentence terminator for messages like the above
	"{SENTENCE}.": "{SENTENCE}。", // NEEDS QC
	"{FORMAT} {TYPE} tournament": "{FORMAT}{TYPE}", // NEEDS QC
	"No tournaments are currently running.": "目前沒有正在進行的錦標賽。", // NEEDS QC
	"(started)": "（已開始）", // NEEDS QC
	"{TOURNAMENT} created.": "{TOURNAMENT}已建立。", // NEEDS QC
	"{TOURNAMENT} created (and hidden).": "{TOURNAMENT}已建立（並已隱藏）。", // NEEDS QC
	"Tournament created": "錦標賽已建立", // NEEDS QC
	// TRANSLATORS: label, as in "Room: lobby"
	"Room": "房間", // NEEDS QC
	"Type": "類型", // NEEDS QC
	"{USER} has joined the tournament, replacing {OLDUSER}.": "{USER}加入了錦標賽，替換了{OLDUSER}。", // NEEDS QC
	"({NUMBER} players)": "（{NUMBER}名玩家）", // NEEDS QC
	"The tournament has started!": "錦標賽開始了！", // NEEDS QC
	"{USER} has been disqualified from the tournament.": "{USER}已被取消錦標賽資格。", // NEEDS QC
	"The tournament's automatic disqualify timer has been turned off.": "錦標賽的自動取消資格計時器已關閉。", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minute.": "錦標賽的自動取消資格計時器已設為{NUMBER}分鐘。", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minutes.": "錦標賽的自動取消資格計時器已設為{NUMBER}分鐘。", // NEEDS QC
	"Tournament automatic disqualification warning": "錦標賽自動取消資格警告", // NEEDS QC
	"Time": "時間", // NEEDS QC
	"{NUMBER} sec": "{NUMBER}秒", // NEEDS QC
	"The tournament's automatic start is now off.": "錦標賽的自動開始已關閉。", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minute.": "錦標賽將在{NUMBER}分鐘後自動開始。", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minutes.": "錦標賽將在{NUMBER}分鐘後自動開始。", // NEEDS QC
	"Scouting is now allowed (Tournament players can watch other tournament battles)": "現在允許偵察（錦標賽玩家可以觀戰其他錦標賽對戰）", // NEEDS QC
	"Scouting is now banned (Tournament players can't watch other tournament battles)": "現在禁止偵察（錦標賽玩家不能觀戰其他錦標賽對戰）", // NEEDS QC
	"Tournament challenges available": "錦標賽可以發起挑戰了", // NEEDS QC
	"Tournament challenge from {PLAYER}": "來自{PLAYER}的錦標賽挑戰", // NEEDS QC
	"Tournament battle between {PLAYER1} and {PLAYER2} started.": "{PLAYER1}和{PLAYER2}的錦標賽對戰開始了。", // NEEDS QC
	"{PLAYER1} has won the match {SCORE} against {PLAYER2}": "{PLAYER1}以{SCORE}戰勝了{PLAYER2}", // NEEDS QC
	"{PLAYER1} has lost the match {SCORE} against {PLAYER2}": "{PLAYER1}以{SCORE}輸給了{PLAYER2}", // NEEDS QC
	"{PLAYER1} has drawn the match {SCORE} against {PLAYER2}": "{PLAYER1}與{PLAYER2}以{SCORE}戰平", // NEEDS QC
	" but the tournament does not support drawing, so it did not count": "（但該錦標賽不支援平局，因此不計入）", // NEEDS QC
	"Congratulations to {WINNERS} for winning the {TOURNAMENT}!": "恭喜{WINNERS}贏得{TOURNAMENT}！", // NEEDS QC
	"Runners-up": "亞軍", // NEEDS QC
	"Runner-up": "亞軍", // NEEDS QC
	"The tournament was forcibly ended.": "錦標賽被強制結束了。", // NEEDS QC
	"The tournament has already started.": "錦標賽已經開始了。", // NEEDS QC
	"The tournament hasn't started yet.": "錦標賽還沒有開始。", // NEEDS QC
	"You are already in the tournament.": "你已經在錦標賽中了。", // NEEDS QC
	"One of your alts is already in the tournament.": "你的小號已經在錦標賽中了。", // NEEDS QC
	"You aren't in the tournament.": "你不在錦標賽中。", // NEEDS QC
	"This user isn't in the tournament.": "該使用者不在錦標賽中。", // NEEDS QC
	"There aren't enough users.": "使用者數量不足。", // NEEDS QC
	"That isn't a valid timeout value.": "無效的計時器數值。", // NEEDS QC
	"That isn't a valid tournament matchup.": "無效的錦標賽對陣。", // NEEDS QC
	"You must have a name in order to join the tournament.": "你需要一個名字才能加入錦標賽。", // NEEDS QC
	"The tournament is already at maximum capacity for users.": "錦標賽人數已滿。", // NEEDS QC
	"You have already been disqualified.": "你已經被取消資格了。", // NEEDS QC
	"This user has already been disqualified.": "該使用者已經被取消資格了。", // NEEDS QC
	"You are banned from entering tournaments.": "你被禁止參加錦標賽。", // NEEDS QC
	"Unknown error: {ERROR}": "未知錯誤：{ERROR}", // NEEDS QC
	"Waiting for battles to become available...": "等待可進行的對戰...", // NEEDS QC
	"vs. {PLAYER}": "vs. {PLAYER}", // NEEDS QC
	"Or wait for {PLAYERS} to challenge you.": "或者等待{PLAYERS}向你發起挑戰。", // NEEDS QC
	"Waiting for {PLAYERS} to challenge you.": "等待{PLAYERS}向你發起挑戰。", // NEEDS QC
	"Waiting for {PLAYER}...": "等待{PLAYER}...", // NEEDS QC
	"Unavailable": "不可用", // NEEDS QC
	"Waiting": "等待中", // NEEDS QC
	"Challenging": "挑戰中", // NEEDS QC

	// TRANSLATORS: command errors
	"This player does not exist or is not online.": "該玩家不存在或不在線上。", // NEEDS QC
	"This command can only be used in proper chat rooms.": "該指令只能在聊天室中使用。", // NEEDS QC
	"Error: corrupted ranking data": "錯誤：排名資料已損壞", // NEEDS QC
	"You are not in a battle": "你不在對戰中", // NEEDS QC
	"Invalid turn number: {NUMBER}": "無效的回合數：{NUMBER}", // NEEDS QC
	"Turn navigation is disabled in hardcore mode.": "硬核模式下無法使用回合跳轉。", // NEEDS QC
	"You are not a player in this battle": "你不是本場對戰的玩家", // NEEDS QC
	"Can only be used in a DM.": "只能在私訊中使用。", // NEEDS QC
	"Please wait 5 seconds before challenging again.": "請等待5秒後再次發起挑戰。", // NEEDS QC

	// #endregion Chat

	// #region Teambuilder
	// ==================================================================

	// TRANSLATORS: This is for the Teams list view so it can't be singular
	// TRANSLATORS: Should be something like "Teams List" if you have no singular
	// TRANSLATORS: Can be different from TL.term.teams, which "Teams" as in "plural of Team"
	"Teams": "隊伍列表", // NEEDS QC
	"[New team]": "新增隊伍", // NEEDS QC
	"[New team in folder]": "在資料夾中建立新隊伍", // NEEDS QC
	"[New {FORMAT} team]": "新{FORMAT}隊伍", // NEEDS QC
	"[New box]": "新增盒子", // NEEDS QC
	// TRANSLATORS: When deleting a folder, button to add folder name to all teams in it
	"[Convert to prefix]": "將資料夾名稱加到隊伍名稱前", // NEEDS QC
	"[(add folder)]": "（新增資料夾）", // NEEDS QC
	"[(add format folder)]": "（新增對戰格式資料夾）", // NEEDS QC
	"Names can't contain slashes, since they're used as a folder separator.": "名稱中不能包含斜槓，因為它用作資料夾分隔符號。", // NEEDS QC
	"Names can't contain the character |, since they're used for storing teams.": "名稱中不能包含字元|，因為它用於儲存隊伍。", // NEEDS QC
	"New name required": "需要輸入新名稱", // NEEDS QC
	"Not in a folder": "不在資料夾中", // NEEDS QC
	"Teams not in any folders": "未分入資料夾的隊伍", // NEEDS QC
	"All teams": "所有隊伍", // NEEDS QC
	"Folders": "資料夾", // NEEDS QC

	// TRANSLATORS: for Clipboard actions
	"Copied!": "已複製！", // NEEDS QC
	"[Paste copy here]": "貼上副本到此處", // NEEDS QC
	"[Add to clipboard]": "加入剪貼簿", // NEEDS QC
	"[Copy/Move]": "複製/移動", // NEEDS QC
	"[+ Clipboard]": "+ 剪貼簿", // NEEDS QC
	"[Deselect]": "取消選擇", // NEEDS QC
	"[Move here]": "移動到此處", // NEEDS QC

	// TRANSLATORS: for Import/Export
	"[Backup]": "備份", // NEEDS QC
	"[Backup search results]": "備份搜尋結果", // NEEDS QC
	"[Backup folder]": "備份資料夾", // NEEDS QC
	"Import/Export": "匯入/匯出", // NEEDS QC
	"[Import/Export]": "匯入/匯出", // NEEDS QC
	"[Import]": "匯入", // NEEDS QC
	"(can't save partial exports)": "（僅顯示部分時無法儲存）", // NEEDS QC

	// TRANSLATORS: for uploaded teams
	"Account": "帳號", // NEEDS QC
	"Account (public)": "帳號（公開）", // NEEDS QC
	"Local": "本機", // NEEDS QC
	"Uploaded": "已上傳", // NEEDS QC
	"[Upload for shareable URL]": "上傳以取得分享連結", // NEEDS QC
	"[Upload for shareable/searchable URL]": "上傳以取得可分享、可搜尋的連結", // NEEDS QC
	"Disconnected (wrong account?)": "連線已中斷（帳號不對？）", // NEEDS QC
	"[Revert to uploaded version]": "還原為已上傳版本", // NEEDS QC
	"[Compare]": "比較", // NEEDS QC
	"[Upload changes]": "上傳變更", // NEEDS QC
	"Team was deleted": "隊伍已被刪除", // NEEDS QC
	"Team doesn't exist": "隊伍不存在", // NEEDS QC
	"Untitled team": "未命名隊伍", // NEEDS QC
	"Uploaded by": "上傳者", // NEEDS QC
	"Views": "瀏覽量", // NEEDS QC
	"Team deleted": "隊伍已刪除", // NEEDS QC
	"Not found": "未找到", // NEEDS QC

	// TRANSLATORS: for the team editor
	"[Add Pokémon]": "新增寶可夢", // NEEDS QC
	"(choose ability)": null, // NEEDS TRANSLATION
	"Details": "詳細資料", // NEEDS QC
	// TRANSLATORS: Teambuilder "form" with text boxes inside, not form/forme "form" of a pokemon
	"Form": "表單", // NEEDS QC
	"Tera": "太晶", // NEEDS QC
	// TRANSLATORS: These two are for Hidden Power type
	// TRANSLATORS: They're both designed to take up very little width, so keep that in mind
	"H.P.": "覺醒", // NEEDS QC
	"H. Power": "覺醒力量", // NEEDS QC
	"Defensive coverage": "防禦相性", // NEEDS QC
	"Teambuilding resources for {FORMAT}": "{FORMAT}的組隊資源", // NEEDS QC
	"[See all]": "查看全部", // NEEDS QC
	"Search species or filter by type, learnable moves, ability, tier, or egg group": "搜尋寶可夢（可按屬性、可學招式、特性、分級、蛋群篩選）", // NEEDS QC
	"Search abilities": "搜尋特性", // NEEDS QC
	"Search items": "搜尋道具", // NEEDS QC
	"Search moves or filter by type or category": "搜尋招式（可按屬性、分類篩選）", // NEEDS QC
	"Sample sets": "樣板配置", // NEEDS QC
	"Box sets": "盒子配置", // NEEDS QC
	"Guessed spread": "推測的努力值分配", // NEEDS QC
	"(Please choose 4 moves to get a guessed spread)": "（選擇4個招式後可推測努力值分配）", // NEEDS QC
	"Protip": "小提示", // NEEDS QC
	"Use a different nature to save {NUMBER} EVs:": "更換性格可節省{NUMBER}點努力值：", // NEEDS QC
	"Use a different nature to get higher stats:": "更換性格可獲得更高的能力值：", // NEEDS QC
	"Natures cannot raise or lower HP.": "性格無法提高或降低HP。", // NEEDS QC
	// TRANSLATORS: {STATCHANGES} is +stat/-stat
	"{STATCHANGES} nature": "{STATCHANGES}性格", // NEEDS QC
	// TRANSLATORS: {1} and {2} are the + and - keyboard keys
	"You can also set natures by typing {1} and {2} in the EV box.": "在努力值輸入框中輸入{1}或{2}也可以設定性格。", // NEEDS QC
	"Pasted team": "貼上的隊伍", // NEEDS QC
	"Zoom out forms": "縮小表單", // NEEDS QC
	"Compact": "緊湊", // NEEDS QC
	"Comfortable": "寬鬆", // NEEDS QC
	"Zoom out search results": "縮小搜尋結果", // NEEDS QC
	"Fetching Paste...": "正在取得Paste...", // NEEDS QC
	"Import/Export set": "匯入/匯出配置", // NEEDS QC
	"IV spreads": "個體值配置", // NEEDS QC
	"min Atk": "攻擊最小", // NEEDS QC
	"min Atk, min Spe": "攻擊、速度最小", // NEEDS QC
	"max all": "全部最大", // NEEDS QC
	"min Spe": "速度最小", // NEEDS QC
	"Hidden Power {TYPE} IVs": "覺醒力量（{TYPE}）個體值", // NEEDS QC
	"EVs, IVs, and nature": "努力值、個體值與性格", // NEEDS QC
	"Base": "種族值", // NEEDS QC
	"Remaining": "剩餘", // NEEDS QC

	// TRANSLATORS: errors
	"You must select a format first.": "請先選擇對戰格式。", // NEEDS QC
	"This team is for a different account. Please log into the correct account to update it.": "這個隊伍屬於其他帳號。要更新它，請登入正確的帳號。", // NEEDS QC
	"Add a Pokémon to your team before uploading it.": "上傳前請先向隊伍中加入寶可夢。", // NEEDS QC
	"Must use on an uploaded team.": "只能對已上傳的隊伍使用。", // NEEDS QC
	"Team not found: {INPUT}": "找不到隊伍：{INPUT}", // NEEDS QC
	"Your file \"{FILENAME}\" is not a valid team.": "檔案「{FILENAME}」不是有效的隊伍。", // NEEDS QC

	// #endregion Teambuilder

	// #region Ladder
	// ==================================================================

	"[All formats]": "所有對戰格式", // NEEDS QC
	"[How the ladder works]": "天梯說明", // NEEDS QC
	"[Seasonal rankings]": "賽季排名", // NEEDS QC
	"[Look up a specific user's rating]": "查詢特定使用者的評分", // NEEDS QC
	"Name": "名字", // NEEDS QC
	"Elo rating": "Elo評分", // NEEDS QC
	"user's percentage chance of winning a random battle (Glicko X-Act Estimate)": "隨機對戰中獲勝概率的估計值（Glicko X-Act估計）", // NEEDS QC
	"Glicko-1 rating system: rating±deviation (provisional if deviation>100)": "Glicko-1評分系統：評分±偏差（偏差>100為臨時）", // NEEDS QC
	"No one has played any ranked games yet.": "還沒有人進行過排位對戰。", // NEEDS QC

	// #endregion Ladder

	// #region Misc rooms
	// ==================================================================

	"[Join the Help room for live help]": "前往Help房間取得協助", // NEEDS QC
	"Unrecognized command: {INPUT}": "無法識別的指令：{INPUT}", // NEEDS QC

	// #endregion Misc rooms
};
