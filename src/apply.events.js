/*
 * Module: apply/events
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	var defined;

	function module(apply) {
		if (!defined) {
			defined = true;

			apply.Events = apply.compose({
				init: function () {
					if (!this.events) {
						this.events = {};
					}
				},
				on: function (event, callback, context) {
					var callbacks = this.events[event];
					if (!callbacks) {
						callbacks = this.events[event] = [];
					}
					if (context) {
						callback = apply.proxy(callback, context);
					}
					callbacks.push(callback);
				},
				trigger: function (event) {
					var callbacks = this.events[event];
					if (callbacks) {
						var args = apply.array(arguments);
						args.shift();
						for (var i = 0; i < callbacks.length; i++) {
							callbacks[i].apply(this, args);
						}
					}
				}
			});
		}

		return apply;
	}

	define('apply/events', ['apply/construct'], function (apply) {
		return module(apply);
	});
})(this);