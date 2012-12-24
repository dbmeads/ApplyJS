/*
 * Module: apply.web
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	var defined = false;

	function module($, apply) {
		if (!defined) {
			defined = true;

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


			// apply.Crud
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

			var crud = apply.Crud = apply.Events({
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
				toString: function () {
					return JSON.stringify(this.deflate ? this.deflate() : this);
				},
				parse: function (response) {
					return response;
				},
				contentType: 'application/json'
			});

			apply.List = apply.List(crud);
			apply.Model = apply.Model(crud);


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
				init: function () {
					this.current = undefined;
				},
				check: function () {
					if (root.location.hash !== this.current) {
						var route = this.current = root.location.hash;
						this.route(route);
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

			var router = apply.router = new apply.Router.Web();
		}

		return apply;
	}

	define('apply/web', ['jquery', 'apply'], function ($, apply) {
		return module($, apply);
	});

})(this);