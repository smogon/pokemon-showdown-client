// @ts-check

import { configs, configure, globals } from './eslint-ps-standard.mjs';

export default configure([
	{
		ignores: [
			'.dist',
		],
	},
	{
		name: "JavaScript",
		files: [
			'*.mjs', // look mom I'm linting myself!
			'**/*.js',
		],
		extends: [configs.js],
		languageOptions: {
			globals: {
				...globals.builtin,
				...globals.node,
				...globals.mocha,
			},
		},
	},
	{
		name: "TypeScript",
		files: [
			"**/*.ts",
		],
		extends: [configs.ts],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"@typescript-eslint/no-require-imports": "off",
			// used for documentation
			"@typescript-eslint/no-redundant-type-constituents": "off",
		},
	},
	{
		name: "TypeScript tests",
		files: [
			"**/*.test.ts",
		],
		rules: {
			"@typescript-eslint/restrict-template-expressions": "off",
		},
	},
]);
