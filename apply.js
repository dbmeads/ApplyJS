/*
 * Module: amd
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	var last, modules = {},
		slice = Array.prototype.slice,
		waiting = {};

	function once(func) {
		var called = false,
			result;
		return function () {
			if (!called) {
				result = func.apply(null, slice.call(arguments));
				called = true;
			}
			return result;
		};
	}

	if (typeof root.define === 'function' && root.define.amd && typeof root.require === 'function') {

	} else {
		root.define = function () {
			var dependencies, factory, module;
			for (var i = 0; i < arguments.length; i++) {
				var arg = arguments[i],
					type = typeof arg;
				if (type === 'function') {
					factory = once(arg);
				} else if (type === 'string') {
					module = arg;
				} else if (type === 'object' && arg.length) {
					dependencies = arg;
				}
			}
			resolveDependencies(factory, dependencies, module);
		};

		root.define.amd = {
			jQuery: true
		};

		root.require = function (dependencies, factory) {
			resolveDependencies(factory, dependencies);
		};
	}

	function resolveDependencies(factory, dependencies, module) {
		record(factory, dependencies, module);
		var resolved = [];
		if (dependencies) {
			for (var i = 0; i < dependencies.length; i++) {
				var dependency = dependencies[i];
				if (modules[dependency]) {
					resolved.push(modules[dependency].factory.apply(root, modules[dependency].resolved));
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

	function record(factory, dependencies, module) {
		last = {
			dependencies: dependencies,
			factory: factory,
			module: module
		};
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

	function handleResolved(factory, resolved, module) {
		if (factory.unresolved) {
			delete factory.unresolved;
		}
		factory.apply(root, resolved);
		if (module) {
			modules[module] = {
				factory: factory,
				resolved: resolved
			};
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

	function resolveURL(resource) {
		var parts = resource.split('/');
		if (parts[parts.length - 1].indexOf('.') === -1) {
			resource += '.js';
		}
		return resource;
	}

	function fetch(module) {
		var request = new root.XMLHttpRequest(),
			url = resolveURL(module);

		request.open('GET', url, false);
		request.send();

		var response = request.responseText;
		if (request.status === 200) {
			if (url.indexOf('.js') >= 0) {
				last = undefined; /*jslint evil: true */
				eval(response);
				if (last) {
					define(module, last.dependencies, last.factory);
				}
			} else {
				modules[module] = {
					factory: function () {
						return response;
					},
					resolved: []
				};
				resolveWaiting(module);
			}
		}
	}
})(this);
/*
 * Module: apply/core
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	define('apply/core', function () {
		root.apply = {};

		return root.apply;
	});
})(this);
/*
 * Module: apply/util
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	define('apply/util', ['apply/core'], function (apply) {

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

		return apply;
	});
})(this);
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
/*
 * Module: apply/events
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
define('apply/events', ['apply/construct'], function (apply) {
	'use strict';

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

	return apply;
});
/*
 * Module: apply/model
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
define('apply/model', ['apply/events'], function (apply) {
	'use strict';

	var extend = apply.extend;

	function inflate(object, mappings, parent) {
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
	}

	function deflate(object, mappings) {
		if (mappings) {
			for (var key in mappings) {
				if (object[key].deflate) {
					object[key] = object[key].deflate();
				}
			}
		}
		return object;
	}

	function defaultAttributes(model) {
		model.attributes = {};
		model.set(model.
	default);
	}

	apply.Model = apply.Events({
		id: 'id',
		urlRoot: '',
		init: function (attributes) {
			defaultAttributes(this);
			this.set(attributes);
		},
		set: function (attributes) {
			if (attributes && apply.isFunction(attributes.deflate)) {
				attributes = attributes.deflate();
			}
			extend(this.attributes, inflate(attributes, this.mappings, this));
			for (var key in attributes) {
				this.trigger('change:' + key, this.attributes[key], this);
			}
			this.trigger('change', this.attributes[key], key, this);
			return this;
		},
		setId: function (id) {
			this.attributes[this.id] = id;
			return this;
		},
		get: function (key) {
			return this.attributes[key];
		},
		getId: function () {
			return this.attributes[this.id];
		},
		clear: function () {
			var attributes = this.attributes;
			defaultAttributes(this);
			for (var key in attributes) {
				this.trigger('change:' + key, undefined, this);
				this.trigger('change', undefined, key, this);
			}
			return this;
		},
		deflate: function () {
			return deflate(extend({}, this.attributes), this.mappings);
		},
		inflate: function (data) {
			return this.set(data);
		}
	});

	return apply;
});
/*
 * Module: apply/list
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
define('apply/list', ['apply/events', 'apply/model'], function (apply) {
	'use strict';

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

	var list = apply.List = apply.Events({
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
			if (apply.isArray(list)) {
				for (var key in list) {
					addAndTrigger(this, new this.mapping(list[key]));
				}
			} else if (list) {
				if (apply.getPrototypeOf(list) === apply.getPrototypeOf(this.mapping)) {
					addAndTrigger(this, list);
				} else if (apply.isComposed(list)) {
					throw 'Attempted to add an incompatible model to a list.';
				} else {
					addAndTrigger(this, new this.mapping(list));
				}
			}
			return this;
		},
		remove: function (list) {
			if (!apply.isArray(list)) {
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

	return apply;
});
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
/*
 * Module: apply/validation
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
define('apply/validation', ['apply/model'], function (apply) {
	'use strict';


	var validations = {
		'required': function (value) {
			if (value && (apply.isObject(value) || (value.length && value.length > 0))) {
				return true;
			}
			return false;
		}
	};

	apply.namespace('apply.mixins.validation', {
		validate: function () {
			if (this.validation) {
				for (var field in this.validation) {
					var rules = this.validation[field];
					for (var i = 0; i < rules.length; i++) {
						if (validations[rules[i]] && !validations[rules[i]].call(this, this.attributes[field])) {
							return false;
						}
					}
				}
			}
			return true;
		}
	});

	return apply;
});
/*
 * Module: apply/router
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
define('apply/router', ['apply/util', 'apply/construct'], function (apply) {
	'use strict';

	var slice = [].slice;

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
			var args = [];
			return this.invoke(this.parse(route, args), args.concat(slice.call(arguments, 1)));
		},
		parse: function (route, args) {
			var parts = route.replace(/^#?\/?/, '').split('/');
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
			return fragments;
		},
		invoke: function (callback, args) {
			if (apply.isFunction(callback)) {
				callback.apply(this, args);
				return true;
			}
			return false;
		}
	});

	apply.router = apply.Router.instance();


	return apply;
});
/*
 * Module: apply
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
define('apply', ['apply/construct', 'apply/core', 'apply/events', 'apply/list', 'apply/logger', 'apply/model', 'apply/router', 'apply/util'], function (apply) {
	'use strict';

	return apply;
});
/*
 * Module: apply.web
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	define('apply/web', ['jquery', 'apply'], function ($, apply) {

		// On Loan
		// -------
		var extend = $.extend;
		var proxy = $.proxy;
		var when = $.when;


		// apply.dependency
		// ----------------
		var resources = {};

		var outstanding = {
			deferreds: [],
			add: function (deferred) {
				this.deferreds.push(deferred);
				return deferred;
			},
			wait: function (callback) {
				var deferred = when.apply($, this.deferreds);
				if (callback) {
					deferred.then(callback);
				}
				return deferred;
			}
		};

		var dependency = apply.dependency = function (resource, promise) {
			if (!resources[resource]) {
				var deferred = outstanding.add($.ajax({
					url: resource
				}));
				if (apply.string.endsWith(resource, '.js')) {
					deferred.then(function (source) { /*jslint evil: true */
						return eval(source);
					});
				}
				resources[resource] = deferred;
			}
			return resources[resource].promise(promise);
		};

		apply.dependencies = function () {
			var deferreds = [];
			apply.loop(arguments, function (resource) {
				deferreds.push(dependency(resource));
			});
			return when(deferreds);
		};

		dependency.wait = proxy(outstanding.wait, outstanding);


		// apply.ready
		// -----------
		apply.ready = function (callback) {
			dependency.wait(callback);
		};


		// apply.Rest
		// ----------
		var wrapAjax = function (context) {
			var deferred = $.Deferred();
			var options = {};
			for (var i = 1; i < arguments.length; i++) {
				if (arguments[i]) {
					if (apply.isFunction(arguments[i])) {
						deferred.then(arguments[i]);
					} else if (arguments[i].success) {
						deferred.then(arguments[i].success);
						delete arguments[i].success;
					}
					extend(options, arguments[i]);
				}
			}
			when($.ajax(options)).then(function (response) {
				handleResponse(context, response, options);
				deferred.resolve(context, response, options);
			});
			return deferred.promise();
		};

		var handleResponse = function (context, response, options) {
			if (options.type === 'GET') {
				if (apply.isFunction(context.inflate)) {
					context.inflate(context.parse(response));
				} else {
					extend(context, response);
				}
			}
		};

		apply.namespace('apply.mixins.rest', {
			save: apply.delegateToParent('save', function (options) {
				return wrapAjax(this, {
					contentType: this.contentType,
					data: this.toString(),
					type: this.getId && this.getId() ? 'PUT' : 'POST',
					url: this.getUrl()
				}, options);
			}),
			fetch: apply.delegateToParent('fetch', function (options) {
				return wrapAjax(this, {
					url: this.getUrl(),
					type: 'GET'
				}, options);
			}),
			destroy: apply.delegateToParent('destroy', function (options) {
				return wrapAjax(this, {
					url: this.getUrl(),
					type: 'DELETE'
				}, options);
			}),
			getUrl: function () {
				return this.urlRoot + ((this.getId && this.getId()) ? '/' + this.getId() : '');
			},
			toString: function () {
				return JSON.stringify(this.deflate ? this.deflate() : this);
			},
			parse: function (data) {
				return data;
			},
			contentType: 'application/json'
		});

		apply.namespace('apply.rest', {
			List: apply.List(apply.mixins.rest),
			Model: apply.Model(apply.mixins.rest)
		});


		// apply.View
		// ----------
		var div = '<div></div>';

		var preventDefault = function (callback) {
			return function (event) {
				event.preventDefault();
				return callback.apply(this, arguments);
			};
		};

		var bind = function ($el, events, context) {
			for (var key in events) {
				var event = key.split(' ').shift();
				var callback = events[key];
				if (event === 'submit') {
					callback = preventDefault(callback);
				}
				$el.on(event, key.replace(event, ''), proxy(callback, context));
			}
		};

		var peel = function (prototype, source) {
			if (source) {
				var $el = $(source);
				if ($el.size() > 1) {
					throw (prototype.resource ? prototype.resource : 'All view source') + ' must have a single root element.';
				}
				prototype.template = prototype.compile($el.html());
				prototype.rootHtml = $(div).html($el.empty()).html();
			} else {
				prototype.template = prototype.compile('');
			}
		};

		var renderDataElement = function (context, el, data, deflatedData) {
			var $el = $(el);
			var key = $el.attr('data');
			context.set($el, apply.namespace(deflatedData, key));
			if (data.on) {
				data.on('change:' + key, function (value) {
					context.set($el, value);
				});
			}
			if ($el.is('input') || $el.is('textarea')) {
				$el.on('change', function (ev) {
					var value = $el.val();
					if (data.set) {
						var attributes = {};
						attributes[key] = value;
						data.set(attributes);
					} else {
						data[key] = value;
					}
				});
			}
		};

		var dataBinding = {
			render: function () {
				var that = this;
				if (!this.data) {
					this.data = new apply.Model();
				}
				var data = this.data;
				var deflatedData = data;
				if (data.deflate) {
					deflatedData = data.deflate();
				}
				if (this.$el.attr('data')) {
					renderDataElement(this, this.$el, data, deflatedData);
				}
				this.$el.find('[data]').each(function (index, el) {
					renderDataElement(that, el, data, deflatedData);
				});
				return this.$el;
			},
			set: function ($el, value) {
				if ($el.is('input') || $el.is('textarea')) {
					if ($el.val() !== value) {
						$el.val(value);
					}
				} else {
					if ($el.text() !== value) {
						$el.text(value);
					}
				}
			}
		};

		var view = apply.View = apply.compose({
			urlRoot: '',
			rootHtml: div,
			bind: function () {
				bind(this.$el, this.events, this);
			},
			init: function (options) {
				options = options || {};
				if (options.data) {
					this.data = options.data;
				}
			},
			template: function () {
				return '';
			},
			render: function () {
				if (!this.template) {
					throw 'Please wait for ' + this.resource + ' before rendering.';
				}
				if (!this.$el) {
					this.$el = $(this.rootHtml);
				}
				if (this.events) {
					this.bind();
				}
				return this.$el.html(this.template(this.data));
			},
			compile: function (source) {
				return function () {
					return source || '';
				};
			}
		}, dataBinding).composer(function () {
			var prototype = this.prototype;
			if (prototype.resource) {
				delete prototype.template;
				apply.dependency(prototype.urlRoot + prototype.resource).promise(this);
				this.done(function (source) {
					peel(prototype, source);
				});
			} else {
				peel(prototype, prototype.source);
			}
		}).cascade('render');


		// apply.mixins
		// -------------
		apply.namespace('apply.mixins.view', {
			dataBinding: dataBinding,
			renderer: {
				dynamic: {
					attachTo: '',
					render: function (view) {
						var $el = this.$el;
						if (view) {
							if (this.attachTo) {
								$el.find(this.attachTo).html(view.render());
							} else {
								$el.html(view.render());
							}
						}
						return $el;
					}
				},
				children: {
					children: {},
					render: function (children) {
						var $el = this.$el;
						for (var key in this.children) {
							var $attachTo = $el.find(key).empty();
							if ($attachTo.size() === 0 && $el.is(key)) {
								$attachTo = $el;
							}
							var views = this.children[key];
							if (apply.isArray(views)) {
								for (var i = 0; i < views.length; i++) {
									$attachTo.append(views[i].render());
								}
							} else {
								$attachTo.append(views.render());
							}
						}
						return $el;
					}
				},
				list: {
					itemView: view,
					render: function () {
						var $el = this.$el;
						var $attachTo = $el;
						if (this.attachTo) {
							$attachTo = $el.find(this.attachTo);
						}
						var ItemView = this.itemView;
						var data = this.data || [];
						if (data.list) {
							data = data.list;
						}
						$.each(data, function (index, value) {
							$attachTo.append(new ItemView({
								data: value
							}).render());
						});
						return $el;
					}
				}
			}
		});


		// apply.Router.Web
		// ----------------
		apply.Router.Web = apply.Router({
			init: function () {
				this.current = undefined;
			},
			check: function () {
				if (root.location.hash !== this.current) {
					var route = this.current = root.location.hash;
					this.route(route);
				}
			},
			route: function (route) {
				root.location.hash = route;
			},
			start: function (options) {
				options = options || {};
				var callback = proxy(this.check, this);
				this.iid = setInterval(callback, options.interval || 50);
				return this;
			},
			stop: function () {
				clearInterval(this.iid);
				delete this.iid;
			}
		}).cascade('route', true);

		apply.router = new apply.Router.Web();

		return apply;
	});
})(this);