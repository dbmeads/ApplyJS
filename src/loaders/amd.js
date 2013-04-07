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