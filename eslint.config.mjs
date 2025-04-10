// @ts-check

import { configs, configure, globals } from './eslint-ps-standard.mjs';

export default configure([
	{
		ignores: [
			'caches/**',
			'play.pokemonshowdown.com/config/config-test.js',
			'play.pokemonshowdown.com/src/battle-log-misc.js',
			'play.pokemonshowdown.com/js/replay-embed.js',
		],
	},
	{
		name: "JavaScript for browsers (ES3)",
		files: [
			'play.pokemonshowdown.com/js/client-battle.js',
			'play.pokemonshowdown.com/js/client-chat-tournament.js',
			'play.pokemonshowdown.com/js/client-chat.js',
			'play.pokemonshowdown.com/js/client-ladder.js',
			'play.pokemonshowdown.com/js/client-mainmenu.js',
			'play.pokemonshowdown.com/js/client-rooms.js',
			'play.pokemonshowdown.com/js/client-teambuilder.js',
			'play.pokemonshowdown.com/js/client-topbar.js',
			'play.pokemonshowdown.com/js/client.js',
			'play.pokemonshowdown.com/js/replay-embed.template.js',
			'play.pokemonshowdown.com/js/search.js',
			'play.pokemonshowdown.com/js/storage.js',
			'config/config-example.js',
		],
		extends: [configs.es3],
		languageOptions: {
			ecmaVersion: 3,
			sourceType: "script",
			globals: {
				...globals.builtin,
				...globals.browser,
				...globals.node,
				// Libraries
				"_": false, "$": false, "Backbone": false, "d3": false, "html": false, "html4": false, "jQuery": false, "SockJS": false, "ColorThief": false,

				// Environment-specific
				"fs": false, "gui": false, "ga": false, "macgap": false, "nwWindow": false, "webkitNotifications": false, "nw": false,

				// Battle stuff
				"Battle": true, "Pokemon": true, "BattleSound": true, "BattleTooltips": true, "BattleLog": true,
				"BattleAbilities": false, "BattleAliases": false, "BattleBackdrops": false, "BattleBackdropsFive": false, "BattleBackdropsFour": false, "BattleBackdropsThree": false, "BattleEffects": false,
				"BattleFormats": false, "BattleFormatsData": false, "BattleLearnsets": false, "BattleItems": false, "BattleMoveAnims": false, "BattleMovedex": false, "BattleNatures": false,
				"BattleOtherAnims": false, "BattlePokedex": false, "BattlePokemonSprites": false, "BattlePokemonSpritesBW": false, "BattleSearchCountIndex": false, "BattleSearchIndex": false, "BattleArticleTitles": false,
				"BattleSearchIndexOffset": false, "BattleSearchIndexType": false, "BattleStatIDs": false, "BattleStatNames": false, "BattleStatusAnims": false, "BattleStatuses": false, "BattleTeambuilderTable": false,
				"ModifiableValue": false, "BattleStatGuesser": false, "BattleStatOptimizer": false, "BattleText": true, "BattleTextAFD": false, "BattleTextNotAFD": false,
				"BattleTextParser": false,

				// Generic global variables
				"Config": false, "BattleSearch": false, "Storage": false, "Dex": false, "DexSearch": false,
				"app": false, "toID": false, "toRoomid": false, "toUserid": false, "toName": false, "PSUtils": false, "MD5": false,
				"ChatHistory": false, "Topbar": false, "UserList": false,

				// Rooms
				"Room": false, "BattleRoom": false, "ChatRoom": false, "ConsoleRoom": false, "HTMLRoom": false, "LadderRoom": false, "MainMenuRoom": false, "RoomsRoom": false, "BattlesRoom": false, "TeambuilderRoom": false,

				// Tons of popups
				"Popup": false, "ForfeitPopup": false, "BracketPopup": false, "LoginPasswordPopup": false, "UserPopup": false, "UserOptionsPopup": false, "UserOptions": false, "TeamPopup": false,
				"AvatarsPopup": false, "CreditsPopup": false, "FormatPopup": false, "FormattingPopup": false, "LoginPopup": false,
				"MovePopup": false, "SoundsPopup": false, "OptionsPopup": false, "PromptPopup": false, "ProxyPopup": false, "ReconnectPopup": false,
				"RegisterPopup": false, "ReplayUploadedPopup": false, "RulesPopup": false, "TabListPopup": false, "TournamentBox": false,
				"CustomBackgroundPopup": false,

				// Test client
				"POKEMON_SHOWDOWN_TESTCLIENT_KEY": false,
			},
		},
		rules: {
			"@stylistic/max-len": "off",
			// we use these for the big IIFEs that wrap entire files
			"@stylistic/padded-blocks": "off",
			// TODO: actually fix useless escapes
			"no-useless-escape": "off",
			"no-shadow-restricted-names": "error",
			"no-shadow": "off",
		},
	},
	{
		name: "JavaScript for Node",
		files: [
			'*.mjs', // look mom I'm linting myself!
			'build-tools/*.js',
			'build-tools/update',
			'build-tools/build-*',
		],
		extends: [configs.js],
		languageOptions: {
			globals: {
				...globals.builtin,
				...globals.node,
			},
		},
		rules: {
		},
	},
	{
		name: "TypeScript",
		files: [
			'play.pokemonshowdown.com/src/*.ts',
			'play.pokemonshowdown.com/src/*.tsx',
			'replay.pokemonshowdown.com/src/*.ts',
			'replay.pokemonshowdown.com/src/*.tsx',
			'teams.pokemonshowdown.com/src/*.ts',
			'teams.pokemonshowdown.com/src/*.tsx',
		],
		extends: [configs.es3ts],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			// temporary
			"prefer-const": "off",
			// we use these for grouping
			"@stylistic/padded-blocks": "off",
			// too many of these on client
			"@typescript-eslint/no-floating-promises": "off",
			// we use these for animations
			"@typescript-eslint/unbound-method": "off",
			"@typescript-eslint/restrict-template-expressions": ["error", {
				allow: [
					{ name: ['Error', 'URL', 'URLSearchParams'], from: 'lib' },
					{ name: ['ModifiableValue'], from: 'file' },
				],
				allowBoolean: false, allowNever: false, allowNullish: false, allowRegExp: false,
			}],
		},
	},
]);
