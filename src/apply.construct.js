/*
 * Module: apply/construct
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
define('apply/construct', ['apply/util'], function (apply) {
	'use strict';

	var array = apply.array,
		extend = apply.extend,
		isArray = apply.isArray,
		isComposed = apply.isComposed,
		isFunction = apply.isFunction,
		isInstanceOf = apply.isInstanceOf,
		isPlainObject = apply.isPlainObject,
		isString = apply.isString,
		loop = apply.loop,
		namespace = apply.namespace,
		push = [].push;

	// apply.cascade
	// -------------
	var cascade = apply.cascade = function (objects, funcName, reverse) {
		var cascades = [];
		loop(objects, function (object) {
			if (object[funcName]) {
				cascades.push(object[funcName]);
			}
		}, {
			reverse: reverse
		});
		if (cascades.length) {
			return function () {
				var result;
				var args = array(arguments);
				loop(cascades, function (cascade) {
					result = cascade.apply(this, args);
				}, {
					context: this
				});
				return result;
			};
		}
	};


	// apply.compose
	// -----------
	var buildConstructor = (function () {

		function prepArgs(constructor, oldArguments) {
			var args = array(oldArguments);
			return isString(args[0]) ? [args.shift(), constructor].concat(args) : [constructor].concat(args);
		}

		function create() {
			var constructor = function () {
				if (!this || this.constructor !== constructor) {
					return compose.apply(this || {}, prepArgs(constructor, arguments));
				}
				if (this.init) {
					this.init.apply(this, arguments);
				}
			};
			return constructor;
		}

		function decorateConstructor(constructor, mixins) {
			constructor.objects = [];
			constructor.mixins = mixins;
			constructor.composers = [];
			constructor.cascades = {
				'init': ['init']
			};
			constructor.cascade = function (funcName) {
				namespace(constructor, 'cascades.' + funcName, arguments);
				var cascaded = cascade.apply(this, [this.objects].concat(array(arguments)));
				if (cascaded) {
					constructor.prototype[funcName] = cascaded;
				}
				return constructor;
			};
			constructor.instance = function () {
				var args = array(arguments);
				args.push(constructor);
				return instance.apply(this, args);
			};
			constructor.merge = function (object) {
				extend(constructor.prototype, object);
				return constructor;
			};
			constructor.compose = function () {
				if (arguments.length === 0) {
					return buildConstructor(constructor.mixins, constructor);
				}
				return compose.apply(this, prepArgs(constructor, arguments));
			};
			constructor.composer = function (composer) {
				if (composer) {
					constructor.composers.push(composer);
				}
				return constructor;
			};
			loop(mixins, function (mixin) {
				if (isFunction(mixin)) {
					constructor.objects.push(mixin.prototype);
					extend(constructor.cascades, mixin['cascades']);
					if (mixin.composers) {
						push.apply(constructor.composers, mixin.composers);
					}
				} else {
					constructor.objects.push(mixin);
				}
			});
		}

		function addCascades(constructor) {
			var cascades = constructor.cascades;
			for (var key in cascades) {
				constructor.cascade.apply(constructor, cascades[key]);
			}
		}

		function addIsInstanceOf(constructor) {
			constructor.prototype.isInstanceOf = function (constructor) {
				return isInstanceOf(constructor, this);
			};
		}

		function decoratePrototype(constructor) {
			extend.apply(undefined, [constructor.prototype].concat(constructor.objects));
			addCascades(constructor);
			addIsInstanceOf(constructor);
		}

		function invokecomposers(constructor) {
			loop(constructor.composers, function (composer) {
				composer.call(constructor, constructor);
			});
		}

		return function (mixins, constructor) {
			if (!constructor) {
				constructor = create();
			}
			decorateConstructor(constructor, mixins);
			decoratePrototype(constructor);
			invokecomposers(constructor);
			return constructor;
		};
	})();

	var compose = apply.compose = function () {
		var args = array(arguments),
			ns;
		if (isString(args[0])) {
			ns = args.shift();
		}
		var constructor = buildConstructor(args);
		if (ns) {
			namespace(ns, constructor);
		}
		return constructor;
	};


	// apply.decompose
	// ----------------
	var cleanConstructor = function (constructor) {
		constructor.prototype = {};
	};

	apply.decompose = function () {
		var args = array(arguments),
			constructor;
		if (args.length > 1) {
			constructor = args.shift();
			if (isComposed(constructor)) {
				cleanConstructor(constructor);
				for (var i = 0; i < args.length; i++) {
					var indexOf = constructor.mixins.indexOf(args[i]);
					if (indexOf >= 0) {
						constructor.mixins.splice(indexOf, 1);
					}
				}
				constructor.compose();
			}
		}
		return constructor;
	};

	// apply.instance
	// ---------------
	var con = function () {};

	var instance = apply.instance = function () {
		var args = array(arguments);
		var nsargs = [];
		if (isPlainObject(args[0])) {
			nsargs.push(args.shift());
		}
		if (isString(args[0])) {
			nsargs.push(args.shift());
		}
		var conargs = [];
		if (isArray(args[0])) {
			conargs = args.shift();
		}
		var instance = {};
		if (isFunction(args[0])) {
			con.prototype = args[0].prototype;
			instance = new con();
			instance.constructor = args[0];
			args[0].apply(instance, conargs);
		}
		if (nsargs.length > 0) {
			nsargs.push(instance);
			namespace.apply(this, nsargs);
		}
		return instance;
	};

	return apply;
});