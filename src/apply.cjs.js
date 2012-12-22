/*
 * Module: apply.cjs
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root, undefined) {
	'use strict';

	if (typeof require === 'function' && exports) {
		exports = root.apply.init(require('jquery'), exports);
	}
})(this);