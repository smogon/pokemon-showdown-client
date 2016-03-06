'use strict';

const baseRules = Object.assign({}, require('./../.eslintrc.js').rules);

module.exports = {
	"root": true,
	"env": {
		"node": true,
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
		"no-use-before-define": [2, "nofunc"],
		"arrow-parens": [2, "as-needed"],
		"arrow-spacing": [2, {"before": true, "after": true}],
		"new-cap": [2, {"newIsCap": true, "capIsNew": false}],
		"no-var": 2,
		"padded-blocks": [2, "never"],
	}),
	"ecmaFeatures": {
		"arrowFunctions": true,
		"blockBindings": true,
		"classes": true,
		"forOf": true,
		"octalLiterals": true,
		"spread": true,
	},
};
