/*
 * Module: node
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
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
		if (module) {
			console.log('resolving: ' + module);
		}
		resolveDependencies(factory, dependencies, module);
	};

	function resolveDependencies(factory, dependencies, module) {
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

	function fetch(module) {
		try {
			var result = require(module);
			modules[module] = {
				factory: function () {
					return result;
				},
				resolved: []
			};
			resolveWaiting(module);
		} catch (e) {
			console.log(e);
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
/*
 * Module: apply/construct
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	function module(apply) {
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
	}

	define('apply/construct', ['apply/util'], function (apply) {
		return apply.module(module);
	});
})(this);
/*
 * Module: apply/events
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function () {
	'use strict';

	function module(apply) {
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

	define('apply/events', ['apply/construct'], function (apply) {
		return apply.module(module);
	});
})();
/*
 * Module: apply/list
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	function module(apply) {
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
	}

	define('apply/list', ['apply/events', 'apply/model'], function (apply) {
		return apply.module(module);
	});

})(this);
/*
 * Module: apply/logger
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	function module(apply) {
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

		var logger = apply.logger = Logger.instance();
	}

	define('apply/logger', ['apply/construct'], function (apply) {
		return apply.module(module);
	});

})(this);
/*
 * Module: apply/model
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	function module(apply) {
		var extend = apply.extend;

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

		var model = apply.Model = apply.Events({
			id: 'id',
			urlRoot: '',
			init: function (attributes) {
				this.attributes = {};
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
	}

	define('apply/model', ['apply/events'], function (apply) {
		return apply.module(module);
	});

})(this);
/*
 * Module: apply/validation
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	function module(apply) {

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
	}

	define('apply/validation', ['apply/model'], function (apply) {
		return apply.module(module);
	});
})(this);
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
/*
 * Module: apply
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	define('apply', ['apply/construct', 'apply/core', 'apply/events', 'apply/list', 'apply/logger', 'apply/model', 'apply/router', 'apply/util'], function (apply) {
		return apply;
	});

})(this);
/*
 * Module: apply.mongo
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	function module(apply, mongodb) {

		var url = function (model) {
			return 'mongodb://' + model.host + ':' + model.port + '/' + model.db;
		};

		var collection = function (model, callback) {
			mongodb.MongoClient.connect(url(model), function (err, db) {
				db.collection(model.collection, function (err, coll) {
					callback.call(this, coll, model);
				});
			});
		};

		var error = function (model, err, options) {
			if (err && options.error) {
				options.error.call(err, model);
				return true;
			}
			return false;
		};

		apply.namespace('apply.mixins.mongo', {
			init: function () {
				if (!this.db || !this.collection) {
					throw 'All mongoDB models must have a db and collection declared.';
				}
			},
			host: 'localhost',
			port: 27017,
			save: function (options) {
				collection(this, function (coll, model) {
					coll.insert(model.deflate(), function (err, data) {
						if (!error(this, err, options)) {
							if (options.success) {
								options.success.call(this, model.set(data[0]));
							}
						}
					});
				});
			},
			fetch: function (options) {
				collection(this, function (coll, model) {
					coll.findOne(model.deflate(), function (err, data) {
						if (!error(this, err, options)) {
							if (options.success) {
								options.success.call(this, model.inflate(data));
							}
						}
					});
				});
			},
			destroy: function (options) {
				collection(this, function (coll, model) {
					coll.remove(this.deflate(), function (err) {
						if (!error(this, err, options)) {
							if (options.success) {
								options.success.call(this, model);
							}
						}
					});
				});
			},
			toString: function () {
				return JSON.stringify(this.deflate ? this.deflate() : this);
			}
		});

		apply.namespace('apply.mongo.Model', apply.Model(apply.mixins.mongo, {
			id: '_id'
		}));
	}

	define('apply/mongo', ['apply', 'mongodb'], function (apply, mongodb) {
		return apply.module(module, mongodb);
	});
})(this);