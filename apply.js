/*
 * Module: apply
 * Copyright 2012 David Meads
 * Released under the MIT license
 */

(function (root, $, undefined) {
	'use strict';

	var apply = root.apply = function ($, apply) {

		// On Loan
		// -------
		var extend = $.extend;
		var proxy = $.proxy;
		var push = Array.prototype.push;
		var slice = Array.prototype.slice;
		var when = $.when;

		apply.abstraction = {
			extend: extend,
			proxy: proxy,
			when: when
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


		// apply.Crud
		// ----------
		var delegateOrHandle = function (method, callback) {
			return function () {
				if (this.parent && this.parent[method]) {
					return this.parent[method].apply(this.parent, arguments);
				}
				return callback.apply(this, arguments);
			};
		};

		var wrapAjax = function (context) {
			var deferred = $.Deferred();
			var options = {};
			for (var i = 1; i < arguments.length; i++) {
				if (arguments[i]) {
					if (isFunction(arguments[i])) {
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
				if (isFunction(context.inflate)) {
					context.inflate(context.parse(response));
				} else {
					extend(context, response);
				}
			}
		};

		var crud = apply.Crud = events({
			save: delegateOrHandle('save', function (options) {
				return wrapAjax(this, {
					contentType: this.contentType,
					data: this.toString(),
					type: this.getId && this.getId() ? 'PUT' : 'POST',
					url: this.getUrl()
				}, options);
			}),
			fetch: delegateOrHandle('fetch', function (options) {
				return wrapAjax(this, {
					url: this.getUrl(),
					type: 'GET'
				}, options);
			}),
			destroy: delegateOrHandle('destroy', function (options) {
				return wrapAjax(this, {
					url: this.getUrl(),
					type: 'DELETE'
				}, options);
			}),
			toString: function () {
				return JSON.stringify(this.deflate ? this.deflate() : this);
			},
			parse: function (response) {
				return response;
			},
			contentType: 'application/json'
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

		var model = apply.Model = crud({
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

		var list = apply.List = crud({
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
			compile: function (routes) {
				try {
					for (var key in routes) {
						namespace(this.routes, key.replace(/^\//, '').replace('\/', '.'), routes[key]);
					}
				} catch (e) {
					console.log(e);
				}
			},
			route: function (routes) {
				this.compile(routes);
				if (!this.iid && this.autostart) {
					this.start();
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
	};

	if ($) {
		apply($, apply);
	}

})(this, this.jQuery);
/*
 * Module: apply.web
 * Copyright 2012 David Meads
 * Released under the MIT license
 */

(function (root, undefined) {
	'use strict';

	function init($, apply, root) {

		// On Loan
		// -------
		var proxy = apply.abstraction.proxy;
		var when = apply.abstraction.when;


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
				var event = key.split(' ').pop();
				var callback = events[key];
				if (event === 'submit') {
					callback = preventDefault(callback);
				}
				$el.on(event, key.replace(event, ''), proxy(callback, context));
			}
		};

		var setupRootEl = function (context) {
			context.$el = $(context.rootHtml);
			if (context.events) {
				bind(context.$el, context.events, context);
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
					setupRootEl(this);
				}
				return this.$el.html(this.template(this.data));
			},
			compile: function (source) {
				return function () {
					return source || '';
				};
			}
		}, dataBinding).generator(function () {
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
		apply.mixins = {
			view: {
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
			}
		};


		// apply.Router.Web
		// ----------------
		apply.Router.Web = apply.Router({
			autostart: true,
			check: function () {
				if (root.location.hash !== this.current) {
					var route = this.current = root.location.hash;
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
				}
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
		});

		var router = apply.router = root.document ? apply.Router.Web.singleton() : apply.Router.singleton();


		// apply.route
		// -----------
		apply.route = proxy(router.route, router);

		return apply;
	}

	if (root.jQuery) {
		init(root.jQuery, root.apply, root);
	}

})(this);