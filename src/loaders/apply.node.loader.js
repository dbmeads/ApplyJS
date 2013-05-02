/*
 * Module: node
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	var modules = {},
		slice = Array.prototype.slice,
		waiting = {},
		path = require('path');

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

	root.define = GLOBAL.define = function () {
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
		if (module) {
			console.log('resolving: ' + module);
		}
		resolveDependencies(factory, dependencies, module);
	};

	function resolveDependencies(factory, dependencies, module) {
		var resolved = [];
		if (dependencies) {
			for (var i = 0; i < dependencies.length; i++) {
				var dependency = dependencies[i] = path.normalize(dependencies[i]);
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