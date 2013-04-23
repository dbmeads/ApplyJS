/*
 * Module: apply/node/router
 * Copyright 2013 David Meads
 * Released under the MIT license
 */
define('apply/node/router', ['apply'], function (apply) {
	'use strict';

	var invoke = apply.router.invoke;

	apply.router.invoke = function (callback, args) {
		if (apply.isPlainObject(callback) && apply.isDefined('1.method', args)) {
			callback = callback[args[1].method];
		}
		return invoke.call(this, callback, args);
	};

	return apply;
});