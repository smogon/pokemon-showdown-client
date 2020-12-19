/* 
optional data:
customTiers - these are auto-detected by the script, but you can set them here to ensure they show up in the right order
excludeStandardTiers - set to true if you want only your custom tiers to show up for the format
*/
const ModConfig = {
	ClientMods: {
		'cleanslate': {
			'excludeStandardTiers': true,
		},
		'cleanslatemicro': {
			'excludeStandardTiers': true,
		},
		'cleanslate2': {
			'excludeStandardTiers': true,
		},
		'csts': {
			'customTiers': ['CS1', 'CSM', 'CS2'],
			'excludeStandardTiers': true,
		},
		'roulettemons': {
			'excludeStandardTiers': true,
		},
		'sylvemonstest': true,
		'ccapm2020': true,
		'optimons': true,
		'megamax': true,
		'm4av6': true,
		'perfectgalar': true,
		'dlcmons': true,
		'fealpha': true,
		'viabilities': true,
		'breedingvariants': true,
		'abnormal': true,
		'crossoverchaos': true,
		'pkmnyb': true,
		'twisted': true,
		'roseredirisblue': true,
	}
};
exports.ModConfig = ModConfig;