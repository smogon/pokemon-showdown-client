(function () {
	"use strict";

	var CACHE_TTL = 5 * 60 * 1000;
	var memoryCache =
		window.__battleStatsCache || (window.__battleStatsCache = {});
	var loadedPokemonCount = {};
	var pokemonSortState = {};
	var leaderboardSortState = {};

	var formatSelect = document.getElementById("format-select");
	var rangeSelect = document.getElementById("range-select");
	var refreshButton = document.getElementById("refresh-button");
	var stateEl = document.getElementById("stats-state");
	var contentEl = document.getElementById("stats-content");

	function toID(text) {
		return ("" + (text || "")).toLowerCase().replace(/[^a-z0-9]+/g, "");
	}

	function applyTheme() {
		var theme = "light";
		try {
			var prefs = JSON.parse(localStorage.getItem("showdown_prefs") || "{}");
			theme = prefs.theme || "light";
		} catch (e) {}

		var media =
			window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
		var isDark =
			theme === "dark" || (theme === "system" && media && media.matches);
		document.documentElement.classList.toggle("dark", !!isDark);
	}

	applyTheme();
	if (window.matchMedia) {
		var themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
		if (themeMedia.addEventListener) {
			themeMedia.addEventListener("change", applyTheme);
		}
	}

	function fmtNumber(value) {
		if (typeof value !== "number" || Number.isNaN(value)) return "0";
		if (Math.abs(value) >= 1000) return value.toLocaleString();
		return "" + value;
	}

	function fmtDecimal(value) {
		if (typeof value !== "number" || Number.isNaN(value)) return "0.0";
		return value.toFixed(1);
	}

	function fmtPercent(value) {
		if (typeof value !== "number" || Number.isNaN(value)) return "0.0%";
		return value.toFixed(1) + "%";
	}

	function getCacheKey(format, range) {
		return format + "|" + range;
	}

	function normalizeApiBase(base) {
		if (!base) return "";
		var trimmed = ("" + base).trim();
		if (!trimmed) return "";
		trimmed = trimmed.replace(/\/+$/, "");
		if (/\/api\/battlestats$/i.test(trimmed)) return trimmed;
		return trimmed + "/api/battlestats";
	}

	function getConfiguredApiBases() {
		var configured = [];
		var queryApi = "";
		try {
			queryApi =
				new URLSearchParams(window.location.search).get("api") || "";
		} catch (e) {}
		if (queryApi) configured.push(queryApi);

		try {
			if (window.BATTLE_STATS_API_BASE) {
				configured.push(window.BATTLE_STATS_API_BASE);
			}
		} catch (e) {}

		try {
			var stored = localStorage.getItem("battle_stats_api_base") || "";
			if (stored) configured.push(stored);
		} catch (e) {}

		return configured.map(normalizeApiBase).filter(Boolean);
	}

	function getApiBases() {
		var bases = [];
		var host = window.location.hostname;
		var protocol = window.location.protocol;
		var port = window.location.port;

		bases.push.apply(bases, getConfiguredApiBases());
		bases.push("/api/battlestats");
		bases.push(protocol + "//" + host + "/api/battlestats");

		if (port !== "8000") {
			bases.push(protocol + "//" + host + ":8000/api/battlestats");
		}

		if (host !== "127.0.0.1")
			bases.push(protocol + "//127.0.0.1:8000/api/battlestats");
		if (host !== "localhost")
			bases.push(protocol + "//localhost:8000/api/battlestats");

		if (host.indexOf("play.") === 0) {
			bases.push(
				protocol +
					"//" +
					host.replace(/^play\./, "server.") +
					"/api/battlestats",
			);
			bases.push(
				protocol +
					"//" +
					host.replace(/^play\./, "sim.") +
					"/api/battlestats",
			);
		}

		return bases.filter(function (base, index, arr) {
			return arr.indexOf(base) === index;
		});
	}

	function setState(html, className) {
		stateEl.className = className;
		stateEl.innerHTML = html;
	}

	function renderError(error) {
		setState("Failed to load battle stats. " + error, "message-error");
		contentEl.innerHTML = "";
	}

	function fetchStats(format, range, forceRefresh) {
		var key = getCacheKey(format, range);
		var now = Date.now();
		if (
			!forceRefresh &&
			memoryCache[key] &&
			memoryCache[key].expiresAt > now
		) {
			return Promise.resolve(memoryCache[key].payload);
		}

		var bases = getApiBases();
		var query =
			"?format=" +
			encodeURIComponent(format) +
			"&range=" +
			encodeURIComponent(range);
		var errors = [];

		function tryBase(index) {
			if (index >= bases.length) {
				throw new Error(errors.join(" | ") || "No API endpoints available");
			}
			var url = bases[index] + query;
			return fetch(url)
				.then(function (res) {
					if (!res.ok)
						throw new Error(url + " returned HTTP " + res.status);
					return res.text().then(function (text) {
						try {
							return JSON.parse(text);
						} catch (e) {
							var preview = text.slice(0, 80).replace(/\s+/g, " ");
							throw new Error(
								url +
									" did not return JSON (starts with: " +
									preview +
									")",
							);
						}
					});
				})
				.catch(function (err) {
					errors.push(err && err.message ? err.message : String(err));
					return tryBase(index + 1);
				});
		}

		return tryBase(0).then(function (payload) {
			memoryCache[key] = {
				expiresAt: now + CACHE_TTL,
				payload: payload,
			};
			return payload;
		});
	}

	function renderCounts(items) {
		if (!items || !items.length) return "<em>None</em>";
		return items
			.map(function (item) {
				return item.name + " (" + fmtPercent(item.pct) + ")";
			})
			.join(", ");
	}

	function titleCaseId(id) {
		if (!id) return "";
		return id
			.split("-")
			.map(function (part) {
				return part.charAt(0).toUpperCase() + part.slice(1);
			})
			.join("-");
	}

	function getSpriteCandidates(species) {
		var id = toID(species);
		var candidates = [];
		if (id) candidates.push(id);

		var base = id
			.replace(/(alola|galar|hisui|paldea)$/i, "")
			.replace(
				/(therian|incarnate|origin|altered|complete|attack|defense|speed|blade|shield|school|busted|crowned|eternamax)$/i,
				"",
			)
			.replace(
				/(red|blue|yellow|green|orange|violet|white|black|east|west)$/i,
				"",
			)
			.replace(/(mega|megax|megay|primal)$/i, "");
		if (base && candidates.indexOf(base) < 0) candidates.push(base);

		var plain = toID((species || "").split(/[\-( ]/)[0]);
		if (plain && candidates.indexOf(plain) < 0) candidates.push(plain);

		return candidates;
	}

	function renderMonIcon(species) {
		if (window.Dex && Dex.getPokemonIcon) {
			return (
				'<span class="picon stats-monicon" style="' +
				Dex.getPokemonIcon(species) +
				'"></span>'
			);
		}
		var spriteCandidates = getSpriteCandidates(species);
		var spriteId = spriteCandidates[0] || "unknown";
		return (
			'<img class="stats-monicon stats-monicon-fallback" src="/sprites/gen5/' +
			spriteId +
			'.png" data-sprite-candidates="' +
			spriteCandidates.join(",") +
			'" data-sprite-index="0" alt="" loading="lazy" decoding="async" />'
		);
	}

	function getPokemonSortState(categoryId) {
		if (!pokemonSortState[categoryId]) {
			pokemonSortState[categoryId] = { key: "usagePct", dir: "desc" };
		}
		return pokemonSortState[categoryId];
	}

	function getSortedPokemon(category) {
		var list = (category.pokemonUsage && category.pokemonUsage.pokemon) || [];
		var sort = getPokemonSortState(category.id);
		return list.slice().sort(function (a, b) {
			var cmp = 0;
			if (sort.key === "species") cmp = a.species.localeCompare(b.species);
			if (sort.key === "appearances") cmp = a.appearances - b.appearances;
			if (sort.key === "usagePct") cmp = a.usagePct - b.usagePct;
			if (sort.key === "winRate") cmp = a.winRate - b.winRate;
			if (!cmp) cmp = a.species.localeCompare(b.species);
			return sort.dir === "asc" ? cmp : -cmp;
		});
	}

	function getLeaderboardSortState(categoryId) {
		if (!leaderboardSortState[categoryId]) {
			leaderboardSortState[categoryId] = { key: "battles", dir: "desc" };
		}
		return leaderboardSortState[categoryId];
	}

	function getSortedLeaderboard(category) {
		var list =
			(category.userLeaderboard && category.userLeaderboard.rows) || [];
		var sort = getLeaderboardSortState(category.id);
		return list.slice().sort(function (a, b) {
			var cmp = 0;
			if (sort.key === "user") cmp = a.user.localeCompare(b.user);
			if (sort.key === "battles") cmp = a.battles - b.battles;
			if (sort.key === "wins") cmp = a.wins - b.wins;
			if (sort.key === "winRate") cmp = a.winRate - b.winRate;
			if (sort.key === "currentStreak")
				cmp = a.currentStreak - b.currentStreak;
			if (!cmp) cmp = a.user.localeCompare(b.user);
			return sort.dir === "asc" ? cmp : -cmp;
		});
	}

	function sortHeader(categoryId, key, label, currentSort) {
		var isCurrent = currentSort.key === key;
		var nextDir = isCurrent && currentSort.dir === "desc" ? "asc" : "desc";
		var arrow = "";
		if (isCurrent) arrow = currentSort.dir === "desc" ? " \u25bc" : " \u25b2";
		return (
			"" +
			'<button class="button stats-sortbutton" data-sort-category="' +
			categoryId +
			'" data-sort-key="' +
			key +
			'" data-sort-dir="' +
			nextDir +
			'">' +
			label +
			arrow +
			"</button>"
		);
	}

	function sortHeaderLeaderboard(categoryId, key, label, currentSort) {
		var isCurrent = currentSort.key === key;
		var nextDir = isCurrent && currentSort.dir === "desc" ? "asc" : "desc";
		var arrow = "";
		if (isCurrent) arrow = currentSort.dir === "desc" ? " \u25bc" : " \u25b2";
		return (
			"" +
			'<button class="button stats-sortbutton" data-lb-sort-category="' +
			categoryId +
			'" data-lb-sort-key="' +
			key +
			'" data-lb-sort-dir="' +
			nextDir +
			'">' +
			label +
			arrow +
			"</button>"
		);
	}

	function renderCoreList(cores) {
		if (!cores || !cores.length)
			return "<p><em>No common cores yet.</em></p>";
		var items = cores
			.map(function (core) {
				return (
					"<li>" +
					titleCaseId(core.pokemonA) +
					" + " +
					titleCaseId(core.pokemonB) +
					" <small>(" +
					fmtNumber(core.count) +
					" teams)</small></li>"
				);
			})
			.join("");
		return '<ol class="stats-core-list">' + items + "</ol>";
	}

	function renderPokemonTable(category) {
		var key = category.id;
		if (!loadedPokemonCount[key]) loadedPokemonCount[key] = 20;
		var list = getSortedPokemon(category);
		var sort = getPokemonSortState(category.id);
		var visible = list.slice(0, loadedPokemonCount[key]);
		var rows = visible
			.map(function (mon) {
				var sprite =
					'<span class="stats-moncell">' +
					renderMonIcon(mon.species) +
					"<span>" +
					mon.species +
					"</span></span>";
				return (
					"<tr>" +
					"<td>" +
					sprite +
					"</td>" +
					"<td>" +
					fmtNumber(mon.appearances) +
					"</td>" +
					"<td>" +
					fmtPercent(mon.usagePct) +
					"</td>" +
					"<td>" +
					fmtPercent(mon.winRate) +
					"</td>" +
					"<td>" +
					renderCounts(mon.abilities) +
					"</td>" +
					"<td>" +
					renderCounts(mon.items) +
					"</td>" +
					"<td>" +
					renderCounts(mon.moves) +
					"</td>" +
					"</tr>"
				);
			})
			.join("");
		if (!rows) {
			rows = '<tr><td colspan="7"><em>No Pokemon data yet.</em></td></tr>';
		}
		var showMore = list.length > loadedPokemonCount[key];
		return (
			"" +
			'<table class="table readable-bg" style="width: 100%;">' +
			'<tr class="table-header">' +
			"<th>" +
			sortHeader(category.id, "species", "Pokemon", sort) +
			"</th>" +
			"<th>" +
			sortHeader(category.id, "appearances", "Appearances", sort) +
			"</th>" +
			"<th>" +
			sortHeader(category.id, "usagePct", "Usage %", sort) +
			"</th>" +
			"<th>" +
			sortHeader(category.id, "winRate", "Win %", sort) +
			"</th>" +
			"<th>Top Abilities</th><th>Top Items</th><th>Top Moves</th>" +
			"</tr>" +
			rows +
			"</table>" +
			(showMore
				? '<p><button class="button" data-loadmore="' +
					key +
					'">Load more</button></p>'
				: "")
		);
	}

	function renderLeaderboardTable(category) {
		var sort = getLeaderboardSortState(category.id);
		var rows = getSortedLeaderboard(category)
			.map(function (row, index) {
				return (
					"<tr>" +
					"<td>" +
					(index + 1) +
					"</td>" +
					"<td>" +
					row.user +
					"</td>" +
					"<td>" +
					fmtNumber(row.battles) +
					"</td>" +
					"<td>" +
					fmtNumber(row.wins) +
					"</td>" +
					"<td>" +
					fmtPercent(row.winRate) +
					"</td>" +
					"<td>" +
					fmtNumber(row.currentStreak) +
					"</td>" +
					"</tr>"
				);
			})
			.join("");
		if (!rows)
			rows = '<tr><td colspan="7"><em>No user data yet.</em></td></tr>';
		return (
			"" +
			'<table class="table readable-bg" style="width: 100%;">' +
			'<tr class="table-header">' +
			"<th>#</th>" +
			"<th>" +
			sortHeaderLeaderboard(category.id, "user", "User", sort) +
			"</th>" +
			"<th>" +
			sortHeaderLeaderboard(category.id, "battles", "Battles", sort) +
			"</th>" +
			"<th>" +
			sortHeaderLeaderboard(category.id, "wins", "Wins", sort) +
			"</th>" +
			"<th>" +
			sortHeaderLeaderboard(category.id, "winRate", "Win %", sort) +
			"</th>" +
			"<th>" +
			sortHeaderLeaderboard(
				category.id,
				"currentStreak",
				"Current Streak",
				sort,
			) +
			"</th>" +
			"</tr>" +
			rows +
			"</table>"
		);
	}

	function renderCategory(category) {
		var battle = category.battleStats;
		var usage = category.pokemonUsage;
		var trend = category.metaTrends;
		var mostCommonCore = trend.mostCommonCore
			? titleCaseId(trend.mostCommonCore.pokemonA) +
				" + " +
				titleCaseId(trend.mostCommonCore.pokemonB) +
				" (" +
				fmtNumber(trend.mostCommonCore.count) +
				")"
			: "N/A";
		return (
			"" +
			'<div class="ladder pad stats-category">' +
			'<h3 class="stats-category-title">' +
			category.label +
			" <small>(" +
			category.displayFormat +
			")</small></h3>" +
			'<div class="stats-metrics">' +
			'<div class="stats-metric"><span>Total battles</span><strong>' +
			fmtNumber(battle.totalBattlesAllTime) +
			"</strong></div>" +
			'<div class="stats-metric"><span>24h / 7d / 30d</span><strong>' +
			fmtNumber(battle.battlesLast24h) +
			" / " +
			fmtNumber(battle.battlesLast7d) +
			" / " +
			fmtNumber(battle.battlesLast30d) +
			"</strong></div>" +
			'<div class="stats-metric"><span>Avg battles/day (30d)</span><strong>' +
			fmtDecimal(battle.averageBattlesPerDay30d) +
			"</strong></div>" +
			'<div class="stats-metric"><span>Peak hour</span><strong>' +
			(battle.peakHourOfDay === null ? "N/A" : battle.peakHourOfDay) +
			"</strong></div>" +
			'<div class="stats-metric"><span>Avg battle turns</span><strong>' +
			fmtDecimal(battle.averageBattleDurationTurns) +
			"</strong></div>" +
			'<div class="stats-metric"><span>Forfeit/disconnect</span><strong>' +
			fmtPercent(battle.forfeitDisconnectRate * 100) +
			"</strong></div>" +
			'<div class="stats-metric"><span>Format health</span><strong>' +
			fmtDecimal(trend.formatHealthIndicator) +
			"</strong></div>" +
			"</div>" +
			'<div class="stats-section">' +
			"<h4>Meta Cores</h4>" +
			"<p><strong>Most common core:</strong> " +
			mostCommonCore +
			"</p>" +
			renderCoreList(trend.topCommonCores || []) +
			"</div>" +
			"<h4>Player Leaderboard</h4>" +
			renderLeaderboardTable(category) +
			"<h4>Pokemon Usage</h4>" +
			"<p><strong>Total team slots tracked:</strong> " +
			fmtNumber(usage.totalTeamSlots) +
			"</p>" +
			renderPokemonTable(category) +
			"</div>"
		);
	}

	function render(payload) {
		setState(
			"Updated at " + new Date(payload.generatedAt).toLocaleString(),
			"message-success",
		);
		var html = (payload.categories || []).map(renderCategory).join("");
		contentEl.innerHTML =
			html || "<p><em>No categories available for this filter.</em></p>";
	}

	function load(forceRefresh) {
		setState(
			'<i class="fa fa-refresh fa-spin" aria-hidden="true"></i> Loading stats...',
			"message-info",
		);
		contentEl.innerHTML = "";
		fetchStats(formatSelect.value, rangeSelect.value, !!forceRefresh)
			.then(render)
			.catch(function (error) {
				renderError(
					error && error.message ? error.message : "Unknown error",
				);
			});
	}

	contentEl.addEventListener("click", function (event) {
		var target = event.target;
		if (target && target.closest)
			target = target.closest(
				"[data-sort-category], [data-loadmore], [data-lb-sort-category]",
			);
		if (!target || !target.getAttribute) return;
		var lbSortCategory = target.getAttribute("data-lb-sort-category");
		var lbSortKey = target.getAttribute("data-lb-sort-key");
		var lbSortDir = target.getAttribute("data-lb-sort-dir");
		if (lbSortCategory && lbSortKey && lbSortDir) {
			leaderboardSortState[lbSortCategory] = {
				key: lbSortKey,
				dir: lbSortDir,
			};
			load(false);
			return;
		}
		var sortCategory = target.getAttribute("data-sort-category");
		var sortKey = target.getAttribute("data-sort-key");
		var sortDir = target.getAttribute("data-sort-dir");
		if (sortCategory && sortKey && sortDir) {
			pokemonSortState[sortCategory] = { key: sortKey, dir: sortDir };
			load(false);
			return;
		}
		var key = target.getAttribute("data-loadmore");
		if (!key) return;
		loadedPokemonCount[key] = (loadedPokemonCount[key] || 20) + 20;
		load(false);
	});

	contentEl.addEventListener(
		"error",
		function (event) {
			var target = event.target;
			if (
				!target ||
				!target.classList ||
				!target.classList.contains("stats-monicon-fallback")
			) {
				return;
			}
			var list = (target.getAttribute("data-sprite-candidates") || "")
				.split(",")
				.filter(Boolean);
			var index =
				Number(target.getAttribute("data-sprite-index") || "0") + 1;
			if (index >= list.length) {
				target.style.display = "none";
				return;
			}
			target.setAttribute("data-sprite-index", "" + index);
			target.src = "/sprites/gen5/" + list[index] + ".png";
		},
		true,
	);

	formatSelect.addEventListener("change", function () {
		load(false);
	});
	rangeSelect.addEventListener("change", function () {
		load(false);
	});
	refreshButton.addEventListener("click", function () {
		load(true);
	});

	load(false);
})();
