// Remember, comments starting with "TRANSLATORS:" are from Showdown,
// and are shared between all translations. But other comments can be
// used as notes to yourself or other translators, and are specific
// to the Japanese translation.

import type { UIText } from '../build-tools/translations.mts';
export const translations: UIText = {
	// #region Navigation
	// ==================================================================

	// TRANSLATORS: Note that "Home" and "Main Menu" refer to the same place
	// TRANSLATORS: So it's fine if they're the same word in your language
	"Home": "ホーム", // NEEDS QC
	// TRANSLATORS: This is used as a "Back to Home" button after battles
	"[Main menu]": "メインメニュー", // NEEDS QC
	// TRANSLATORS: It's fine if "Teambuilder" and "Teams" are the same word in your language
	// TRANSLATORS: Also consider something like "Edit teams" for "Teambuilder"
	// "チームビルダー" is also common among Japanese Showdown players
	"Teambuilder": "チーム編集", // NEEDS QC
	// Japanese Showdown players also say "ラダー" or "レート";
	// "ランキング" is clearest for the page this opens
	"Ladder": "ランキング", // NEEDS QC
	// "トーナメント" is a known alternative
	"Tournaments": "大会", // NEEDS QC
	"Friends": "フレンド", // NEEDS QC
	"Chat rooms": "チャットルーム", // NEEDS QC
	"Battles": "対戦", // NEEDS QC
	"News": "ニュース", // NEEDS QC
	"Offline": "オフライン", // NEEDS QC
	"[Join chat]": "チャットに参加", // NEEDS QC
	"[All tabs]": "すべてのタブ", // NEEDS QC
	"[Menu]": "メニュー", // NEEDS QC

	// #endregion Navigation

	// #region Generic UI
	// ==================================================================

	"[Hide]": "非表示", // NEEDS QC
	"[Close]": "閉じる", // NEEDS QC
	"[Done]": "完了", // NEEDS QC
	"[Back]": "戻る", // NEEDS QC
	// TRANSLATORS: A computer copy command, like Ctrl+C
	"[Copy]": "コピー", // NEEDS QC
	"[Edit]": "編集", // NEEDS QC
	"[Delete]": "削除", // NEEDS QC
	"[Undo delete]": "削除を元に戻す", // NEEDS QC
	// TRANSLATORS: "DM" is used to label DMs; "[Chat]" is the button to send a DM
	// TRANSLATORS: Feel free to use the same word for both (and for "Chat" in the Battle section)
	"DM": "DM", // NEEDS QC
	"[Chat]": "チャット", // NEEDS QC
	"[OK]": "OK", // NEEDS QC
	"[Cancel]": "キャンセル", // NEEDS QC
	"[Accept]": "承諾", // NEEDS QC
	"[Reject]": "拒否", // NEEDS QC
	"Random team": "ランダムチーム", // NEEDS QC
	"[Sound]": "サウンド", // NEEDS QC
	"[Options]": "設定", // NEEDS QC
	"[Battle options]": "対戦設定", // NEEDS QC
	"[Revert]": "元に戻す", // NEEDS QC
	"[Refresh]": "再読み込み", // NEEDS QC
	"[Search]": "検索", // NEEDS QC
	"[Validate]": "ルールチェック", // NEEDS QC
	"[Reconnect]": "再接続", // NEEDS QC
	"Disconnected": "切断されました", // NEEDS QC
	"Connecting...": "接続中...", // NEEDS QC
	"Loading...": "読み込み中...", // NEEDS QC
	"Uploading...": "アップロード中...", // NEEDS QC
	"[Change]": "変更", // NEEDS QC
	"[Add]": "追加", // NEEDS QC
	"[Look up]": "検索", // NEEDS QC
	"[Save changes]": "保存", // NEEDS QC
	"[Create]": "作成", // NEEDS QC
	"[Rename]": "名前を変更", // NEEDS QC
	"[Remove]": "はずす", // NEEDS QC
	// TRANSLATORS: intentionally chosen to be very short. do not go longer than three letters for this one
	"Gen {NUMBER}": "第{NUMBER}世代", // NEEDS QC
	"[Maximize]": "最大化", // NEEDS QC
	"[Expand/collapse]": "展開・折りたたみ", // NEEDS QC

	// TRANSLATORS: connection/team-storage errors
	"Sorry, psim connections are unsupported by your browser.": "お使いのブラウザはpsim接続に対応していません。", // NEEDS QC
	"Your browser doesn't support third-party cookies. Some things might not work correctly.": "お使いのブラウザはサードパーティCookieに対応していません。一部の機能が正しく動作しない場合があります。", // NEEDS QC
	"Your team storage format is too old for PS. You'll need to upgrade it at {URL}": "チームの保存形式が古すぎます。{URL} でアップグレードしてください", // NEEDS QC
	"Error loading uploaded teams: {ERROR}": "アップロード済みチームの読み込みエラー：{ERROR}", // NEEDS QC
	"Error unknown. Try again later.": "不明なエラーです。あとでもう一度お試しください。", // NEEDS QC
	"Failed to load team: {ERROR}": "チームを読み込めませんでした：{ERROR}", // NEEDS QC
	"Error logging in.": "ログインエラーです。", // NEEDS QC
	"Something is interfering with our connection to the login server. Most likely, your internet provider needs you to re-log-in, or your internet provider is blocking Pokémon Showdown.": "ログインサーバーへの接続が妨害されています。プロバイダへの再ログインが必要か、プロバイダがPokémon Showdownをブロックしている可能性があります。", // NEEDS QC

	// TRANSLATORS: for constructing lists
	"{FIRST} or {SECOND}": "{FIRST}か{SECOND}", // NEEDS QC
	"{FIRST} and {SECOND}": "{FIRST}と{SECOND}", // NEEDS QC
	", {NEXT}": "、{NEXT}", // NEEDS QC
	", or {LAST}": "、または{LAST}", // NEEDS QC
	", and {LAST}": "、{LAST}", // NEEDS QC
	// TRANSLATORS: this is for lists of users specifically
	// TRANSLATORS: (languages with counters should use the "person" counter)
	", and {NUMBER} others": "、ほか{NUMBER}名", // NEEDS QC

	// #endregion Generic UI

	// #region Popups
	// ==================================================================

	// TRANSLATORS: user popup
	// TRANSLATORS: "Global {RANK}" is a rank, like "Global Moderator"
	"Global {RANK}": "グローバル{RANK}", // NEEDS QC
	"Chatrooms": "チャットルーム", // NEEDS QC
	"Private rooms": "プライベートルーム", // NEEDS QC
	"OFFLINE": "オフライン", // NEEDS QC
	"Username": "ユーザー名", // NEEDS QC
	"[Register]": "登録", // NEEDS QC
	"[Add status]": "ステータスを追加", // NEEDS QC
	"[Chat self]": "自分とチャット", // NEEDS QC
	"[Change name]": "名前を変更", // NEEDS QC
	"[Log out]": "ログアウト", // NEEDS QC
	"[Add friend]": "フレンド登録", // NEEDS QC
	"[Unignore]": "無視解除", // NEEDS QC
	"[Ignore]": "無視", // NEEDS QC
	"[Report]": "通報", // NEEDS QC
	"[Mute]": "ミュート", // NEEDS QC
	"[7m]": "7分", // NEEDS QC
	"[Hourmute]": "1時間ミュート", // NEEDS QC
	"[1h]": "1時間", // NEEDS QC
	"[Ban]": "バン", // NEEDS QC
	"[2d]": "2日", // NEEDS QC
	"[Weekban]": "1週間バン", // NEEDS QC
	"[1w]": "1週間", // NEEDS QC
	"[Modlog]": "管理ログ", // NEEDS QC
	// TRANSLATORS: Showdown term for a global mute
	"[Lock]": "ロック", // NEEDS QC
	"[Weeklock]": "1週間ロック", // NEEDS QC
	"[Namelock]": "ネームロック", // NEEDS QC
	"[Global modlog]": "全体管理ログ", // NEEDS QC
	"[Avatar...]": "アバター...", // NEEDS QC
	"[Close room]": "ルームを閉じる", // NEEDS QC
	"[Report a user]": "ユーザーを通報", // NEEDS QC
	"({NUMBER} sec)": "（{NUMBER}秒）", // NEEDS QC
	"Room not found": "ルームが見つかりません", // NEEDS QC

	// TRANSLATORS: battle options
	"Side-by-side, controls below": "横並び・操作欄は下", // NEEDS QC
	"Side-by-side, overlay controls": "横並び・操作欄を重ねる", // NEEDS QC
	"Top-and-bottom, controls below": "縦並び・操作欄は下", // NEEDS QC
	"Top-and-bottom, overlay controls": "縦並び・操作欄を重ねる", // NEEDS QC
	"Scrolling, controls below": "スクロール・操作欄は下", // NEEDS QC
	"Scrolling, overlay controls": "スクロール・操作欄を重ねる", // NEEDS QC
	"Hardcore mode ON: Information not available in-game is now hidden.": "ハードコアモードON：ゲーム内で見られない情報を非表示にしました。", // NEEDS QC
	"Hardcore mode OFF: Information not available in-game is now shown.": "ハードコアモードOFF：ゲーム内で見られない情報を表示するようにしました。", // NEEDS QC
	"Spectators ignored.": "観戦者を無視しました。", // NEEDS QC
	"Spectators no longer ignored.": "観戦者の無視を解除しました。", // NEEDS QC
	"In this battle": "この対戦", // NEEDS QC
	"Hardcore mode (hide info not shown in-game)": "ハードコアモード（ゲーム内で見られない情報を隠す）", // NEEDS QC
	"Ignore spectators": "観戦者を無視", // NEEDS QC
	"Ignore opponent": "相手を無視", // NEEDS QC
	"Ignore nicknames": "ニックネームを無視", // NEEDS QC
	"All battles": "すべての対戦", // NEEDS QC
	"Layout": "レイアウト", // NEEDS QC
	"Automatic ({SETTING})": "自動（{SETTING}）", // NEEDS QC
	"Automatic": "自動", // NEEDS QC
	"(DESKTOP)": "（デスクトップ）", // NEEDS QC
	"(MOBILE VERTICAL)": "（モバイル縦向き）", // NEEDS QC
	"(MOBILE HORIZONTAL)": "（モバイル横向き）", // NEEDS QC
	"You can still invite spectators by giving them the URL or using the /invite command": "URLを教えるか/inviteコマンドを使えば観戦に招待できます", // NEEDS QC
	"Invite only (hide from Battles list)": "招待制（対戦リストに表示しない）", // NEEDS QC
	"Ignore Pokémon nicknames": "ポケモンのニックネームを無視", // NEEDS QC
	"Automatically start timer": "タイマーを自動で開始", // NEEDS QC
	"Hardcore mode": "ハードコアモード", // NEEDS QC
	"Start at turn 0 when spectating battles": "観戦時にターン0から再生", // NEEDS QC
	"Open new battles in the right-side panel": "新しい対戦を右パネルで開く", // NEEDS QC

	// TRANSLATORS: options
	"General": "全般", // NEEDS QC
	"Language": "言語", // NEEDS QC
	"Appearance": "外観", // NEEDS QC
	"Theme": "テーマ", // NEEDS QC
	"Light": "ライト", // NEEDS QC
	"Dark": "ダーク", // NEEDS QC
	"Match system theme": "システム設定に合わせる", // NEEDS QC
	"Two panels (if wide enough)": "2パネル（幅が足りる場合）", // NEEDS QC
	"Single panel": "1パネル", // NEEDS QC
	"Vertical tabs": "縦タブ", // NEEDS QC
	"Background": "背景", // NEEDS QC
	"Disable animations": "アニメーションを無効化", // NEEDS QC
	"Use 2D sprites instead of 3D models": "3Dモデルの代わりに2Dスプライトを使う", // NEEDS QC
	"Use modern sprites for past generations": "過去世代にも現代のスプライトを使う", // NEEDS QC
	"Block DMs": "DMをブロック", // NEEDS QC
	"Block challenges": "対戦の申し込みをブロック", // NEEDS QC
	"Show DMs in chatrooms": "チャットルームにDMを表示", // NEEDS QC
	"Do not highlight when your name is said in chat": "チャットで自分の名前が出てもハイライトしない", // NEEDS QC
	"Confirm before leaving a room": "ルームを離れる前に確認", // NEEDS QC
	"Confirm before refreshing": "更新する前に確認", // NEEDS QC
	"Always notify": "常に通知", // NEEDS QC
	"Notify when joined": "参加中のみ通知", // NEEDS QC
	"Hide": "非表示", // NEEDS QC
	"Timestamps": "タイムスタンプ", // NEEDS QC
	"Off": "オフ", // NEEDS QC
	"Timestamps in DMs": "DMのタイムスタンプ", // NEEDS QC
	"Chat preferences": "チャット設定", // NEEDS QC
	"[Change background]": "背景を変更", // NEEDS QC
	"[Text formatting...]": "文字装飾...", // NEEDS QC
	"[Set as background]": "背景に設定", // NEEDS QC
	"[Random]": "ランダム", // NEEDS QC

	// TRANSLATORS: team chooser
	"(uncategorized)": "（未分類）", // NEEDS QC
	"(all)": "（すべて）", // NEEDS QC
	"[Other gens]": "他の世代", // NEEDS QC
	"Select a team": "チームを選択", // NEEDS QC
	"This team selector is no longer available (the challenge was cancelled or something).": "このチーム選択画面は使えなくなりました（対戦の申し込みがキャンセルされたなどの理由で）。", // NEEDS QC
	"No teams found": "チームが見つかりません", // NEEDS QC
	"This format selector is no longer available.": "このフォーマット選択画面は使えなくなりました。", // NEEDS QC
	"Search formats": "フォーマットを検索", // NEEDS QC

	// TRANSLATORS: login
	"[Choose name]": "名前を決める", // NEEDS QC
	"Logging in...": "ログイン中...", // NEEDS QC
	"[Log in]": "ログイン", // NEEDS QC
	"[Try another name]": "別の名前にする", // NEEDS QC
	"[Password...]": "パスワード...", // NEEDS QC
	"[Change password]": "パスワードを変更", // NEEDS QC
	"[Show password]": "パスワードを表示", // NEEDS QC
	"Loading Google log-in button...": "Googleログインボタンを読み込み中...", // NEEDS QC
	"(color)": "（色）", // NEEDS QC
	"(Others will be able to see your name change. To change name privately, use \"Log out\")": "（名前の変更は他の人にも見えます。こっそり変更したい場合は「ログアウト」を使ってください）", // NEEDS QC
	"if you registered this name:": "この名前を登録している場合：", // NEEDS QC
	"if not:": "違う場合：", // NEEDS QC
	"This is someone else's account. Sorry.": "この名前は他の人のアカウントです。ごめんなさい。", // NEEDS QC
	"Password": "パスワード", // NEEDS QC

	// TRANSLATORS: register / change password
	"All fields are required": "すべての項目を入力してください", // NEEDS QC
	"Passwords do not match": "パスワードが一致しません", // NEEDS QC
	"Your password was successfully changed!": "パスワードを変更しました！", // NEEDS QC
	"Change your password:": "パスワードの変更：", // NEEDS QC
	"Old password": "現在のパスワード", // NEEDS QC
	"New password": "新しいパスワード", // NEEDS QC
	"New password (confirm)": "新しいパスワード（確認）", // NEEDS QC
	"You have been successfully registered.": "登録が完了しました。", // NEEDS QC
	"Register your account:": "アカウントの登録：", // NEEDS QC
	"Password (confirm)": "パスワード（確認）", // NEEDS QC
	"An Electric-type mouse that is the mascot of the Pokémon franchise.": "ポケモンシリーズのマスコットの、でんきタイプのねずみポケモン。", // NEEDS QC
	"What is this Pokémon?": "このポケモン、だーれだ？", // NEEDS QC

	// #endregion Popups

	// #region Main Menu
	// ==================================================================

	// TRANSLATORS: Our famous ladder queue button. Give it some flair :)
	// TRANSLATORS: Might we suggest "Showdown!"
	"[Battle!]": "バトル！", // NEEDS QC
	"Find a random opponent": "ランダムな相手を探す", // NEEDS QC
	"Watch a battle": "対戦を観戦", // NEEDS QC
	"Find a user": "ユーザー検索", // NEEDS QC
	"Info & Resources": "情報・リソース", // NEEDS QC
	"Lobby chat": "ロビーチャット", // NEEDS QC

	// TRANSLATORS: Challenge/Search UI
	"[Challenge]": "対戦申し込み", // NEEDS QC
	"Custom rules": "カスタムルール", // NEEDS QC
	// TRANSLATORS: Search countdown. {NUMBER} = a number of seconds
	// TRANSLATORS: English doesn't include the unit (seconds) but your language can
	"Searching in {NUMBER}...": "{NUMBER}秒後に対戦相手を探します...", // NEEDS QC
	"Searching...": "対戦相手を探しています...", // NEEDS QC
	"Pokédex": "ポケモン図鑑", // NEEDS QC
	"Replays": "リプレイ", // NEEDS QC
	"Forum": "フォーラム", // NEEDS QC
	"Rules": "ルール", // NEEDS QC
	"Credits": "クレジット", // NEEDS QC
	"Privacy": "プライバシー", // NEEDS QC
	"background by {ARTIST}": "背景：{ARTIST}", // NEEDS QC

	// TRANSLATORS: errors
	"Wait for this countdown to finish first...": "カウントダウンが終わるまで待ってください...", // NEEDS QC
	"You're already searching for a {FORMAT} battle...": "すでに{FORMAT}の対戦相手を探しています...", // NEEDS QC
	"You need to go into the Teambuilder and build a team for this format.": "チームビルダーでこのフォーマット用のチームを作ってください。", // NEEDS QC

	// #endregion Main Menu

	// #region Rooms
	// ==================================================================

	// TRANSLATORS: these go under the user/battle counts, and in English they read as "100 users online"
	// TRANSLATORS: but they don't have to work that way in your language
	"users online": "人オンライン", // NEEDS QC
	// label-style (no counter) to fit the box; "件の対戦が進行中" was too wide
	"active battles": "対戦進行中", // NEEDS QC
	"Find an online user": "オンラインのユーザーを探す", // NEEDS QC
	"Watch an active battle": "進行中のバトルを観戦する", // NEEDS QC
	"Meloetta is PS's mascot! The Aria forme is about using its voice, and represents our chatrooms.": "メロエッタはPSのマスコット！ボイスフォルムは歌声を使う姿で、チャットルームを象徴しています。", // NEEDS QC
	"Meloetta is PS's mascot! The Pirouette forme is Fighting-type, and represents our battles.": "メロエッタはPSのマスコット！ステップフォルムはかくとうタイプで、バトルを象徴しています。", // NEEDS QC

	"Official chat rooms": "公式チャットルーム", // NEEDS QC
	"Hidden rooms": "隠しルーム", // NEEDS QC

	"Subrooms": "サブルーム", // NEEDS QC
	"(All rooms)": "（すべてのルーム）", // NEEDS QC
	"Join or search for rooms": "ルームに参加・検索", // NEEDS QC
	"Command": "コマンド", // NEEDS QC
	"Console": "コンソール", // NEEDS QC
	"Enter = run command {INPUT}": "Enter = コマンド{INPUT}を実行", // NEEDS QC
	"(Subroom of {ROOM})": "（{ROOM}のサブルーム）", // NEEDS QC
	"Possible secret room": "秘密のルームの可能性", // NEEDS QC
	"(Private room?)": "（非公開ルーム？）", // NEEDS QC
	"Search results": "検索結果", // NEEDS QC

	// #endregion Rooms

	// #region Battle
	// ==================================================================

	// TRANSLATORS: Note that most translations of battle UI are in the server repository
	// TRANSLATORS: In data/text/[lang]/default.ts and data/text/[lang]/names.ts

	// TRANSLATORS: [Team]/[Battle]/[Switch]/[Shift] are buttons in overlay controls
	// TRANSLATORS: But they're section headers in normal battle controls
	// TRANSLATORS: For the "Use move" menu in battle controls
	// TRANSLATORS: This was "Attack" in older Showdown, "FIGHT" on older cart, and "Battle" on modern cart
	// SV battle menu: たたかう
	"[Battle]": "たたかう", // NEEDS QC
	// TRANSLATORS: For the "Switch" menu in battle controls
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Switch]": "交代", // NEEDS QC
	// TRANSLATORS: For the Team Preview menu in battle controls
	// TRANSLATORS: Also replaces "[Switch]" in phases where switching isn't possible
	// TRANSLATORS: This is "PKMN" on older cart, and "Pokémon" on modern cart
	"[Team]": "チーム", // NEEDS QC
	// TRANSLATORS: The Triples "move to center" button
	// TRANSLATORS: This is "SHIFT" on older cart; Triples doesn't exist on modern cart
	// ORAS battle menu (the last games with Triples): いどう
	"[Shift]": "いどう", // NEEDS QC

	// TRANSLATORS: Mobile-layout buttons for switching between the battle view and the chat view
	// TRANSLATORS: ("Chat" is also used as a section header in the options popup)
	"Battle": "対戦", // NEEDS QC
	"Chat": "チャット", // NEEDS QC
	"[Try Fight button]": "たたかうボタンを試す", // NEEDS QC
	// TRANSLATORS: For the "where to target this move" menu
	"(empty slot)": "（空きスロット）", // NEEDS QC
	"Maxed with no max moves": "使えるダイマックスわざがありません", // NEEDS QC
	"No Z moves": "Zワザがありません", // NEEDS QC

	"[Rematch]": "再戦", // NEEDS QC
	"[Offer tie]": "引き分けを提案", // NEEDS QC
	"[Forfeit]": "降参", // NEEDS QC
	"[Forfeit and close]": "降参して閉じる", // NEEDS QC
	"[Replace player]": "プレイヤーを交代", // NEEDS QC
	"[Replace]": "交代する", // NEEDS QC
	"(turn 100+)": "（100ターン以降）", // NEEDS QC
	"[Stop timer]": "タイマー停止", // NEEDS QC
	"[Start timer]": "タイマー開始", // NEEDS QC
	"Enter player's name": "プレイヤー名を入力してください", // NEEDS QC
	"Cannot replace player, battle has already ended.": "対戦はすでに終了しているため、プレイヤーを交代できません。", // NEEDS QC

	// TRANSLATORS: for replay controls
	"[Play]": "再生", // NEEDS QC
	"[Pause]": "一時停止", // NEEDS QC
	"[First turn]": "最初のターン", // NEEDS QC
	"[Prev turn]": "前のターン", // NEEDS QC
	"[Skip turn]": "次のターン", // NEEDS QC
	"[Skip to end]": "最後まで進む", // NEEDS QC
	"[Switch viewpoint]": "視点切り替え", // NEEDS QC
	"[Go to turn]": "ターン指定", // NEEDS QC
	"[Skip]": "スキップ", // NEEDS QC
	"[Skip animation]": "アニメーションをスキップ", // NEEDS QC
	"[Move to center]": "中央に移動", // NEEDS QC
	"[Upload and share replay]": "リプレイをアップロードして共有", // NEEDS QC
	"[Replay]": "リプレイ", // NEEDS QC
	"(closes this battle)": "（このバトルを閉じます）", // NEEDS QC

	// TRANSLATORS: for the battle list
	"Minimum Elo": "最低Elo", // NEEDS QC
	"rated {ELO}": "レート{ELO}", // NEEDS QC
	// TRANSLATORS: goes between two usernames; the key includes its surrounding spacing so some languages can drop it
	"{PLAYER1} vs. {PLAYER2}": "{PLAYER1} 対 {PLAYER2}", // NEEDS QC
	"(All formats)": "（すべてのフォーマット）", // NEEDS QC
	"Username prefix": "ユーザー名の先頭文字", // NEEDS QC
	"No battles are going on": "進行中のバトルはありません", // NEEDS QC
	"{NUMBER} battle": "{NUMBER}件のバトル", // NEEDS QC
	"{NUMBER} battles": "{NUMBER}件のバトル", // NEEDS QC
	"None": "なし", // NEEDS QC
	"Timer": "タイマー", // NEEDS QC
	"Error": "エラー", // NEEDS QC
	"The battle you're looking for has expired. Battles expire after 15 minutes of inactivity unless they're saved.": "お探しのバトルは期限切れです。バトルは保存されない限り、15分間動きがないと期限切れになります。", // NEEDS QC
	"In the future, remember to click \"Save replay\" to save a replay permanently.": "今後は「リプレイを保存」を押すと、リプレイを永久に保存できます。", // NEEDS QC
	"Unrecognized HTML file: Only replay files are supported.": "認識できないHTMLファイルです。リプレイファイルのみ対応しています。", // NEEDS QC
	"You are still in {ROOM}": "まだ{ROOM}に参加中です", // NEEDS QC
	"Battle \"{INPUT}\" not found": "バトル「{INPUT}」が見つかりません", // NEEDS QC
	"Uploaded replay": "アップロードされたリプレイ", // NEEDS QC
	"Team {PLAYER}": "チーム{PLAYER}", // NEEDS QC
	"{PLAYER} and friends": "{PLAYER}と仲間たち", // NEEDS QC

	// TRANSLATORS: battle log messages
	"[Earlier messages]": "前のメッセージ", // NEEDS QC
	"Register an account to protect your ladder rating!": "アカウントを登録してレートを守ろう！", // NEEDS QC
	"Open team sheet for {PLAYER}": "{PLAYER}のチームシートを開く", // NEEDS QC
	"Warning": "警告", // NEEDS QC
	"Variation": "バリエーション", // NEEDS QC
	"Rated battle": "レート対戦", // NEEDS QC

	// TRANSLATORS: screen reader labels
	"Active Pokémon": "場のポケモン", // NEEDS QC
	"Your team": "自分のチーム", // NEEDS QC
	"Opponent's team": "相手のチーム", // NEEDS QC
	"Statused": "状態異常あり", // NEEDS QC
	"Non-statused": "状態異常なし", // NEEDS QC
	"Unrevealed Illusion user": "正体不明のイリュージョン使用者", // NEEDS QC
	"Not revealed": "未公開", // NEEDS QC
	"Battle controls": "対戦操作", // NEEDS QC

	// #endregion Battle

	// #region Chat
	// ==================================================================

	"{NUMBER} user": "{NUMBER}人", // NEEDS QC
	"{NUMBER} users": "{NUMBER}人", // NEEDS QC
	"[Join]": "参加", // NEEDS QC
	"[Leave]": "退出", // NEEDS QC
	"[Ready!]": "準備OK！", // NEEDS QC
	"In progress": "進行中", // NEEDS QC
	"Signups": "受付中", // NEEDS QC
	"[Pop-out]": "別ウィンドウで表示", // NEEDS QC
	"[Go]": "移動", // NEEDS QC
	"[Visit]": "開く", // NEEDS QC
	"[Choose a name before sending messages]": "メッセージを送るには名前を決めてください", // NEEDS QC
	"Challenging...": "対戦を申し込み中...", // NEEDS QC
	"Accepting...": "承諾中...", // NEEDS QC
	"[Commands]": "コマンド", // NEEDS QC
	"Mentioned by {USER} in {ROOM}": "{ROOM}で{USER}にメンションされました", // NEEDS QC
	"{USERS} joined": "{USERS}が参加", // NEEDS QC
	// TRANSLATORS: separates "X joined" from "Y left"
	"{JOINEDMESSAGE}; {LEFTMESSAGE}": "{JOINEDMESSAGE}、{LEFTMESSAGE}", // NEEDS QC
	"{USERS} left": "{USERS}が退出", // NEEDS QC
	"{USER} renamed from {OLDUSER}.": "{OLDUSER}が{USER}に名前を変更しました。", // NEEDS QC
	"(Private to {USER})": "（{USER}にのみ表示）", // NEEDS QC
	"{FORMAT} battle started between {PLAYER1} and {PLAYER2}.": "{PLAYER1}と{PLAYER2}の{FORMAT}対戦が始まりました。", // NEEDS QC
	// TRANSLATORS: for when the format name already includes "battle"
	"{FORMAT} started between {PLAYER1} and {PLAYER2}.": "{PLAYER1}と{PLAYER2}の{FORMAT}が始まりました。", // NEEDS QC
	// TRANSLATORS: for when the format is unknown
	"Battle started between {PLAYER1} and {PLAYER2}.": "{PLAYER1}と{PLAYER2}の対戦が始まりました。", // NEEDS QC
	"({NUMBER} line from {USER} hidden)": "（{USER}の発言{NUMBER}行を非表示）", // NEEDS QC
	"({NUMBER} lines from {USER} hidden)": "（{USER}の発言{NUMBER}行を非表示）", // NEEDS QC
	"{USER} invited you to join the room \"{ROOM}\"": "{USER}がルーム「{ROOM}」に招待しました", // NEEDS QC
	"[Join {ROOM}]": "{ROOM}に参加", // NEEDS QC
	"Chat log": "チャットログ", // NEEDS QC

	// TRANSLATORS: tournaments
	"Please respond to the tournament within {SECONDS} seconds or you may be automatically disqualified.": "{SECONDS}秒以内に大会に応答しないと自動的に失格になる場合があります。", // NEEDS QC
	"Single Elimination": "シングルエリミネーション", // NEEDS QC
	"Double Elimination": "ダブルエリミネーション", // NEEDS QC
	"Round Robin": "総当たり", // NEEDS QC
	"Double Round Robin": "2回総当たり", // NEEDS QC
	"{JOINS} joined the tournament": "{JOINS}が大会に参加", // NEEDS QC
	"{LEAVES} left the tournament": "{LEAVES}が大会から離脱", // NEEDS QC
	// TRANSLATORS: sentence terminator for messages like the above
	"{SENTENCE}.": "{SENTENCE}。", // NEEDS QC
	"{FORMAT} {TYPE} tournament": "{FORMAT} {TYPE}大会", // NEEDS QC
	"No tournaments are currently running.": "現在開催中の大会はありません。", // NEEDS QC
	"(started)": "（開始済み）", // NEEDS QC
	"{TOURNAMENT} created.": "{TOURNAMENT}が作成されました。", // NEEDS QC
	"{TOURNAMENT} created (and hidden).": "{TOURNAMENT}が作成されました（非表示）。", // NEEDS QC
	"Tournament created": "大会が作成されました", // NEEDS QC
	// TRANSLATORS: label, as in "Room: lobby"
	"Room": "ルーム", // NEEDS QC
	"Type": "形式", // NEEDS QC
	"{USER} has joined the tournament, replacing {OLDUSER}.": "{USER}が{OLDUSER}に代わって大会に参加しました。", // NEEDS QC
	"({NUMBER} players)": "（{NUMBER}人）", // NEEDS QC
	"The tournament has started!": "大会が始まりました！", // NEEDS QC
	"{USER} has been disqualified from the tournament.": "{USER}は大会から失格になりました。", // NEEDS QC
	"The tournament's automatic disqualify timer has been turned off.": "大会の自動失格タイマーがオフになりました。", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minute.": "大会の自動失格タイマーが{NUMBER}分に設定されました。", // NEEDS QC
	"The tournament's automatic disqualify timer has been set to {NUMBER} minutes.": "大会の自動失格タイマーが{NUMBER}分に設定されました。", // NEEDS QC
	"Tournament automatic disqualification warning": "大会の自動失格警告", // NEEDS QC
	"Time": "時間", // NEEDS QC
	"{NUMBER} sec": "{NUMBER}秒", // NEEDS QC
	"The tournament's automatic start is now off.": "大会の自動開始がオフになりました。", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minute.": "大会は{NUMBER}分後に自動的に始まります。", // NEEDS QC
	"The tournament will automatically start in {NUMBER} minutes.": "大会は{NUMBER}分後に自動的に始まります。", // NEEDS QC
	"Scouting is now allowed (Tournament players can watch other tournament battles)": "スカウトが許可されました（大会参加者は他の大会の対戦を観戦できます）", // NEEDS QC
	"Scouting is now banned (Tournament players can't watch other tournament battles)": "スカウトが禁止されました（大会参加者は他の大会の対戦を観戦できません）", // NEEDS QC
	"Tournament challenges available": "大会で対戦を申し込めます", // NEEDS QC
	"Tournament challenge from {PLAYER}": "{PLAYER}から大会の対戦申し込み", // NEEDS QC
	"Tournament battle between {PLAYER1} and {PLAYER2} started.": "{PLAYER1}と{PLAYER2}の大会の対戦が始まりました。", // NEEDS QC
	"{PLAYER1} has won the match {SCORE} against {PLAYER2}": "{PLAYER1}が{PLAYER2}に{SCORE}で勝利", // NEEDS QC
	"{PLAYER1} has lost the match {SCORE} against {PLAYER2}": "{PLAYER1}が{PLAYER2}に{SCORE}で敗北", // NEEDS QC
	"{PLAYER1} has drawn the match {SCORE} against {PLAYER2}": "{PLAYER1}が{PLAYER2}と{SCORE}で引き分け", // NEEDS QC
	" but the tournament does not support drawing, so it did not count": "（ただしこの大会は引き分けに対応していないため、無効です）", // NEEDS QC
	"Congratulations to {WINNERS} for winning the {TOURNAMENT}!": "{TOURNAMENT}の優勝者は{WINNERS}です！おめでとうございます！", // NEEDS QC
	"Runners-up": "準優勝", // NEEDS QC
	"Runner-up": "準優勝", // NEEDS QC
	"The tournament was forcibly ended.": "大会は強制終了されました。", // NEEDS QC
	"The tournament has already started.": "大会はすでに始まっています。", // NEEDS QC
	"The tournament hasn't started yet.": "大会はまだ始まっていません。", // NEEDS QC
	"You are already in the tournament.": "すでに大会に参加しています。", // NEEDS QC
	"One of your alts is already in the tournament.": "あなたのサブアカウントがすでに大会に参加しています。", // NEEDS QC
	"You aren't in the tournament.": "大会に参加していません。", // NEEDS QC
	"This user isn't in the tournament.": "そのユーザーは大会に参加していません。", // NEEDS QC
	"There aren't enough users.": "ユーザー数が足りません。", // NEEDS QC
	"That isn't a valid timeout value.": "無効なタイマー設定です。", // NEEDS QC
	"That isn't a valid tournament matchup.": "無効な対戦の組み合わせです。", // NEEDS QC
	"You must have a name in order to join the tournament.": "大会に参加するには名前が必要です。", // NEEDS QC
	"The tournament is already at maximum capacity for users.": "大会はすでに定員に達しています。", // NEEDS QC
	"You have already been disqualified.": "すでに失格になっています。", // NEEDS QC
	"This user has already been disqualified.": "そのユーザーはすでに失格になっています。", // NEEDS QC
	"You are banned from entering tournaments.": "あなたは大会への参加を禁止されています。", // NEEDS QC
	"Unknown error: {ERROR}": "不明なエラー：{ERROR}", // NEEDS QC
	"Waiting for battles to become available...": "対戦できるようになるまでお待ちください...", // NEEDS QC
	"vs. {PLAYER}": "vs. {PLAYER}", // NEEDS QC
	"Or wait for {PLAYERS} to challenge you.": "または{PLAYERS}からの申し込みを待ってください。", // NEEDS QC
	"Waiting for {PLAYERS} to challenge you.": "{PLAYERS}からの申し込みを待っています。", // NEEDS QC
	"Waiting for {PLAYER}...": "{PLAYER}を待っています...", // NEEDS QC
	"Unavailable": "対戦不可", // NEEDS QC
	"Waiting": "待機中", // NEEDS QC
	"Challenging": "申し込み中", // NEEDS QC

	// TRANSLATORS: command errors
	"This player does not exist or is not online.": "そのプレイヤーは存在しないかオフラインです。", // NEEDS QC
	"This command can only be used in proper chat rooms.": "このコマンドはチャットルームでのみ使えます。", // NEEDS QC
	"Error: corrupted ranking data": "エラー：ランキングデータが破損しています", // NEEDS QC
	"You are not in a battle": "対戦中ではありません", // NEEDS QC
	"Invalid turn number: {NUMBER}": "無効なターン数：{NUMBER}", // NEEDS QC
	"Turn navigation is disabled in hardcore mode.": "ハードコアモードではターン移動は使えません。", // NEEDS QC
	"You are not a player in this battle": "この対戦のプレイヤーではありません", // NEEDS QC
	"Can only be used in a DM.": "DMでのみ使えます。", // NEEDS QC
	"Please wait 5 seconds before challenging again.": "再度対戦を申し込むには5秒待ってください。", // NEEDS QC

	// #endregion Chat

	// #region Teambuilder
	// ==================================================================

	// TRANSLATORS: This is for the Teams list view so it can't be singular
	// TRANSLATORS: Should be something like "Teams List" if you have no singular
	// TRANSLATORS: Can be different from TL.term.teams, which "Teams" as in "plural of Team"
	"Teams": "チーム一覧", // NEEDS QC
	"[New team]": "新規チーム", // NEEDS QC
	"[New team in folder]": "フォルダに新しいチーム", // NEEDS QC
	"[New {FORMAT} team]": "新しい{FORMAT}チーム", // NEEDS QC
	"[New box]": "新規ボックス", // NEEDS QC
	// TRANSLATORS: When deleting a folder, button to add folder name to all teams in it
	"[Convert to prefix]": "フォルダ名をチーム名の先頭に付ける", // NEEDS QC
	"[(add folder)]": "（フォルダを追加）", // NEEDS QC
	"[(add format folder)]": "（フォーマットフォルダを追加）", // NEEDS QC
	"Names can't contain slashes, since they're used as a folder separator.": "名前にスラッシュは使えません（フォルダの区切りに使われるため）。", // NEEDS QC
	"Names can't contain the character |, since they're used for storing teams.": "名前に「|」は使えません（チームの保存に使われるため）。", // NEEDS QC
	"New name required": "新しい名前を入力してください", // NEEDS QC
	"Not in a folder": "フォルダ内ではありません", // NEEDS QC
	"Teams not in any folders": "フォルダに入っていないチーム", // NEEDS QC
	"All teams": "すべてのチーム", // NEEDS QC
	"Folders": "フォルダ", // NEEDS QC

	// TRANSLATORS: for Clipboard actions
	"Copied!": "コピーしました！", // NEEDS QC
	"[Paste copy here]": "ここにコピーを貼り付け", // NEEDS QC
	"[Add to clipboard]": "クリップボードに追加", // NEEDS QC
	"[Copy/Move]": "コピー/移動", // NEEDS QC
	"[+ Clipboard]": "＋クリップボード", // NEEDS QC
	"[Deselect]": "選択解除", // NEEDS QC
	"[Move here]": "ここに移動", // NEEDS QC

	// TRANSLATORS: for Import/Export
	"[Backup]": "バックアップ", // NEEDS QC
	"[Backup search results]": "検索結果をバックアップ", // NEEDS QC
	"[Backup folder]": "フォルダをバックアップ", // NEEDS QC
	"Import/Export": "インポート/エクスポート", // NEEDS QC
	"[Import/Export]": "インポート/エクスポート", // NEEDS QC
	"[Import]": "インポート", // NEEDS QC
	"(can't save partial exports)": "（一部のみの表示は保存できません）", // NEEDS QC

	// TRANSLATORS: for uploaded teams
	"Account": "アカウント", // NEEDS QC
	"Account (public)": "アカウント（公開）", // NEEDS QC
	"Local": "この端末", // NEEDS QC
	"Uploaded": "アップロード済み", // NEEDS QC
	"[Upload for shareable URL]": "アップロードして共有URLを作成", // NEEDS QC
	"[Upload for shareable/searchable URL]": "アップロードして共有・検索可能URLを作成", // NEEDS QC
	"Disconnected (wrong account?)": "切断されました（アカウント違い？）", // NEEDS QC
	"[Revert to uploaded version]": "アップロード版に戻す", // NEEDS QC
	"[Compare]": "比較", // NEEDS QC
	"[Upload changes]": "変更をアップロード", // NEEDS QC
	"Team was deleted": "チームは削除されました", // NEEDS QC
	"Team doesn't exist": "チームが存在しません", // NEEDS QC
	"Untitled team": "無題のチーム", // NEEDS QC
	"Uploaded by": "アップロード者", // NEEDS QC
	"Views": "閲覧数", // NEEDS QC
	"Team deleted": "チームは削除されました", // NEEDS QC
	"Not found": "見つかりません", // NEEDS QC

	// TRANSLATORS: for the team editor
	"[Add Pokémon]": "ポケモンを追加", // NEEDS QC
	"(choose ability)": null, // NEEDS TRANSLATION
	"Details": "詳細", // NEEDS QC
	// TRANSLATORS: Teambuilder "form" with text boxes inside, not form/forme "form" of a pokemon
	"Form": "フォーム", // NEEDS QC
	"Tera": "テラス", // NEEDS QC
	// TRANSLATORS: These two are for Hidden Power type
	// TRANSLATORS: They're both designed to take up very little width, so keep that in mind
	"H.P.": "めざパ", // NEEDS QC
	"H. Power": "めざパ", // NEEDS QC
	"Defensive coverage": "防御相性", // NEEDS QC
	"Teambuilding resources for {FORMAT}": "{FORMAT}のチーム構築リソース", // NEEDS QC
	"[See all]": "すべて見る", // NEEDS QC
	"Search species or filter by type, learnable moves, ability, tier, or egg group": "ポケモンを検索（タイプ・覚える技・特性・ティア・タマゴグループで絞り込み可）", // NEEDS QC
	"Search abilities": "特性を検索", // NEEDS QC
	"Search items": "どうぐを検索", // NEEDS QC
	"Search moves or filter by type or category": "技を検索（タイプ・分類で絞り込み可）", // NEEDS QC
	"Sample sets": "サンプル型", // NEEDS QC
	"Box sets": "ボックスの型", // NEEDS QC
	"Guessed spread": "推定努力値配分", // NEEDS QC
	"(Please choose 4 moves to get a guessed spread)": "（技を4つ選ぶと努力値配分を推定します）", // NEEDS QC
	"Protip": "ヒント", // NEEDS QC
	"Use a different nature to save {NUMBER} EVs:": "性格を変えると努力値を{NUMBER}節約できます：", // NEEDS QC
	"Use a different nature to get higher stats:": "性格を変えると能力値が上がります：", // NEEDS QC
	"Natures cannot raise or lower HP.": "性格でHPは上下しません。", // NEEDS QC
	// TRANSLATORS: {STATCHANGES} is +stat/-stat
	"{STATCHANGES} nature": "{STATCHANGES}の性格", // NEEDS QC
	// TRANSLATORS: {1} and {2} are the + and - keyboard keys
	"You can also set natures by typing {1} and {2} in the EV box.": "EV欄に{1}や{2}を入力しても性格を設定できます。", // NEEDS QC
	"Pasted team": "貼り付けたチーム", // NEEDS QC
	"Zoom out forms": "フォームを縮小表示", // NEEDS QC
	"Compact": "コンパクト", // NEEDS QC
	"Comfortable": "ゆったり", // NEEDS QC
	"Zoom out search results": "検索結果を縮小表示", // NEEDS QC
	"Fetching Paste...": "Pasteを取得中...", // NEEDS QC
	"Import/Export set": "型のインポート/エクスポート", // NEEDS QC
	"IV spreads": "個体値の組み合わせ", // NEEDS QC
	"min Atk": "こうげき最小", // NEEDS QC
	"min Atk, min Spe": "こうげき・すばやさ最小", // NEEDS QC
	"max all": "すべて最大", // NEEDS QC
	"min Spe": "すばやさ最小", // NEEDS QC
	"Hidden Power {TYPE} IVs": "めざめるパワー{TYPE}の個体値", // NEEDS QC
	"EVs, IVs, and nature": "努力値・個体値・性格", // NEEDS QC
	"Base": "種族値", // NEEDS QC
	"Remaining": "残り", // NEEDS QC

	// TRANSLATORS: errors
	"You must select a format first.": "先にフォーマットを選んでください。", // NEEDS QC
	"This team is for a different account. Please log into the correct account to update it.": "このチームは別のアカウントのものです。更新するには正しいアカウントでログインしてください。", // NEEDS QC
	"Add a Pokémon to your team before uploading it.": "アップロードする前にチームにポケモンを追加してください。", // NEEDS QC
	"Must use on an uploaded team.": "アップロード済みのチームにのみ使えます。", // NEEDS QC
	"Team not found: {INPUT}": "チームが見つかりません：{INPUT}", // NEEDS QC
	"Your file \"{FILENAME}\" is not a valid team.": "ファイル「{FILENAME}」は有効なチームではありません。", // NEEDS QC

	// #endregion Teambuilder

	// #region Ladder
	// ==================================================================

	"[All formats]": "すべてのフォーマット", // NEEDS QC
	"[How the ladder works]": "レートの仕組み", // NEEDS QC
	"[Seasonal rankings]": "シーズンランキング", // NEEDS QC
	"[Look up a specific user's rating]": "特定のユーザーのレートを調べる", // NEEDS QC
	"Name": "名前", // NEEDS QC
	"Elo rating": "Eloレート", // NEEDS QC
	"user's percentage chance of winning a random battle (Glicko X-Act Estimate)": "ランダムバトルで勝つ確率の推定値（Glicko X-Act推定）", // NEEDS QC
	"Glicko-1 rating system: rating±deviation (provisional if deviation>100)": "Glicko-1レートシステム：レート±偏差（偏差>100は暫定）", // NEEDS QC
	"No one has played any ranked games yet.": "まだ誰もランク戦をプレイしていません。", // NEEDS QC

	// #endregion Ladder

	// #region Misc rooms
	// ==================================================================

	"[Join the Help room for live help]": "ヘルプルームで相談する", // NEEDS QC
	"Unrecognized command: {INPUT}": "認識できないコマンド：{INPUT}", // NEEDS QC

	// #endregion Misc rooms
};
