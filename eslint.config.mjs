// @ts-check

import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

/** @typedef {import('typescript-eslint').Config} ConfigFile */
/** @typedef {Awaited<ConfigFile>[0]} Config */

/** @type {NonNullable<Config['rules']>} */
export const defaultRules = {
	...stylistic.configs.customize({
		braceStyle: '1tbs',
		indent: 'tab',
		semi: true,
		jsx: true,
		// ...
	}).rules,

	// TODO rules to revisit
	// =====================

	// we're used to spacing blocks but not TS object types, which is no longer supported
	// we'll probably just space all curlies since that's Prettier standard anyway
	"@stylistic/block-spacing": "off",
	// "@stylistic/object-curly-spacing": ["error", 'always'],
	// nice to have but we mostly know && || precedence so not urgent to fix
	"@stylistic/no-mixed-operators": "off",
	// we should do this someday but it'd have to be a gradual manual process
	"@typescript-eslint/explicit-module-boundary-types": "off",
	// like above but slightly harder, so do that one first
	"@typescript-eslint/explicit-function-return-type": "off",
	// probably we should settle on a standard someday
	"@typescript-eslint/member-ordering": "off",
	// "@typescript-eslint/no-extraneous-class": "error",
	// "@typescript-eslint/no-type-alias": "error",
	"@typescript-eslint/prefer-optional-chain": "off",
	"@typescript-eslint/consistent-type-imports": "error", // TODO after no-duplicate-imports fix
	// maybe we should consider this
	"@typescript-eslint/consistent-indexed-object-style": "off",

	// test only (should never be committed, but useful when testing)
	// ==============================================================
	// do we want unused args/destructures to start with _? unsure
	"@typescript-eslint/no-unused-vars": ["warn", {
		args: "all",
		argsIgnorePattern: ".",
		caughtErrors: "all",
		destructuredArrayIgnorePattern: ".",
		ignoreRestSiblings: true
	}],
	// "@typescript-eslint/no-unused-vars": ["warn", {
	// 	args: "all",
	// 	argsIgnorePattern: "^_",
	// 	caughtErrors: "all",
	// 	destructuredArrayIgnorePattern: "^_",
	// 	ignoreRestSiblings: true
	// }],
	"max-len": ["warn", {
		"code": 120, "tabWidth": 0,
		// see bottom of file for source
		"ignorePattern": "^\\s*(?:\\/\\/ \\s*)?(?:(?:export )?(?:let |const |readonly )?[a-zA-Z0-9_$.]+(?: \\+?=>? )|[a-zA-Z0-9$]+: \\[?|(?:return |throw )?(?:new )?(?:[a-zA-Z0-9$.]+\\()?)?(?:Utils\\.html|(?:this\\.)?(?:room\\.)?tr|\\$\\()?['\"`/]"
	}],
	"prefer-const": ["warn", {"destructuring": "all"}],

	// PS code (code specific to PS)
	// =============================
	"@typescript-eslint/no-namespace": "off",
	"@typescript-eslint/unbound-method": "off", // used for sim event handlers, command handlers, etc
	"@stylistic/new-parens": "off", // used for the `new class {...}` pattern
	"no-prototype-builtins": "off",
	"no-shadow": "off",
	"@typescript-eslint/no-shadow": "error",
	"@typescript-eslint/no-var-requires": "off",

	// typescript-eslint defaults too strict
	// =====================================
	"@typescript-eslint/ban-ts-comment": "off",
	"@typescript-eslint/no-empty-function": "off",
	"@typescript-eslint/no-explicit-any": "off",
	"@typescript-eslint/no-non-null-assertion": "off",
	"@typescript-eslint/no-use-before-define": "off",
	"@typescript-eslint/no-unsafe-argument": "off",
	"no-empty": ["error", {"allowEmptyCatch": true}],
	"no-case-declarations": "off",

	// probably bugs
	// =============
	"@typescript-eslint/no-restricted-types": ["error", {
		types: {
			"symbol": "Can't compile to ES3, annoying to serialize, just use strings",
			"Symbol": "Can't compile to ES3, annoying to serialize, just use strings",
		},
	}],
	"no-implied-eval": "error",
	"@typescript-eslint/no-dupe-class-members": "error",
	"@typescript-eslint/no-empty-interface": "error",
	"@typescript-eslint/no-extra-non-null-assertion": "error",
	"@typescript-eslint/no-misused-new": "error",
	"@typescript-eslint/no-non-null-asserted-optional-chain": "error",
	"no-dupe-class-members": "off",
	"no-unused-expressions": "off", // ternary is used to convert callbacks to Promises
	"@typescript-eslint/no-unused-expressions": ["error", {"allowTernary": true}], // ternary is used to convert callbacks to Promises

	// yes-types
	// =========
	// "@typescript-eslint/restrict-template-expressions": "off",
	"@typescript-eslint/prefer-includes": "error",

	// we use `any`
	// ============
	"@typescript-eslint/no-unsafe-assignment": "off",
	"@typescript-eslint/no-unsafe-call": "off",
	"@typescript-eslint/no-unsafe-member-access": "off",
	"@typescript-eslint/no-unsafe-return": "off",

	// naming style
	// ============
	"@typescript-eslint/naming-convention": ["error", {
		"selector": ["class", "interface", "typeAlias"],
		"format": ["PascalCase"]
	}],

	// syntax style (local syntactical, usually autofixable formatting decisions)
	// ===========================================================================
	"@typescript-eslint/adjacent-overload-signatures": "error",
	"@typescript-eslint/array-type": "error",
	"@typescript-eslint/consistent-type-assertions": ["error", {"assertionStyle": "as"}],
	"@typescript-eslint/consistent-type-definitions": "off",
	"@typescript-eslint/explicit-member-accessibility": ["error", {"accessibility": "no-public"}],
	"@stylistic/member-delimiter-style": ["error", {
		multiline: {delimiter: "comma", requireLast: true},
		singleline: {delimiter: "comma", requireLast: false},
		overrides: {interface: {
			multiline: {delimiter: "semi", requireLast: true},
			singleline: {delimiter: "semi", requireLast: false},
		}},
	}],
	"@typescript-eslint/parameter-properties": "error",
	// `source` and `target` are frequently used as variables that may point to `this`
	// or to another `Pokemon` object, depending on how the given method is invoked
	"@typescript-eslint/no-this-alias": ["error", {"allowedNames": ["source", "target"]}],
	"@typescript-eslint/prefer-as-const": "error",
	"@typescript-eslint/prefer-for-of": "error",
	"@typescript-eslint/prefer-function-type": "error",
	// TODO: move to yes-types
	"@typescript-eslint/prefer-namespace-keyword": "error",
	"prefer-object-spread": "error",
	"@typescript-eslint/triple-slash-reference": "error",
	"@typescript-eslint/unified-signatures": "error",

	// syntax style, overriding base
	// =============================
	"@stylistic/quotes": "off",
	"@stylistic/quote-props": "off",
	"@stylistic/function-call-spacing": "error",
	"@stylistic/arrow-parens": ["error", "as-needed"],
	"@stylistic/comma-dangle": ["error", {
		"arrays": "always-multiline",
		"objects": "always-multiline",
		"imports": "always-multiline",
		"exports": "always-multiline",
		"functions": "never",
		"importAttributes": "always-multiline",
		"dynamicImports": "always-multiline",
		"enums": "always-multiline",
		"generics": "always-multiline",
		"tuples": "always-multiline",
	}],

	// yes-types syntax style, overriding base
	// =======================================
	"@typescript-eslint/prefer-nullish-coalescing": "off",
	"@typescript-eslint/dot-notation": "off",
	"@typescript-eslint/no-confusing-non-null-assertion": "off",

	// whitespace
	// ==========
	"@stylistic/operator-linebreak": ["error", "after"],
	"@stylistic/max-statements-per-line": ["error", { max: 3, ignoredNodes: ['BreakStatement'] }],
	"@stylistic/lines-between-class-members": "off",
	"@stylistic/multiline-ternary": "off",
	"@stylistic/object-curly-spacing": "error",
	"@stylistic/indent": ["error", "tab", {"flatTernaryExpressions": true}],	
};

export default tseslint.config([
	{
		ignores: [
			'caches/**',
			'play.pokemonshowdown.com/config/config-test.js',
			'play.pokemonshowdown.com/src/battle-log-misc.js',
		],
	},
	{
		plugins: {
      '@stylistic': stylistic
    },
	},
	{
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
		],
		extends: [
			eslint.configs.recommended,
		],
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
				"BattleOtherAnims": false,  "BattlePokedex": false,"BattlePokemonSprites": false, "BattlePokemonSpritesBW": false, "BattleSearchCountIndex": false, "BattleSearchIndex": false, "BattleArticleTitles": false,
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
				"POKEMON_SHOWDOWN_TESTCLIENT_KEY": false
			},
		},
		rules: {
			"no-cond-assign": ["error", "except-parens"],
			"no-console": "off",
			"no-constant-condition": "off",
			"no-control-regex": "off",
			"no-empty": ["error", {"allowEmptyCatch": true}],
			"no-inner-declarations": ["error", "functions"],
			"no-redeclare": "off",
			"valid-jsdoc": "off",

			// TODO: actually fix useless escapes
			"no-useless-escape": "off",

			"array-callback-return": "error",
			"complexity": "off",
			"consistent-return": "off",
			"default-case": "off",
			"dot-location": ["error", "property"],
			"dot-notation": "off",
			"eqeqeq": "off",
			"guard-for-in": "off",
			"no-caller": "error",
			"no-case-declarations": "off",
			"no-div-regex": "error",
			"no-else-return": "off",
			"no-labels": ["error", {"allowLoop": true, "allowSwitch": true}],
			"no-eval": "off",
			"no-implied-eval": "error",
			"no-extend-native": "error",
			"no-extra-bind": "warn",
			"no-extra-label": "error",
			"no-extra-parens": "off",
			"no-implicit-coercion": "off",
			"no-invalid-this": "off",
			"no-iterator": "error",
			"no-lone-blocks": "off",
			"no-loop-func": "off",
			"no-magic-numbers": "off",
			"no-multi-spaces": "warn",
			"no-multi-str": "error",
			"no-new-func": "error",
			"no-new-wrappers": "error",
			"no-octal-escape": "error",
			"no-param-reassign": "off",
			"no-proto": "error",
			"no-prototype-builtins": "error",
			"no-return-assign": ["error", "except-parens"],
			"no-self-compare": "error",
			"no-sequences": "error",
			"no-throw-literal": "error",
			"no-unmodified-loop-condition": "error",
			"no-unused-expressions": "error",
			"no-useless-call": "error",
			"no-useless-concat": "off",
			"no-void": "off",
			"no-warning-comments": "off",
			"no-with": "error",
			"radix": ["error", "always"],
			"vars-on-top": "off",
			"wrap-iife": ["error", "inside"],
			"yoda": "off",
	
			"init-declarations": "off",
			"no-catch-shadow": "off",
			"no-label-var": "error",
			"no-restricted-globals": ["error", "Proxy", "Reflect", "Symbol", "WeakSet"],
			"no-shadow-restricted-names": "error",
			"no-shadow": "off",
			"no-undef-init": "off",
			"no-undef": ["error", {"typeof": true}],
			"no-undefined": "off",
			"no-unused-vars": "off",
	
			"no-mixed-requires": "error",
			"no-new-require": "error",
			"no-path-concat": "off",
			"no-process-env": "off",
			"no-process-exit": "off",
			"no-restricted-modules": ["error", "moment", "request", "sugar"],
			"no-sync": "off",
	
			"array-bracket-spacing": ["error", "never"],
			"block-spacing": "off",
			"brace-style": ["error", "1tbs", {"allowSingleLine": true}],
			"camelcase": "off",
			"comma-spacing": ["error", {"before": false, "after": true}],
			"comma-style": ["error", "last"],
			"computed-property-spacing": ["error", "never"],
			"consistent-this": "off",
			"func-names": "off",
			"func-style": "off",
			"id-length": "off",
			"id-match": "off",
			"indent": ["error", "tab"],
			"key-spacing": "off",
			"lines-around-comment": "off",
			"max-nested-callbacks": "off",
			"max-statements-per-line": "off",
			"new-parens": "error",
			"newline-after-var": "off",
			"newline-before-return": "off",
			"no-array-constructor": "error",
			"no-continue": "off",
			"no-inline-comments": "off",
			"no-lonely-if": "off",
			"no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
			"no-multiple-empty-lines": ["error", {"max": 2, "maxEOF": 1}],
			"no-negated-condition": "off",
			"no-nested-ternary": "off",
			"no-new-object": "error",
			"no-spaced-func": "error",
			"no-ternary": "off",
			"no-trailing-spaces": ["error", {"ignoreComments": false}],
			"no-underscore-dangle": "off",
			"no-unneeded-ternary": "error",
			"object-curly-spacing": ["error", "never"],
			"one-var": "off",
			"operator-assignment": "off",
			"operator-linebreak": ["error", "after"],
			"quote-props": "off",
			"quotes": "off",
			"require-jsdoc": "off",
			"semi-spacing": ["error", {"before": false, "after": true}],
			"semi": ["error", "always"],
			"sort-vars": "off",
			"keyword-spacing": ["error", {"before": true, "after": true}],
			"space-before-blocks": ["error", "always"],
			"space-before-function-paren": ["error", {"anonymous": "always", "named": "never"}],
			"space-in-parens": ["error", "never"],
			"space-infix-ops": "error",
			"space-unary-ops": ["error", {"words": true, "nonwords": false}],
			"wrap-regex": "off",

			"arrow-parens": ["error", "as-needed"],
			"arrow-spacing": ["error", {"before": true, "after": true}],
			"no-confusing-arrow": "off",
			"no-useless-computed-key": "error",
			"no-useless-rename": "error",
			"prefer-arrow-callback": "off",
			"rest-spread-spacing": ["error", "never"],
			"template-curly-spacing": ["error", "never"],
			"no-restricted-syntax": ["error", "TaggedTemplateExpression", "ObjectPattern", "ArrayPattern"],
		},
	},
	{
		files: ['play.pokemonshowdown.com/src/*.ts'],
		extends: [
			eslint.configs.recommended,
			tseslint.configs.recommended,
			tseslint.configs.stylisticTypeChecked,
		],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			...defaultRules,
			// doesn't compile well to ES3
			"no-restricted-syntax": ["error", "TaggedTemplateExpression", "YieldExpression", "AwaitExpression", "BigIntLiteral"],
			// temporary
			"prefer-const": "off",
		},
	},
]);
