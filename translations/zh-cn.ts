// Remember, comments starting with "TRANSLATORS:" are from Showdown,
// and are shared between all translations. But other comments can be
// used as notes to yourself or other translators, and are specific
// to the Simplified Chinese translation.

import type { UIText } from '../build-tools/translations.mts';
export const translations: UIText = {
	// #region Navigation
	// ==================================================================

	// TRANSLATORS: Note that "Home" and "Main Menu" refer to the same place
	// TRANSLATORS: So it's fine if they're the same word in your language
	"Home": "主页", // NEEDS QC
	// TRANSLATORS: This is used as a "Back to Home" button after battles
	"[Main menu]": "主菜单", // NEEDS QC
	// TRANSLATORS: It's fine if "Teambuilder" and "Teams" are the same word in your language
	// TRANSLATORS: Also consider something like "Edit teams" for "Teambuilder"
	"Teambuilder": "编辑队伍", // NEEDS QC
	// suhleam's translation uses "天梯排名" which is clearer but less concise
	"Ladder": "天梯", // NEEDS QC
	"Tournaments": "锦标赛", // NEEDS QC
	"Friends": "好友",
	"Chat rooms": "聊天室",
	"Battles": "对战", // NEEDS QC
	"News": "新闻", // NEEDS QC
	"Offline": "离线", // NEEDS QC
	"[Join chat]": "加入聊天", // NEEDS QC
	"[All tabs]": "所有标签页", // NEEDS QC
	"[Menu]": "菜单", // NEEDS QC

	// #endregion Navigation

	// #region Generic UI
	// ==================================================================

	"[Hide]": "隐藏", // NEEDS QC
	"[Close]": "关闭", // NEEDS QC
	"[Done]": "完成", // NEEDS QC
	"[Back]": "返回", // NEEDS QC
	// TRANSLATORS: A computer copy command, like Ctrl+C
	"[Copy]": "复制", // NEEDS QC
	"[Edit]": "编辑", // NEEDS QC
	"[Delete]": "删除", // NEEDS QC
	"[Undo delete]": "撤销删除", // NEEDS QC
	// TRANSLATORS: "DM" is used to label DMs; "[Chat]" is the button to send a DM
	// TRANSLATORS: Feel free to use the same word for both (and for "Chat" in the Battle section)
	"DM": "私信", // NEEDS QC
	"[Chat]": "聊天", // NEEDS QC
	"[OK]": "确定", // NEEDS QC
	"[Cancel]": "取消", // NEEDS QC
	"[Accept]": "接受", // NEEDS QC
	"[Reject]": "拒绝", // NEEDS QC
	"Random team": "随机队伍", // NEEDS QC
	"[Sound]": "声音", // NEEDS QC
	"[Options]": "选项", // NEEDS QC
	"[Battle options]": "对战选项", // NEEDS QC
	"[Revert]": "还原", // NEEDS QC
	"[Refresh]": "刷新", // NEEDS QC
	"[Search]": "搜索", // NEEDS QC
	"[Validate]": "规则检查", // NEEDS QC
	"[Reconnect]": "重新连接", // NEEDS QC
	"Disconnected": "连接已断开", // NEEDS QC
	"Connecting...": "连接中...", // NEEDS QC
	"Loading...": "加载中...", // NEEDS QC
	"Uploading...": "上传中...", // NEEDS QC
	"[Change]": "更改", // NEEDS QC
	"[Add]": "添加", // NEEDS QC
	"[Look up]": "查询", // NEEDS QC
	"[Save changes]": "保存", // NEEDS QC
	"[Create]": "创建", // NEEDS QC
	"[Rename]": "重命名", // NEEDS QC
	"[Remove]": "移除", // NEEDS QC
	// TRANSLATORS: intentionally chosen to be very short. do not go longer than three letters for this one
	"Gen {NUMBER}": "第{NUMBER}世代", // NEEDS QC
	"[Maximize]": "最大化", // NEEDS QC
	"[Expand/collapse]": "展开/折叠", // NEEDS QC

	// TRANSLATORS: connection/team-storage errors
	"Sorry, psim connections are unsupported by your browser.": "抱歉，你的浏览器不支持psim连接。", // NEEDS QC
	"Your browser doesn't support third-party cookies. Some things might not work correctly.": "你的浏览器不支持第三方Cookie。部分功能可能无法正常工作。", // NEEDS QC
	"Your team storage format is too old for PS. You'll need to upgrade it at {URL}": "你的队伍存储格式过旧。请在 {URL} 升级", // NEEDS QC
	"Error loading uploaded teams: {ERROR}": "加载已上传队伍时出错：{ERROR}", // NEEDS QC
	"Error unknown. Try again later.": "未知错误。请稍后再试。", // NEEDS QC
	"Failed to load team: {ERROR}": "加载队伍失败：{ERROR}", // NEEDS QC
	"Error logging in.": "登录出错。", // NEEDS QC
	"Something is interfering with our connection to the login server. Most likely, your internet provider needs you to re-log-in, or your internet provider is blocking Pokémon Showdown.": "与登录服务器的连接受到干扰。很可能是你的网络服务商需要你重新登录，或者网络服务商屏蔽了Pokémon Showdown。", // NEEDS QC

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
	"Private rooms": "私密房间", // NEEDS QC
	"OFFLINE": "离线", // NEEDS QC
	"Username": "用户名", // NEEDS QC
	"[Register]": "注册", // NEEDS QC
	"[Add status]": "添加状态消息", // NEEDS QC
	"[Chat self]": "与自己聊天", // NEEDS QC
	"[Change name]": "更改名字", // NEEDS QC
	"[Log out]": "登出", // NEEDS QC
	"[Add friend]": "添加好友", // NEEDS QC
	"[Unignore]": "取消屏蔽", // NEEDS QC
	"[Ignore]": "屏蔽", // NEEDS QC
	"[Report]": "举报", // NEEDS QC
	"[Mute]": "禁言", // NEEDS QC
	"[7m]": "7分钟", // NEEDS QC
	"[Hourmute]": "1小时禁言", // NEEDS QC
	"[1h]": "1小时", // NEEDS QC
	"[Ban]": "封禁", // NEEDS QC
	"[2d]": "2天", // NEEDS QC
	"[Weekban]": "1周封禁", // NEEDS QC
	"[1w]": "1周", // NEEDS QC
	"[Modlog]": "管理日志", // NEEDS QC
	// TRANSLATORS: Showdown term for a global mute
	"[Lock]": "全域禁言", // NEEDS QC
	"[Weeklock]": "1周全域禁言", // NEEDS QC
	"[Namelock]": "名字锁定", // NEEDS QC
	"[Global modlog]": "全局管理日志", // NEEDS QC
	"[Avatar...]": "头像...", // NEEDS QC
	"[Close room]": "关闭房间", // NEEDS QC
	"[Report a user]": "举报用户", // NEEDS QC
	"({NUMBER} sec)": "（{NUMBER}秒）", // NEEDS QC
	"Room not found": "未找到房间", // NEEDS QC

	// TRANSLATORS: battle options
	"Side-by-side, controls below": "左右排列，操作栏在下", // NEEDS QC
	"Side-by-side, overlay controls": "左右排列，操作栏叠加", // NEEDS QC
	"Top-and-bottom, controls below": "上下排列，操作栏在下", // NEEDS QC
	"Top-and-bottom, overlay controls": "上下排列，操作栏叠加", // NEEDS QC
	"Scrolling, controls below": "滚动排列，操作栏在下", // NEEDS QC
	"Scrolling, overlay controls": "滚动排列，操作栏叠加", // NEEDS QC
	"Hardcore mode ON: Information not available in-game is now hidden.": "硬核模式已开启：游戏内无法获知的信息现已隐藏。", // NEEDS QC
	"Hardcore mode OFF: Information not available in-game is now shown.": "硬核模式已关闭：游戏内无法获知的信息现已显示。", // NEEDS QC
	"Spectators ignored.": "已忽略观战者。", // NEEDS QC
	"Spectators no longer ignored.": "不再忽略观战者。", // NEEDS QC
	"In this battle": "本场对战", // NEEDS QC
	"Hardcore mode (hide info not shown in-game)": "硬核模式（隐藏游戏内无法获知的信息）", // NEEDS QC
	"Ignore spectators": "忽略观战者", // NEEDS QC
	"Ignore opponent": "忽略对手", // NEEDS QC
	"Ignore nicknames": "忽略昵称", // NEEDS QC
	"All battles": "所有对战", // NEEDS QC
	"Layout": "布局", // NEEDS QC
	"Automatic ({SETTING})": "自动（{SETTING}）", // NEEDS QC
	"Automatic": "自动", // NEEDS QC
	"(DESKTOP)": "（桌面端）", // NEEDS QC
	"(MOBILE VERTICAL)": "（手机竖屏）", // NEEDS QC
	"(MOBILE HORIZONTAL)": "（手机横屏）", // NEEDS QC
	"You can still invite spectators by giving them the URL or using the /invite command": "你仍然可以通过分享网址或使用/invite命令邀请观战者", // NEEDS QC
	"Invite only (hide from Battles list)": "仅限邀请（不在对战列表中显示）", // NEEDS QC
	"Ignore Pokémon nicknames": "忽略宝可梦昵称", // NEEDS QC
	"Automatically start timer": "自动开启计时器", // NEEDS QC
	"Hardcore mode": "硬核模式", // NEEDS QC
	"Start at turn 0 when spectating battles": "观战时从第0回合开始", // NEEDS QC
	"Open new battles in the right-side panel": "在右侧面板中打开新对战", // NEEDS QC

	// TRANSLATORS: options
	"General": "通用", // NEEDS QC
	"Language": "语言", // NEEDS QC
	"Appearance": "外观", // NEEDS QC
	"Theme": "主题", // NEEDS QC
	"Light": "浅色", // NEEDS QC
	"Dark": "深色", // NEEDS QC
	"Match system theme": "跟随系统主题", // NEEDS QC
	"Two panels (if wide enough)": "双面板（宽度足够时）", // NEEDS QC
	"Single panel": "单面板", // NEEDS QC
	"Vertical tabs": "垂直标签页", // NEEDS QC
	"Background": "背景", // NEEDS QC
	"Disable animations": "禁用动画", // NEEDS QC
	"Use 2D sprites instead of 3D models": "使用2D图像代替3D模型", // NEEDS QC
	"Use modern sprites for past generations": "过去世代也使用现代图像", // NEEDS QC
	"Block DMs": "屏蔽私信", // NEEDS QC
	"Block challenges": "屏蔽挑战", // NEEDS QC
	"Show DMs in chatrooms": "在聊天室中显示私信", // NEEDS QC
	"Do not highlight when your name is said in chat": "聊天中提到你的名字时不高亮", // NEEDS QC
	"Confirm before leaving a room": "离开房间前确认", // NEEDS QC
	"Confirm before refreshing": "刷新前确认", // NEEDS QC
	"Always notify": "始终通知", // NEEDS QC
	"Notify when joined": "仅在参加时通知", // NEEDS QC
	"Hide": "隐藏", // NEEDS QC
	"Timestamps": "时间戳", // NEEDS QC
	"Off": "关闭", // NEEDS QC
	"Timestamps in DMs": "私信时间戳", // NEEDS QC
	"Chat preferences": "聊天偏好设置", // NEEDS QC
	"[Change background]": "更改背景", // NEEDS QC
	"[Text formatting...]": "文字格式...", // NEEDS QC
	"[Set as background]": "设为背景", // NEEDS QC
	"[Random]": "随机", // NEEDS QC

	// TRANSLATORS: team chooser
	"(uncategorized)": "（未分类）", // NEEDS QC
	"(all)": "（全部）", // NEEDS QC
	"[Other gens]": "其他世代", // NEEDS QC
	"Select a team": "选择队伍", // NEEDS QC
	"This team selector is no longer available (the challenge was cancelled or something).": "该队伍选择器已不可用（挑战被取消了之类的）。", // NEEDS QC
	"No teams found": "未找到队伍", // NEEDS QC
	"This format selector is no longer available.": "该对战格式选择器已不可用。", // NEEDS QC
	"Search formats": "搜索对战格式", // NEEDS QC

	// TRANSLATORS: login
	"[Choose name]": "选择名字", // NEEDS QC
	"Logging in...": "登录中...", // NEEDS QC
	"[Log in]": "登录", // NEEDS QC
	"[Try another name]": "换一个名字", // NEEDS QC
	"[Password...]": "密码...", // NEEDS QC
	"[Change password]": "更改密码", // NEEDS QC
	"[Show password]": "显示密码", // NEEDS QC
	"Loading Google log-in button...": "正在加载Google登录按钮...", // NEEDS QC
	"(color)": "（颜色）", // NEEDS QC
	"(Others will be able to see your name change. To change name privately, use \"Log out\")": "（其他人可以看到你的改名。要私下改名，请使用“登出”）", // NEEDS QC
	"if you registered this name:": "如果你注册过这个名字：", // NEEDS QC
	"if not:": "如果不是：", // NEEDS QC
	"This is someone else's account. Sorry.": "这是别人的账号。抱歉。", // NEEDS QC
	"Password": "密码", // NEEDS QC

	// TRANSLATORS: register / change password
	"All fields are required": "所有字段均为必填", // NEEDS QC
	"Passwords do not match": "两次输入的密码不一致", // NEEDS QC
	"Your password was successfully changed!": "密码修改成功！", // NEEDS QC
	"Change your password:": "修改密码：", // NEEDS QC
	"Old password": "旧密码", // NEEDS QC
	"New password": "新密码", // NEEDS QC
	"New password (confirm)": "新密码（确认）", // NEEDS QC
	"You have been successfully registered.": "注册成功。", // NEEDS QC
	"Register your account:": "注册账号：", // NEEDS QC
	"Password (confirm)": "密码（确认）", // NEEDS QC
	"An Electric-type mouse that is the mascot of the Pokémon franchise.": "宝可梦系列的吉祥物，电属性的老鼠宝可梦。", // NEEDS QC
	"What is this Pokémon?": "这是什么宝可梦？", // NEEDS QC

	// #endregion Popups

	// #region Main Menu
	// ==================================================================

	// TRANSLATORS: Our famous ladder queue button. Give it some flair :)
	// TRANSLATORS: Might we suggest "Showdown!"
	"[Battle!]": "开战！", // NEEDS QC
	"Find a random opponent": "寻找随机对手", // NEEDS QC
	"Watch a battle": "观看对战", // NEEDS QC
	"Find a user": "查找用户", // NEEDS QC
	"Info & Resources": "信息与资源", // NEEDS QC
	"Lobby chat": "大厅聊天", // NEEDS QC

	// TRANSLATORS: Challenge/Search UI
	"[Challenge]": "挑战", // NEEDS QC
	"Custom rules": "自定义规则", // NEEDS QC
	// TRANSLATORS: Search countdown. {NUMBER} = a number of seconds
	// TRANSLATORS: English doesn't include the unit (seconds) but your language can
	"Searching in {NUMBER}...": "{NUMBER}秒后开始搜索...", // NEEDS QC
	"Searching...": "正在搜索对手...", // NEEDS QC
	"Pokédex": "宝可梦图鉴", // NEEDS QC
	"Replays": "对战回放", // NEEDS QC
	"Forum": "论坛", // NEEDS QC
	"Rules": "规则", // NEEDS QC
	"Credits": "制作人员", // NEEDS QC
	"Privacy": "隐私", // NEEDS QC
	"background by {ARTIST}": "背景：{ARTIST}", // NEEDS QC

	// TRANSLATORS: errors
	"Wait for this countdown to finish first...": "请先等待倒计时结束...", // NEEDS QC
	"You're already searching for a {FORMAT} battle...": "你已经在搜索{FORMAT}对战了...", // NEEDS QC
	"You need to go into the Teambuilder and build a team for this format.": "你需要在队伍构建器中为该格式组建一支队伍。", // NEEDS QC

	// #endregion Main Menu

	// #region Rooms
	// ==================================================================

	// TRANSLATORS: these go under the user/battle counts, and in English they read as "100 users online"
	// TRANSLATORS: but they don't have to work that way in your language
	"users online": "位用户在线", // NEEDS QC
	"active battles": "场对战进行中", // NEEDS QC
	"Find an online user": "查找在线用户", // NEEDS QC
	"Watch an active battle": "观看进行中的对战", // NEEDS QC
	"Meloetta is PS's mascot! The Aria forme is about using its voice, and represents our chatrooms.": "美洛耶塔是PS的吉祥物！歌声形态以歌声为特点，象征着我们的聊天室。", // NEEDS QC
	"Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles.": "美洛耶塔是PS的吉祥物！舞步形态是格斗属性，象征着我们的对战。", // NEEDS QC

	"Official chat rooms": "官方聊天室", // NEEDS QC
	"Hidden rooms": "隐藏房间", // NEEDS QC

	"Subrooms": "子房间", // NEEDS QC
	"(All rooms)": "（所有房间）", // NEEDS QC
	"Join or search for rooms": "加入或搜索房间", // NEEDS QC
	"Command": "命令", // NEEDS QC
	"Console": "控制台", // NEEDS QC
	"Enter = run command {INPUT}": "Enter = 运行命令{INPUT}", // NEEDS QC
	"(Subroom of {ROOM})": "（{ROOM}的子房间）", // NEEDS QC
	"Possible secret room": "可能是秘密房间", // NEEDS QC
	"(Private room?)": "（私密房间？）", // NEEDS QC
	"Search results": "搜索结果", // NEEDS QC

	// #endregion Rooms

	// #region Battle
	// ==================================================================

	// TRANSLATORS: Note that most translations of battle UI are in the server repository
	// TRANSLATORS: In data/text/[lang]/default.ts and data/text/[lang]/names.ts

	// TRANSLATORS: [Team]/[Battle]/[Switch]/[Shift] are buttons in overlay controls
	// TRANSLATORS: But they're section headers in normal battle controls
	// TRANSLATORS: For the "Use move" menu in battle controls
	// TRANSLATORS: This was "Attack" in older Showdown, "FIGHT" on older cart, and "Battle" on modern cart
	// SV battle menu: 战斗
	"[Battle]": "战斗", // NEEDS QC
	// TRANSLATORS: For the "Switch" menu in battle controls
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Switch]": "更换", // NEEDS QC
	// TRANSLATORS: For the Team Preview menu in battle controls
	// TRANSLATORS: Also replaces "[Switch]" in phases where switching isn't possible
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Team]": "队伍", // NEEDS QC
	// TRANSLATORS: The Triples "move to center" button
	// TRANSLATORS: This is "SHIFT" on older cart; Triples doesn't exist on modern cart
	// Triples predate official Chinese; 移动 mirrors ORAS's "move" wording (ja いどう, es Mover, ...)
	"[Shift]": "移动", // NEEDS QC

	// TRANSLATORS: Mobile-layout buttons for switching between the battle view and the chat view
	// TRANSLATORS: ("Chat" is also used as a section header in the options popup)
	"Battle": "对战", // NEEDS QC
	"Chat": "聊天", // NEEDS QC
	"[Try Fight button]": "试按战斗按钮", // NEEDS QC
	// TRANSLATORS: For the "where to target this move" menu
	"(empty slot)": "（空位）", // NEEDS QC
	"Maxed with no max moves": "没有可用的极巨招式", // NEEDS QC
	"No Z moves": "没有Z招式", // NEEDS QC

	"[Rematch]": "再战", // NEEDS QC
	"[Offer tie]": "提议平局", // NEEDS QC
	"[Forfeit]": "认输", // NEEDS QC
	"[Forfeit and close]": "认输并关闭", // NEEDS QC
	"[Replace player]": "替换玩家", // NEEDS QC
	"[Replace]": "替换", // NEEDS QC
	"(turn 100+)": "（100回合后）", // NEEDS QC
	"[Stop timer]": "停止计时器", // NEEDS QC
	"[Start timer]": "开始计时器", // NEEDS QC
	"Enter player's name": "请输入玩家名", // NEEDS QC
	"Cannot replace player, battle has already ended.": "对战已结束，无法替换玩家。", // NEEDS QC

	// TRANSLATORS: for replay controls
	"[Play]": "播放", // NEEDS QC
	"[Pause]": "暂停", // NEEDS QC
	"[First turn]": "第一回合", // NEEDS QC
	"[Prev turn]": "上一回合", // NEEDS QC
	"[Skip turn]": "下一回合", // NEEDS QC
	"[Skip to end]": "跳到结尾", // NEEDS QC
	"[Switch viewpoint]": "切换视角", // NEEDS QC
	"[Go to turn]": "跳转回合", // NEEDS QC
	"[Skip]": "跳过", // NEEDS QC
	"[Skip animation]": "跳过动画", // NEEDS QC
	"[Move to center]": "移动到中央", // NEEDS QC
	"[Upload and share replay]": "上传并分享对战回放", // NEEDS QC
	"[Replay]": "对战回放", // NEEDS QC
	"(closes this battle)": "（将关闭此对战）", // NEEDS QC

	// TRANSLATORS: for the battle list
	"Minimum Elo": "最低Elo", // NEEDS QC
	"rated {ELO}": "评分{ELO}", // NEEDS QC
	// TRANSLATORS: goes between two usernames; the key includes its surrounding spacing so some languages can drop it
	"{PLAYER1} vs. {PLAYER2}": "{PLAYER1} 对 {PLAYER2}", // NEEDS QC
	"(All formats)": "（所有对战模式）", // NEEDS QC
	"Username prefix": "用户名前缀", // NEEDS QC
	"No battles are going on": "当前没有进行中的对战", // NEEDS QC
	"{NUMBER} battle": "{NUMBER}场对战", // NEEDS QC
	"{NUMBER} battles": "{NUMBER}场对战", // NEEDS QC
	"None": "无", // NEEDS QC
	"Timer": "计时器", // NEEDS QC
	"Error": "错误", // NEEDS QC
	"The battle you're looking for has expired. Battles expire after 15 minutes of inactivity unless they're saved.": "你查找的对战已过期。对战若未保存，15分钟无活动后就会过期。", // NEEDS QC
	"In the future, remember to click \"Save replay\" to save a replay permanently.": "今后记得点击“保存回放”来永久保存回放。", // NEEDS QC
	"Unrecognized HTML file: Only replay files are supported.": "无法识别的HTML文件：仅支持回放文件。", // NEEDS QC
	"You are still in {ROOM}": "你仍在{ROOM}中", // NEEDS QC
	"Battle \"{INPUT}\" not found": "找不到对战“{INPUT}”", // NEEDS QC
	"Uploaded replay": "已上传的回放", // NEEDS QC
	"Team {PLAYER}": "{PLAYER}队", // NEEDS QC
	"{PLAYER} and friends": "{PLAYER}和伙伴们", // NEEDS QC

	// TRANSLATORS: battle log messages
	"[Earlier messages]": "更早的消息", // NEEDS QC
	"Register an account to protect your ladder rating!": "注册账号以保护你的天梯评分！", // NEEDS QC
	"Open team sheet for {PLAYER}": "打开{PLAYER}的队伍表单", // NEEDS QC
	"Warning": "警告", // NEEDS QC
	"Variation": "变体", // NEEDS QC
	"Rated battle": "评分对战", // NEEDS QC

	// TRANSLATORS: screen reader labels
	"Active Pokémon": "场上宝可梦", // NEEDS QC
	"Your team": "我方队伍", // NEEDS QC
	"Opponent's team": "对方队伍", // NEEDS QC
	"Statused": "有异常状态", // NEEDS QC
	"Non-statused": "无异常状态", // NEEDS QC
	"Unrevealed Illusion user": "未暴露的幻觉使用者", // NEEDS QC
	"Not revealed": "未亮相", // NEEDS QC
	"Battle controls": "对战操作", // NEEDS QC

	// #endregion Battle

	// #region Chat
	// ==================================================================

	"{NUMBER} user": "{NUMBER}位用户", // NEEDS QC
	"{NUMBER} users": "{NUMBER}位用户", // NEEDS QC
	"[Join]": "加入", // NEEDS QC
	"[Leave]": "离开", // NEEDS QC
	"[Ready!]": "准备完毕！", // NEEDS QC
	"In progress": "进行中", // NEEDS QC
	"Signups": "报名中", // NEEDS QC
	"[Pop-out]": "弹出窗口", // NEEDS QC
	"[Go]": "前往", // NEEDS QC
	"[Visit]": "打开", // NEEDS QC
	"[Choose a name before sending messages]": "发送消息前请先选择名字", // NEEDS QC
	"Challenging...": "挑战中...", // NEEDS QC
	"Accepting...": "接受中...", // NEEDS QC
	"[Commands]": "命令", // NEEDS QC
	"Mentioned by {USER} in {ROOM}": "{USER}在{ROOM}中提到了你", // NEEDS QC
	"{USERS} joined": "{USERS}加入了", // NEEDS QC
	// TRANSLATORS: separates "X joined" from "Y left"
	"{JOINEDMESSAGE}; {LEFTMESSAGE}": "{JOINEDMESSAGE}；{LEFTMESSAGE}", // NEEDS QC
	"{USERS} left": "{USERS}离开了", // NEEDS QC
	"{USER} renamed from {OLDUSER}.": "{OLDUSER}已改名为{USER}。", // NEEDS QC
	"(Private to {USER})": "（私信给{USER}）", // NEEDS QC
	"{FORMAT} battle started between {PLAYER1} and {PLAYER2}.": "{PLAYER1}和{PLAYER2}的{FORMAT}对战开始了。", // NEEDS QC
	// TRANSLATORS: for when the format name already includes "battle"
	"{FORMAT} started between {PLAYER1} and {PLAYER2}.": "{PLAYER1}和{PLAYER2}的{FORMAT}开始了。", // NEEDS QC
	// TRANSLATORS: for when the format is unknown
	"Battle started between {PLAYER1} and {PLAYER2}.": "{PLAYER1}和{PLAYER2}的对战开始了。", // NEEDS QC
	"({NUMBER} line from {USER} hidden)": "（已隐藏{USER}的{NUMBER}行消息）", // NEEDS QC
	"({NUMBER} lines from {USER} hidden)": "（已隐藏{USER}的{NUMBER}行消息）", // NEEDS QC
	"{USER} invited you to join the room \"{ROOM}\"": "{USER}邀请你加入房间“{ROOM}”", // NEEDS QC
	"[Join {ROOM}]": "加入{ROOM}", // NEEDS QC
	"Chat log": "聊天记录", // NEEDS QC

	// TRANSLATORS: tournaments
	"Please respond to the tournament within {SECONDS} seconds or you may be automatically disqualified.": "请在{SECONDS}秒内响应锦标赛，否则可能被自动取消资格。", // NEEDS QC
	"Single Elimination": "单败淘汰赛", // NEEDS QC
	"Double Elimination": "双败淘汰赛", // NEEDS QC
	"Round Robin": "循环赛", // NEEDS QC
	"Double Round Robin": "双循环赛", // NEEDS QC
	"{JOINS} joined the tournament": "{JOINS}加入了锦标赛", // NEEDS QC
	"{LEAVES} left the tournament": "{LEAVES}离开了锦标赛", // NEEDS QC
	// TRANSLATORS: sentence terminator for messages like the above
	"{SENTENCE}.": "{SENTENCE}。", // NEEDS QC
	"{FORMAT} {TYPE} tournament": "{FORMAT}{TYPE}", // NEEDS QC
	"No tournaments are currently running.": "当前没有正在进行的锦标赛。", // NEEDS QC
	"(started)": "（已开始）", // NEEDS QC
	"{TOURNAMENT} created.": "{TOURNAMENT}已创建。", // NEEDS QC
	"{TOURNAMENT} created (and hidden).": "{TOURNAMENT}已创建（并已隐藏）。", // NEEDS QC
	"Tournament created": "锦标赛已创建", // NEEDS QC
	// TRANSLATORS: label, as in "Room: lobby"
	"Room": "房间", // NEEDS QC
	"Type": "类型", // NEEDS QC
	"{USER} has joined the tournament, replacing {OLDUSER}.": "{USER}加入了锦标赛，替换了{OLDUSER}。", // NEEDS QC
	"({NUMBER} players)": "（{NUMBER}名玩家）", // NEEDS QC
	"The tournament has started!": "锦标赛开始了！", // NEEDS QC
	"{USER} has been disqualified from the tournament.": "{USER}已被取消锦标赛资格。", // NEEDS QC
	"The tournament's automatic disqualify timer has been turned off.": "锦标赛的自动取消资格计时器已关闭。", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minute.": "锦标赛的自动取消资格计时器已设为{NUMBER}分钟。", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minutes.": "锦标赛的自动取消资格计时器已设为{NUMBER}分钟。", // NEEDS QC
	"Tournament automatic disqualification warning": "锦标赛自动取消资格警告", // NEEDS QC
	"Time": "时间", // NEEDS QC
	"{NUMBER} sec": "{NUMBER}秒", // NEEDS QC
	"The tournament's automatic start is now off.": "锦标赛的自动开始已关闭。", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minute.": "锦标赛将在{NUMBER}分钟后自动开始。", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minutes.": "锦标赛将在{NUMBER}分钟后自动开始。", // NEEDS QC
	"Scouting is now allowed (Tournament players can watch other tournament battles)": "现在允许侦察（锦标赛玩家可以观战其他锦标赛对战）", // NEEDS QC
	"Scouting is now banned (Tournament players can't watch other tournament battles)": "现在禁止侦察（锦标赛玩家不能观战其他锦标赛对战）", // NEEDS QC
	"Tournament challenges available": "锦标赛可以发起挑战了", // NEEDS QC
	"Tournament challenge from {PLAYER}": "来自{PLAYER}的锦标赛挑战", // NEEDS QC
	"Tournament battle between {PLAYER1} and {PLAYER2} started.": "{PLAYER1}和{PLAYER2}的锦标赛对战开始了。", // NEEDS QC
	"{PLAYER1} has won the match {SCORE} against {PLAYER2}": "{PLAYER1}以{SCORE}战胜了{PLAYER2}", // NEEDS QC
	"{PLAYER1} has lost the match {SCORE} against {PLAYER2}": "{PLAYER1}以{SCORE}输给了{PLAYER2}", // NEEDS QC
	"{PLAYER1} has drawn the match {SCORE} against {PLAYER2}": "{PLAYER1}与{PLAYER2}以{SCORE}战平", // NEEDS QC
	" but the tournament does not support drawing, so it did not count": "（但该锦标赛不支持平局，因此不计入）", // NEEDS QC
	"Congratulations to {WINNERS} for winning the {TOURNAMENT}!": "恭喜{WINNERS}赢得{TOURNAMENT}！", // NEEDS QC
	"Runners-up": "亚军", // NEEDS QC
	"Runner-up": "亚军", // NEEDS QC
	"The tournament was forcibly ended.": "锦标赛被强制结束了。", // NEEDS QC
	"The tournament has already started.": "锦标赛已经开始了。", // NEEDS QC
	"The tournament hasn't started yet.": "锦标赛还没有开始。", // NEEDS QC
	"You are already in the tournament.": "你已经在锦标赛中了。", // NEEDS QC
	"One of your alts is already in the tournament.": "你的小号已经在锦标赛中了。", // NEEDS QC
	"You aren't in the tournament.": "你不在锦标赛中。", // NEEDS QC
	"This user isn't in the tournament.": "该用户不在锦标赛中。", // NEEDS QC
	"There aren't enough users.": "用户数量不足。", // NEEDS QC
	"That isn't a valid timeout value.": "无效的计时器数值。", // NEEDS QC
	"That isn't a valid tournament matchup.": "无效的锦标赛对阵。", // NEEDS QC
	"You must have a name in order to join the tournament.": "你需要一个名字才能加入锦标赛。", // NEEDS QC
	"The tournament is already at maximum capacity for users.": "锦标赛人数已满。", // NEEDS QC
	"You have already been disqualified.": "你已经被取消资格了。", // NEEDS QC
	"This user has already been disqualified.": "该用户已经被取消资格了。", // NEEDS QC
	"You are banned from entering tournaments.": "你被禁止参加锦标赛。", // NEEDS QC
	"Unknown error: {ERROR}": "未知错误：{ERROR}", // NEEDS QC
	"Waiting for battles to become available...": "等待可进行的对战...", // NEEDS QC
	"vs. {PLAYER}": "vs. {PLAYER}", // NEEDS QC
	"Or wait for {PLAYERS} to challenge you.": "或者等待{PLAYERS}向你发起挑战。", // NEEDS QC
	"Waiting for {PLAYERS} to challenge you.": "等待{PLAYERS}向你发起挑战。", // NEEDS QC
	"Waiting for {PLAYER}...": "等待{PLAYER}...", // NEEDS QC
	"Unavailable": "不可用", // NEEDS QC
	"Waiting": "等待中", // NEEDS QC
	"Challenging": "挑战中", // NEEDS QC

	// TRANSLATORS: command errors
	"This player does not exist or is not online.": "该玩家不存在或不在线。", // NEEDS QC
	"This command can only be used in proper chat rooms.": "该命令只能在聊天室中使用。", // NEEDS QC
	"Error: corrupted ranking data": "错误：排名数据已损坏", // NEEDS QC
	"You are not in a battle": "你不在对战中", // NEEDS QC
	"Invalid turn number: {NUMBER}": "无效的回合数：{NUMBER}", // NEEDS QC
	"Turn navigation is disabled in hardcore mode.": "硬核模式下无法使用回合跳转。", // NEEDS QC
	"You are not a player in this battle": "你不是本场对战的玩家", // NEEDS QC
	"Can only be used in a DM.": "只能在私信中使用。", // NEEDS QC
	"Please wait 5 seconds before challenging again.": "请等待5秒后再次发起挑战。", // NEEDS QC

	// #endregion Chat

	// #region Teambuilder
	// ==================================================================

	// TRANSLATORS: This is for the Teams list view so it can't be singular
	// TRANSLATORS: Should be something like "Teams List" if you have no singular
	// TRANSLATORS: Can be different from TL.term.teams, which "Teams" as in "plural of Team"
	"Teams": "队伍列表", // NEEDS QC
	"[New team]": "新建队伍", // NEEDS QC
	"[New team in folder]": "在文件夹中新建队伍", // NEEDS QC
	"[New {FORMAT} team]": "新{FORMAT}队伍", // NEEDS QC
	"[New box]": "新建盒子", // NEEDS QC
	// TRANSLATORS: When deleting a folder, button to add folder name to all teams in it
	"[Convert to prefix]": "将文件夹名加到队伍名前", // NEEDS QC
	"[(add folder)]": "（添加文件夹）", // NEEDS QC
	"[(add format folder)]": "（添加对战格式文件夹）", // NEEDS QC
	"Names can't contain slashes, since they're used as a folder separator.": "名称中不能包含斜杠，因为它用作文件夹分隔符。", // NEEDS QC
	"Names can't contain the character |, since they're used for storing teams.": "名称中不能包含字符|，因为它用于存储队伍。", // NEEDS QC
	"New name required": "需要输入新名称", // NEEDS QC
	"Not in a folder": "不在文件夹中", // NEEDS QC
	"Teams not in any folders": "未分入文件夹的队伍", // NEEDS QC
	"All teams": "所有队伍", // NEEDS QC
	"Folders": "文件夹", // NEEDS QC

	// TRANSLATORS: for Clipboard actions
	"Copied!": "已复制！", // NEEDS QC
	"[Paste copy here]": "粘贴副本到此处", // NEEDS QC
	"[Add to clipboard]": "添加到剪贴板", // NEEDS QC
	"[Copy/Move]": "复制/移动", // NEEDS QC
	"[+ Clipboard]": "+ 剪贴板", // NEEDS QC
	"[Deselect]": "取消选择", // NEEDS QC
	"[Move here]": "移动到此处", // NEEDS QC

	// TRANSLATORS: for Import/Export
	"[Backup]": "备份", // NEEDS QC
	"[Backup search results]": "备份搜索结果", // NEEDS QC
	"[Backup folder]": "备份文件夹", // NEEDS QC
	"Import/Export": "导入/导出", // NEEDS QC
	"[Import/Export]": "导入/导出", // NEEDS QC
	"[Import]": "导入", // NEEDS QC
	"(can't save partial exports)": "（仅显示部分时无法保存）", // NEEDS QC

	// TRANSLATORS: for uploaded teams
	"Account": "账号", // NEEDS QC
	"Account (public)": "账号（公开）", // NEEDS QC
	"Local": "本地", // NEEDS QC
	"Uploaded": "已上传", // NEEDS QC
	"[Upload for shareable URL]": "上传以获得分享链接", // NEEDS QC
	"[Upload for shareable/searchable URL]": "上传以获得可分享、可搜索的链接", // NEEDS QC
	"Disconnected (wrong account?)": "连接已断开（账号不对？）", // NEEDS QC
	"[Revert to uploaded version]": "还原为已上传版本", // NEEDS QC
	"[Compare]": "对比", // NEEDS QC
	"[Upload changes]": "上传更改", // NEEDS QC
	"Team was deleted": "队伍已被删除", // NEEDS QC
	"Team doesn't exist": "队伍不存在", // NEEDS QC
	"Untitled team": "未命名队伍", // NEEDS QC
	"Uploaded by": "上传者", // NEEDS QC
	"Views": "浏览量", // NEEDS QC
	"Team deleted": "队伍已删除", // NEEDS QC
	"Not found": "未找到", // NEEDS QC

	// TRANSLATORS: for the team editor
	"[Add Pokémon]": "添加宝可梦", // NEEDS QC
	"(choose ability)": null, // NEEDS TRANSLATION
	"Details": "详情", // NEEDS QC
	// TRANSLATORS: Teambuilder "form" with text boxes inside, not form/forme "form" of a pokemon
	"Form": "表单", // NEEDS QC
	"Tera": "太晶", // NEEDS QC
	// TRANSLATORS: These two are for Hidden Power type
	// TRANSLATORS: They're both designed to take up very little width, so keep that in mind
	"H.P.": "觉醒", // NEEDS QC
	"H. Power": "觉醒力量", // NEEDS QC
	"Defensive coverage": "防御相性", // NEEDS QC
	"Teambuilding resources for {FORMAT}": "{FORMAT}的组队资源", // NEEDS QC
	"[See all]": "查看全部", // NEEDS QC
	"Search species or filter by type, learnable moves, ability, tier, or egg group": "搜索宝可梦（可按属性、可学招式、特性、分级、蛋群筛选）", // NEEDS QC
	"Search abilities": "搜索特性", // NEEDS QC
	"Search items": "搜索道具", // NEEDS QC
	"Search moves or filter by type or category": "搜索招式（可按属性、分类筛选）", // NEEDS QC
	"Sample sets": "样板配置", // NEEDS QC
	"Box sets": "盒子配置", // NEEDS QC
	"Guessed spread": "推测的努力值分配", // NEEDS QC
	"(Please choose 4 moves to get a guessed spread)": "（选择4个招式后可推测努力值分配）", // NEEDS QC
	"Protip": "小提示", // NEEDS QC
	"Use a different nature to save {NUMBER} EVs:": "更换性格可节省{NUMBER}点努力值：", // NEEDS QC
	"Use a different nature to get higher stats:": "更换性格可获得更高的能力值：", // NEEDS QC
	"Natures cannot raise or lower HP.": "性格无法提高或降低HP。", // NEEDS QC
	// TRANSLATORS: {STATCHANGES} is +stat/-stat
	"{STATCHANGES} nature": "{STATCHANGES}性格", // NEEDS QC
	// TRANSLATORS: {1} and {2} are the + and - keyboard keys
	"You can also set natures by typing {1} and {2} in the EV box.": "在努力值输入框中输入{1}或{2}也可以设置性格。", // NEEDS QC
	"Pasted team": "粘贴的队伍", // NEEDS QC
	"Zoom out forms": "缩小表单", // NEEDS QC
	"Compact": "紧凑", // NEEDS QC
	"Comfortable": "宽松", // NEEDS QC
	"Zoom out search results": "缩小搜索结果", // NEEDS QC
	"Fetching Paste...": "正在获取Paste...", // NEEDS QC
	"Import/Export set": "导入/导出配置", // NEEDS QC
	"IV spreads": "个体值配置", // NEEDS QC
	"min Atk": "攻击最小", // NEEDS QC
	"min Atk, min Spe": "攻击、速度最小", // NEEDS QC
	"max all": "全部最大", // NEEDS QC
	"min Spe": "速度最小", // NEEDS QC
	"Hidden Power {TYPE} IVs": "觉醒力量（{TYPE}）个体值", // NEEDS QC
	"EVs, IVs, and nature": "努力值、个体值与性格", // NEEDS QC
	"Base": "种族值", // NEEDS QC
	"Remaining": "剩余", // NEEDS QC

	// TRANSLATORS: errors
	"You must select a format first.": "请先选择对战格式。", // NEEDS QC
	"This team is for a different account. Please log into the correct account to update it.": "这个队伍属于其他账号。要更新它，请登录正确的账号。", // NEEDS QC
	"Add a Pokémon to your team before uploading it.": "上传前请先向队伍中添加宝可梦。", // NEEDS QC
	"Must use on an uploaded team.": "只能对已上传的队伍使用。", // NEEDS QC
	"Team not found: {INPUT}": "未找到队伍：{INPUT}", // NEEDS QC
	"Your file \"{FILENAME}\" is not a valid team.": "文件“{FILENAME}”不是有效的队伍。", // NEEDS QC

	// #endregion Teambuilder

	// #region Ladder
	// ==================================================================

	"[All formats]": "所有对战格式", // NEEDS QC
	"[How the ladder works]": "天梯说明", // NEEDS QC
	"[Seasonal rankings]": "赛季排名", // NEEDS QC
	"[Look up a specific user's rating]": "查询特定用户的评分", // NEEDS QC
	"Name": "名字", // NEEDS QC
	"Elo rating": "Elo评分", // NEEDS QC
	"user's percentage chance of winning a random battle (Glicko X-Act Estimate)": "随机对战中获胜概率的估计值（Glicko X-Act估计）", // NEEDS QC
	"Glicko-1 rating system: rating±deviation (provisional if deviation>100)": "Glicko-1评分系统：评分±偏差（偏差>100为临时）", // NEEDS QC
	"No one has played any ranked games yet.": "还没有人进行过排位对战。", // NEEDS QC

	// #endregion Ladder

	// #region Misc rooms
	// ==================================================================

	"[Join the Help room for live help]": "前往Help房间获取帮助", // NEEDS QC
	"Unrecognized command: {INPUT}": "无法识别的命令：{INPUT}", // NEEDS QC

	// #endregion Misc rooms
};
