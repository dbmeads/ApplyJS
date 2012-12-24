/*
 * Module: apply/core
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	var apply;

	define('apply/core', function () {
		apply = root.apply = apply || {
			module: function (callback) {
				if (!callback.called) {
					callback.called = true;
					callback.apply(this, [this].concat([].slice.call(arguments, 1)));
				}
				return apply;
			}
		};
		return apply;
	});

})(this);