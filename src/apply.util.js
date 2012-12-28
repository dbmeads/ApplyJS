/*
 * Module: apply/util
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	function module(apply) {
		// On Loan
		// -------
		var slice = [].slice;


		// apply.extend
		// ------------
		var extend = apply.extend = function (dest) {
			var deep = false;
			if (dest === true) {
				deep = true;
				dest = arguments[1];
			}
			for (var i = 1; i < arguments.length; i++) {
				for (var key in arguments[i]) {
					if (deep && isPlainObject(dest[key])) {
						extend(true, dest[key], arguments[i][key]);
					} else {
						dest[key] = arguments[i][key];
					}
				}
			}
			return dest;
		};


		// apply.proxy
		// -----------
		apply.proxy = function (func, context) {
			return function () {
				return func.apply(context, arguments);
			};
		};


		apply.array = function (obj) {
			return slice.call(obj);
		};

		var getPrototypeOf = function (obj) {
			if (isObject(obj) || isFunction(obj)) {
				if (isFunction(obj)) {
					return obj.prototype;
				}
				return Object.getPrototypeOf(obj);
			}
		};

		var isArray = function (obj) {
			return getPrototypeOf(obj) === Array.prototype;
		};

		var isDefined = function () {
			if (arguments[0] !== undefined) {
				var parts = arguments[0].split('.');
				var obj = arguments[1] || root;

				for (var i = 0; i < parts.length; i++) {
					if (!obj[parts[i]]) {
						return false;
					}
					obj = obj[parts[i]];
				}
				return true;
			}
			return false;
		};

		var isFunction = function (obj) {
			return typeof obj === 'function';
		};

		var isInstanceOf = function (constructor, instance) {
			if (isFunction(constructor)) {
				if (getPrototypeOf(instance) === constructor.prototype) {
					return true;
				} else if (isDefined('constructor.mixins', instance)) {
					var mixins = instance.constructor.mixins;
					for (var i = 0; i < mixins.length; i++) {
						if (mixins[i] === constructor) {
							return true;
						}
					}
				}
			}
			return false;
		};

		var isComposed = function (obj) {
			if (isFunction(obj)) {
				return obj.compose !== undefined;
			} else if (isPlainObject(obj)) {
				return obj.constructor.compose !== undefined;
			}
			return false;
		};

		var isNumber = function (obj) {
			return typeof obj === 'number';
		};

		var isObject = function (obj) {
			return isFunction(obj) || typeof obj === 'object';
		};

		var isPlainObject = function (obj) {
			return !isArray(obj) && typeof obj === 'object';
		};

		var isString = function (obj) {
			return typeof obj === 'string';
		};

		extend(apply, {
			getPrototypeOf: getPrototypeOf,
			isArray: isArray,
			isDefined: isDefined,
			isFunction: isFunction,
			isInstanceOf: isInstanceOf,
			isComposed: isComposed,
			isNumber: isNumber,
			isObject: isObject,
			isPlainObject: isPlainObject,
			isString: isString
		});

		// apply.collection
		// ----------------
		var last = function (collection, value) {
			if (value) {
				collection[collection.length - 1] = value;
			}
			return collection[collection.length - 1];
		};

		var loop = function (array, callback, options) {
			options = options || {};
			var context = options.context || this;
			var i;
			if (options.reverse) {
				for (i = options.start || array.length - 1; i >= 0; i--) {
					callback.call(context, array[i], i);
				}
			} else {
				for (i = options.start || 0; i < array.length; i++) {
					callback.call(context, array[i], i);
				}
			}
		};

		extend(apply, {
			last: last,
			loop: loop
		});


		// apply.string
		// ------------
		var numeric = /^(0|[1-9][0-9]*)$/;

		var isNumeric = function (string) {
			return numeric.test(string);
		};

		var endsWith = function (string, suffix) {
			return string.indexOf(suffix) === string.length - suffix.length;
		};

		apply.string = {
			endsWith: endsWith,
			isNumeric: isNumeric
		};


		// apply.namespace
		// ---------------
		var namespace = apply.namespace = function () {
			var args = slice.call(arguments);
			var obj = root;
			if (!isString(args[0])) {
				obj = args.shift();
				if (!obj) {
					throw 'Attempting to extend/access "' + args[0] + '" on an undefined namespace.';
				}
			}
			var namespace = args[0],
				object = args[1];
			if (namespace !== undefined) {
				var parts = namespace.split('.');
				loop(parts, function (part, index) {
					if (index === parts.length - 1) {
						if (object) {
							obj[part] = object;
						}
					} else if (!obj[part]) {
						obj[part] = {};
					}
					obj = obj[part];
				});
			}
			return obj;
		};


		// apply.delegateToParent
		// ----------------------
		apply.delegateToParent = function (method, callback) {
			return function () {
				if (this.parent && this.parent[method]) {
					return this.parent[method].apply(this.parent, arguments);
				}
				return callback.apply(this, arguments);
			};
		};
	}

	define('apply/util', ['apply/core'], function (apply) {
		return apply.module(module);
	});

})(this);