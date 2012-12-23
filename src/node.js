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
                        factory:factory,
                        dependencies:dependencies,
                        module:module
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
            console.log('Adding module '+module);
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
        } catch(error) {

        }
    }
})(this);