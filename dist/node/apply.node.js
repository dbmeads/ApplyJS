/*
 * Module: node
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root, undefined) {
	'use strict';

	var modules = {},
		waiting = {};

	root.define = GLOBAL.define = function () {
		var dependencies, factory, module;
		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i],
				type = typeof arg;
			if (type === 'function') {
				factory = arg;
			} else if (type === 'string') {
				module = arg;
			} else if (type === 'object' && arg.length) {
				dependencies = arg;
			}
		}
		resolveDependencies(factory, dependencies, module);
	};

	function resolveDependencies(factory, dependencies, module) {
		console.log('resolved ', module);
		var resolved = [];
		if (dependencies) {
			for (var i = 0; i < dependencies.length; i++) {
				var dependency = dependencies[i];
				if (modules[dependency]) {
					resolved.push(modules[dependency].call(root));
				} else {
					addToWaiting(factory, dependency, {
						factory: factory,
						dependencies: dependencies,
						module: module
					});
				}
			}
		}
		if (!dependencies || resolved.length === dependencies.length) {
			handleResolved(factory, resolved, module);
		}
	}

	function addToWaiting(factory, dependency, args) {
		if (!factory.unresolved) {
			factory.unresolved = [];
		}
		var waitList = waiting[dependency];
		if (!waitList) {
			waitList = waiting[dependency] = [];
		}
		waitList.push(args);
		factory.unresolved.push(dependency);
		if (waitList.length === 1) {
			fetch(dependency);
		}
	}

	function handleResolved(factory, resolvedDependencies, module) {
		if (factory.unresolved) {
			delete factory.unresolved;
		}
		factory.apply(root, resolvedDependencies);
		if (module) {
			modules[module] = factory;
			resolveWaiting(module);
		}
	}

	function resolveWaiting(module) {
		var waitList = waiting[module];
		if (waitList) {
			for (var i = 0; i < waitList.length; i++) {
				var args = waitList[i];
				resolveDependencies.call(root, args.factory, args.dependencies, args.module);
			}
		}
		delete waiting[module];
	}

	function fetch(module) {
		try {
			var result = require(module);
			modules[module] = function () {
				return result;
			};
			resolveWaiting(module);
		} catch (error) {

		}
	}
})(this);
/*
 * Module: apply
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root, undefined) {
	'use strict';

	var apply;

	function init() {

		apply = root.apply = {};


		// On Loan
		// -------
		var push = Array.prototype.push;
		var slice = Array.prototype.slice;


		// apply.extend
		// ------------
		var extend = apply.extend = function (dest) {
			for (var i = 1; i < arguments.length; i++) {
				for (var key in arguments[i]) {
					dest[key] = arguments[i][key];
				}
			}
			return dest;
		};


		// apply.proxy
		// -----------
		var proxy = apply.proxy = function (func, context) {
			return function () {
				return func.apply(context, arguments);
			};
		};

		// Utils
		// ----------
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
			var args = slice.apply(arguments);
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
					var args = slice.apply(arguments);
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
				var args = slice.apply(oldArguments);
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
				constructor.generators = [];
				constructor.cascades = {
					'init': ['init']
				};
				constructor.cascade = function (funcName) {
					namespace(constructor, 'cascades.' + funcName, arguments);
					var cascaded = cascade.apply(this, [this.objects].concat(slice.apply(arguments)));
					if (cascaded) {
						constructor.prototype[funcName] = cascaded;
					}
					return constructor;
				};
				constructor.singleton = function () {
					var args = slice.apply(arguments);
					args.push(constructor);
					return singleton.apply(this, args);
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
				constructor.generator = function (generator) {
					if (generator) {
						constructor.generators.push(generator);
					}
					return constructor;
				};
				loop(mixins, function (mixin) {
					if (isFunction(mixin)) {
						constructor.objects.push(mixin.prototype);
						extend(constructor.cascades, mixin['cascades']);
						if (mixin.generators) {
							push.apply(constructor.generators, mixin.generators);
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

			function invokeGenerators(constructor) {
				loop(constructor.generators, function (generator) {
					generator.call(constructor, constructor);
				});
			}

			return function (mixins, constructor) {
				if (!constructor) {
					constructor = create();
				}
				decorateConstructor(constructor, mixins);
				decoratePrototype(constructor);
				invokeGenerators(constructor);
				return constructor;
			};
		})();

		var compose = apply.compose = function () {
			var args = slice.apply(arguments),
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

		function cleanConstructor(constructor) {
			constructor.prototype = {};
		}

		apply.decompose = function () {
			var args = slice.apply(arguments),
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

		// apply.singleton
		// ---------------
		var con = function () {};

		var singleton = apply.singleton = function () {
			var args = slice.apply(arguments);
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


		// apply.logger
		// ------------
		var addLoggers = function () {
			loop(arguments, function (level) {
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

		var Logger = apply.Logger = compose({
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
				extend(this.levels, levels);
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

		var logger = apply.logger = Logger.singleton();


		// apply.Events
		// ------------
		var events = apply.Events = compose({
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
					callback = proxy(callback, context);
				}
				callbacks.push(callback);
			},
			trigger: function (event) {
				var callbacks = this.events[event];
				if (callbacks) {
					var args = slice.apply(arguments);
					args.shift();
					for (var i = 0; i < callbacks.length; i++) {
						callbacks[i].apply(this, args);
					}
				}
			}
		});


		// apply.Model
		// -----------
		var inflate = function (object, mappings, parent) {
			if (mappings) {
				if (!object) {
					object = {};
				}
				for (var key in mappings) {
					if (object[key]) {
						var obj = new mappings[key](object[key]);
						if (parent) {
							obj.parent = parent;
						}
						object[key] = obj;
					}
				}
			}
			return object;
		};

		var deflate = function (object, mappings) {
			if (mappings) {
				for (var key in mappings) {
					if (object[key].deflate) {
						object[key] = object[key].deflate();
					}
				}
			}
			return object;
		};

		var model = apply.Model = events({
			id: 'id',
			urlRoot: '',
			init: function (attributes) {
				this.attributes = {};
				this.set(attributes);
			},
			set: function (attributes) {
				if (attributes && isFunction(attributes.deflate)) {
					attributes = attributes.deflate();
				}
				extend(this.attributes, inflate(attributes, this.mappings, this));
				for (var key in attributes) {
					this.trigger('change:' + key, this.attributes[key], this);
				}
				this.trigger('change', this.attributes[key], key);
				return this;
			},
			get: function (key) {
				return this.attributes[key];
			},
			getId: function () {
				return this.attributes[this.id];
			},
			getUrl: function () {
				return this.urlRoot + (this.attributes.id ? '/' + this.attributes.id : '');
			},
			deflate: function () {
				return deflate(extend({}, this.attributes), this.mappings);
			},
			inflate: function (data) {
				return this.set(data);
			}
		});


		// apply.List
		// ----------
		var addAndTrigger = function (list, model) {
			list.list.push(model);
			list.trigger('add', model);
		};

		var removeAndTrigger = function (list, model) {
			for (var i = 0; i < list.list.length; i++) {
				if (list.list[i] === model) {
					list.list.splice(i, 1);
					list.trigger('remove', model);
				}
			}
		};

		var list = apply.List = events({
			urlRoot: '',
			mapping: apply.Model,
			init: function (list) {
				this.list = [];
				this.add(list);
			},
			size: function () {
				return this.list.length;
			},
			get: function (index) {
				return this.list[index];
			},
			add: function (list) {
				if (isArray(list)) {
					for (var key in list) {
						addAndTrigger(this, new this.mapping(list[key]));
					}
				} else if (list) {
					if (getPrototypeOf(list) === getPrototypeOf(this.mapping)) {
						addAndTrigger(this, list);
					} else if (isComposed(list)) {
						throw 'Attempted to add an incompatible model to a list.';
					} else {
						addAndTrigger(this, new this.mapping(list));
					}
				}
				return this;
			},
			remove: function (list) {
				if (!isArray(list)) {
					list = [list];
				}
				for (var key in list) {
					removeAndTrigger(this, list[key]);
				}
				return this;
			},
			getUrl: function () {
				return this.urlRoot;
			},
			deflate: function () {
				var array = [];
				for (var i = 0; i < this.list.length; i++) {
					array.push(this.list[i].deflate ? this.list[i].deflate() : this.list[i]);
				}
				return array;
			},
			inflate: function (data) {
				return this.add(data);
			}
		});


		// apply.router
		// -----------
		apply.Router = compose({
			init: function () {
				this.routes = {};
				this.current = undefined;
			},
			navigate: function (route) {
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
					fragments.apply(this, args);
				}
			},
			route: function (routes) {
				if (isString(routes)) {
					routes = {};
					if (arguments.length === 2 && isFunction(arguments[1])) {
						routes[arguments[0]] = arguments[1];
					}
				}
				try {
					for (var key in routes) {
						namespace(this.routes, key.replace(/^\//, '').replace(/\//g, '.'), routes[key]);
					}
				} catch (e) {
					console.log(e);
				}
				return this;
			}
		});

		var router = apply.router = apply.Router.singleton();


		// apply.route
		// -----------
		apply.route = proxy(router.route, router);


		// apply.toScope
		// -------------
		apply.toScope = function (scope) {
			extend(scope, apply);
		};

		return apply;
	}

	root.define('apply', function () {
		return apply || init();
	});
})(this);