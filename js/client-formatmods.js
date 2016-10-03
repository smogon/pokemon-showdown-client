(function (exports, $) {

	var FormatMods = exports.FormatMods = ({
		tiershift: function tierShiftMod() {
			var mod = {};

			var keys = Object.keys(BattlePokedex);

			for (var i = 0, key, poke; i < keys.length;) {
				key = keys[i++];
				poke = $.extend(true, {}, BattlePokedex[key]);

				switch (poke.tier) {

				case "UU":
				case "BL2": FormatMods._IncreaseStats(poke, 5); break;

				case "RU":
				case "BL3": FormatMods._IncreaseStats(poke, 10); break;

				case "NU":
				case "BL4": FormatMods._IncreaseStats(poke, 15); break;

				case "PU":
				case "NFE":
				case "LC Uber":
				case "LC": FormatMods._IncreaseStats(poke, 20); break;

				}

				mod[key] = poke;
			}

			return mod;
		}
	});

	FormatMods._IncreaseStats = function _SumStat(poke, quant) {
		var stats = poke.baseStats;

		stats.atk = clamp(stats.atk + quant, 1, 255);
		stats.def = clamp(stats.def + quant, 1, 255);
		stats.hp = clamp(stats.hp + quant, 1, 255);
		stats.spa = clamp(stats.spa + quant, 1, 255);
		stats.spd = clamp(stats.spd + quant, 1, 255);
		stats.spe = clamp(stats.spe + quant, 1, 255);
	};

	function clamp(num, min, max) {
		return num < min ? min : num > max ? max : num;
	}

})(window, jQuery);
