/*
 * Module: apply/node/router
 * Copyright 2013 David Meads
 * Released under the MIT license
 */
define('apply/node/router', ['apply'], function (apply) {
	'use strict';

	var invoke = apply.router.invoke;

	apply.router.invoke = function (callback, args) {
		var req = args[args.length - 2];
		if (apply.isPlainObject(callback) && req.method) {
			callback = callback[req.method];
		}
		return invoke.call(this, callback, args);
	};

	apply.namespace('apply.connect.router', function () {
		return function (req, res, next) {
			if (!apply.router.route.call(apply.router, req.url, req, res)) {
				next();
			}
		};
	});

	return apply;
});