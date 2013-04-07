/*
 * Module: apply/logger
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
define('apply/logger', ['apply/construct'], function (apply) {
	'use strict';

	var addLoggers = function () {
		apply.loop(arguments, function (level) {
			this[level] = function (message) {
				return this.log({
					level: level,
					message: message
				});
			};
		}, {
			context: this
		});
	};

	var Logger = apply.Logger = apply.compose({
		init: function () {
			this.levels = {};
			this.config({
				debug: true,
				info: true,
				warning: true,
				error: true
			});
		},
		config: function (levels) {
			apply.extend(this.levels, levels);
			for (var key in levels) {
				if (!this[key]) {
					addLoggers.call(this, key);
				}
			}
		},
		log: function (options) {
			var level = options.level;
			if (level && this.levels[level] && options.message) {
				console.log(options.message);
			}
			return this;
		}
	}).cascade('log', true);

	apply.logger = Logger.instance();

	return apply;
});