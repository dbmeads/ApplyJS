/*
 * Module: apply/router
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	function module(apply) {
		apply.Router = apply.compose({
			init: function () {
				this.routes = {};
			},
			add: function (routes) {
				if (apply.isString(routes)) {
					routes = {};
					if (arguments.length === 2 && apply.isFunction(arguments[1])) {
						routes[arguments[0]] = arguments[1];
					}
				}
				try {
					for (var key in routes) {
						apply.namespace(this.routes, key.replace(/^\//, '').replace(/\//g, '.'), routes[key]);
					}
				} catch (e) {
					console.log(e);
				}
				return this;
			},
			route: function (route) {
				var parts = route.replace(/^#?\/?/, '').split('/');
				var args = [];
				var fragments = this.routes;
				for (var i = 0; i < parts.length; i++) {
					var part = parts[i];
					if (fragments[part]) {
						fragments = fragments[part];
					} else if (fragments['*']) {
						args.push(apply.string.isNumeric(part) ? Number(part) : part);
						fragments = fragments['*'];
					} else {
						break;
					}
				}
				if (apply.isFunction(fragments)) {
					fragments.apply(this, args.concat([].slice.call(arguments, 1)));
				}
			}
		});

		apply.router = apply.Router.instance();
	}

	define('apply/router', ['apply/util', 'apply/construct'], function (apply) {
		return apply.module(module);
	});
})(this);