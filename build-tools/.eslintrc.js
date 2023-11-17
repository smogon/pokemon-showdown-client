'use strict';

const baseRules = Object.assign({}, require('./../.eslintrc.js').rules);

module.exports = {
	"root": true,
	"parserOptions": {
		"ecmaVersion": 6,
		"sourceType": "script",
		"ecmaFeatures": {
			"globalReturn": true
		}
	},
	"env": {
		"es6": true,
		"node": true
	},
	"rules": Object.assign(baseRules, {
		"comma-dangle": [2, "always-multiline"],
		"eqeqeq": 2,
		"no-floating-decimal": 2,
		"no-new": 2,
		"no-redeclare": 2,
		"radix": [1, "as-needed"],
		"strict": [2, "global"],
		"no-unused-vars": [1, {"args": "none"}],
		"no-use-before-define": [2, {"functions": false, "classes": false}],
		"new-cap": [2, {"newIsCap": true, "capIsNew": false}],
		"padded-blocks": [2, "never"],

		"arrow-parens": [2, "as-needed"],
		"arrow-spacing": [2, {"before": true, "after": true}],
		"constructor-super": 2,
		"no-class-assign": 2,
		"no-confusing-arrow": 0,
		"no-const-assign": 2,
		"no-dupe-class-members": 2,
		"no-restricted-syntax": "off",
		"no-this-before-super": 2,
		"no-var": 2,
		"require-yield": 2,
		"template-curly-spacing": [2, "never"],
	}),
};
