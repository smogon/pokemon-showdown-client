/**
 * Client-side userstats JavaScript
 *
 * @author Cathy J. Fitzpatrick <cathy@cathyjf.com>
 * @contributor kota <nospam@xiaotai.org>
 * @dependencies flot, jQuery
 * @licence public domain
 */
$(function() {
	'use strict';

	var timezoneOffset = new Date().getTimezoneOffset();
	var timezoneAdjust = function(stats) {
		for (var i = 0; i < stats.length; ++i) {
			var data = stats[i].data;
			for (var j = 0; j < data.length; ++j) {
				if (j === 0) {
					data[j][0] = (data[j][0] - timezoneOffset * 60) * 1000;
				} else {
					data[j][0] = data[j - 1][0] + data[j][0] * 1000;
				}
			}
		}
	};
	timezoneAdjust(Config.stats);
	timezoneAdjust(Config.subset);
	var getUserstats = function(startDate, endDate, callback) {
		var query = "?format=json&startDate=" +
			encodeURIComponent(startDate) +
			"&endDate=" +
			encodeURIComponent(endDate);
		$.getJSON(query, function(stats) {
			timezoneAdjust(stats);
			callback(stats);
		});
	};
	$('#maxusersdate').text(new Date(Config.maxUsersDate).toLocaleString());
	$('#timezone').text(((timezoneOffset > 0) ? '-' : '+') + (Math.abs(timezoneOffset) / 60));

	var xaxis = {mode: 'time', timeformat: '%y-%0m-%0d %H:%M'};

	var graph = (function() {
		var options = {
			xaxis: xaxis,
			yaxis: {
				min: 0,
				ticks: 9
			},
			selection: {mode: 'x'},
			grid: {
				hoverable: true,
				borderWidth: 0
			},
			legend: {
				show: true,
				container: $('#legend')
			}
		};
		var self = $.plot($("#userstats"), Config.stats, options);
		var showUserCount = function(plot, x, y) {
			var p = plot.pointOffset({x: x, y: y});
			$("#usercount-overlay").remove();
			$("#userstats").append('<div id="usercount-overlay"' +
				'style="position:absolute;left:' +
				(p.left + 15) + 'px;top:' + (p.top - 15) +
				'px;color:#666;font-size:smaller;' +
				'background-color:rgba(255,255,255,0.3);">' + y + ' users</div>');
		};
		var highlightPoint = (function() {
			var lastHighlight = -1;
			var lastSeries = -1;
			return function(plot, series, index) {
				if (lastHighlight !== -1) {
					plot.unhighlight(lastSeries, lastHighlight);
				}
				plot.highlight(lastSeries = series, lastHighlight = index);
			};
		})();
		var highlightMaximum = function(plot) {
			var max = 0;
			var maxIdx = 0;
			var maxSeriesIdx = 0;
			var data = plot.getData();
			for (var i = 0; i < data.length; ++i) {
				var series = data[i].data;
				for (var j = 0; j < series.length; ++j) {
					if (series[j][0] < plot.getAxes().xaxis.min) continue;
					if (series[j][0] > plot.getAxes().xaxis.max) break;
					if (series[j][1] > max) {
						max = series[j][1];
						maxIdx = j;
						maxSeriesIdx = i;
					}
				}
			}
			highlightPoint(plot, maxSeriesIdx, maxIdx);
			showUserCount(plot, data[maxSeriesIdx].data[maxIdx][0], max);
		};
		highlightMaximum(self);
		$('#userstats').bind('plothover', function(event, pos, item) {
			if (item) {
				highlightPoint(self, item.series, item.dataIndex);
				showUserCount(self, item.datapoint[0], item.datapoint[1]);
			}
		});
		$('#userstats').bind('plotselected', function(event, ranges) {
			var handleStats = function(stats) {
				graph = self = $.plot($('#userstats'), stats,
					$.extend(true, {}, options, {
						xaxis: {min: ranges.xaxis.from, max: ranges.xaxis.to}
					}
				));
				overview.setSelection(ranges, true);
				highlightMaximum(self);
			};
			if (Config.subset) {
				handleStats(Config.subset);
				Config.subset = null;
			} else {
				var from = ranges.xaxis.from + timezoneOffset * 60 * 1000;
				var to = ranges.xaxis.to + timezoneOffset * 60 * 1000;
				getUserstats(from, to, handleStats);
			}
		});
		return self;
	})();

	var overview = (function() {
		var ret = $.plot($('#overview'), Config.stats, {
			series: {
				lines: {show: true, lineWidth: 1},
				shadowSize: 0
			},
			xaxis: xaxis,
			yaxis: {ticks: [], min: 0, autoscaleMargin: 0.1},
			selection: {mode: 'x'},
			legend: {show: false},
			grid: {
				borderWidth: 0
			}
		});
		$('#overview').bind('plotselected', function(event, ranges) {
			graph.setSelection(ranges);
		});
		return ret;
	})();

	(function() {
		if (!Config.subset) return;
		var axes = graph.getAxes();
		var yaxis = axes.yaxis;
		graph.setSelection({
			xaxis: {
				from: Math.min(
					Config.subset[0].data[0][0],
					Config.subset[1].data[0][0]
				),
				to: Math.max(
					Config.subset[0].data[Config.subset[0].data.length - 1][0],
					Config.subset[1].data[Config.subset[1].data.length - 1][0],
					axes.xaxis.max
				)
			},
			yaxis: {
				from: yaxis.min,
				to: yaxis.max
			}
		});
	})();

	$('#loading').hide();
	$('.hidden-content').show();
});
