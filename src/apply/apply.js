/*global window, document, jQuery, Zepto, setInterval, clearInterval */

(function ($) {
    'use strict';

    var Apply = {};


    // Apply.util
    // ----------

    var getPrototypeOf = function (obj) {
        if (obj) {
            if (isFunction(obj)) {
                return obj.prototype;
            }
            return Object.getPrototypeOf(obj);
        }
    };

    var isArray = function (obj) {
        return getPrototypeOf(obj) === Array.prototype;
    };

    var isFunction = function (obj) {
        return typeof obj === 'function';
    };

    var isMixin = function (obj) {
        if (isFunction(obj)) {
            return obj.mixin !== undefined;
        }
        var prototype = getPrototypeOf(obj);
        if (prototype.constructor) {
            return prototype.constructor.mixin !== undefined;
        }
        return false;
    };

    var isNumeric = function (obj) {
        return typeof  obj === 'number';
    };

    var isString = function (obj) {
        return typeof obj === 'string';
    };

    var ajax = function (url, type, options) {
        return $.ajax($.extend(options || {}, {
            url:url,
            type:type || 'GET'
        }));
    };

    var endsWith = function (string, suffix) {
        return string.indexOf(suffix) === string.length - suffix.length;
    };

    Apply.util = {
        ajax:ajax,
        getPrototypeOf:getPrototypeOf,
        isArray:isArray,
        isFunction:isFunction,
        isMixin:isMixin,
        isNumeric:isNumeric,
        isString:isString,
        string:{
            endsWith:endsWith
        }
    };


    // Apply.dependency
    // ----------------

    var resources = {};

    var outstanding = {
        deferreds:[],
        add:function (deferred) {
            this.deferreds.push(deferred);
            return deferred;
        },
        wait:function (callback) {
            var deferred = $.when.apply($, this.deferreds);
            if (callback) {
                deferred.then(callback);
            }
            return deferred;
        }
    };

    var dependency = Apply.dependency = function (resource, callback) {
        if (resources[resource]) {
            resources[resource].then(callback);
        } else {
            var deferred = outstanding.add(ajax(resource));
            if (endsWith(resource, '.js')) {
                deferred.then(function (source) {
                    /*jslint evil: true */
                    return eval(source);
                });
            }
            resources[resource] = deferred.then(callback);
        }
        return resources[resource].promise();
    };

    dependency.wait = $.proxy(outstanding.wait, outstanding);


    // Apply.namespace
    // ---------------

    var namespace = Apply.namespace = function (namespace, object) {
        var obj = window;
        if (namespace) {
            var parts = namespace.split('.');
            for (var i = 0; i < parts.length; i++) {
                if (i === parts.length - 1) {
                    obj[parts[i]] = object;
                } else if (!obj[parts[i]]) {
                    obj[parts[i]] = {};
                }
                obj = obj[parts[i]];
            }
        }
        return obj;
    };


    // Apply.mixin
    // -----------

    var invoke = function (chain, args, context) {
        for (var i = 0; i < chain.length; i++) {
            chain[i].apply(context, args);
        }
    };

    var chain = function (objects, funcName) {
        var chain = [];
        for (var i = 0; i < objects.length; i++) {
            if (objects[i][funcName]) {
                chain.push(objects[i][funcName]);
            }
        }
        return function () {
            invoke(chain, arguments, this);
        };
    };

    var mixinArgs = function (constructor, oldArguments) {
        var args = $.makeArray(oldArguments);
        return isString(args[0]) ? [ args.shift(), constructor ].concat(args)
            : [ constructor ].concat(args);
    };

    var mixinConstructor = function () {
        var constructor = function () {
            if (!this || this.constructor !== constructor) {
                return mixin.apply(this || {}, mixinArgs(constructor, arguments));
            }
            if (this.init) {
                this.init.apply(this, arguments);
            }
        };
        constructor.mixin = function () {
            return mixin.apply(this, mixinArgs(constructor, arguments));
        };
        constructor.singleton = function () {
            return singleton.apply(this, mixinArgs(constructor, arguments));
        };
        constructor.merge = function (object) {
            $.extend(constructor.prototype, object);
        };
        return constructor;
    };

    var mixin = Apply.mixin = function () {
        var mixins = [];
        var constructor = mixinConstructor();
        var args = $.makeArray(arguments);
        var ns;
        if (isString(args[0])) {
            ns = args.shift();
        }
        for (var i = 0; i < args.length; i++) {
            var mixin = isFunction(args[i]) ? args[i].prototype : args[i];
            $.extend(constructor.prototype, mixin);
            mixins.push(mixin);
        }
        constructor.prototype.init = chain(mixins, 'init');
        if (ns) {
            namespace(ns, constructor);
        }
        return constructor;
    };


    // Apply.singleton
    // ---------------

    var singleton = Apply.singleton = function () {
        var ns;
        var args = $.makeArray(arguments);
        if (isString(args[0])) {
            ns = args.shift();
        }
        var instance = new (mixin.apply(this, args))();
        if (ns) {
            namespace(ns, instance);
        }
        return instance;
    };


    // Apply.Events
    // ------------

    var events = Apply.Events = mixin({
        init:function () {
            if (!this.events) {
                this.events = {};
            }
        },
        on:function (event, callback, context) {
            var callbacks = this.events[event];
            if (!callbacks) {
                callbacks = this.events[event] = [];
            }
            if (context) {
                callback = $.proxy(callback, context);
            }
            callbacks.push(callback);
        },
        trigger:function (event) {
            var callbacks = this.events[event];
            if (callbacks) {
                var args = $.makeArray(arguments);
                args.shift();
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i].apply(this, args);
                }
            }
        }
    });


    // Apply.Crud
    // ----------

    var delegateOrHandle = function (method, callback) {
        return function () {
            if (this.parent && this.parent[method]) {
                return this.parent[method].apply(this.parent, arguments);
            }
            return callback.apply(this, arguments);
        };
    };

    var crud = Apply.Crud = events({
        save:delegateOrHandle('save', function (options) {
            return ajax(this.getUrl(), this.getId && this.getId() ? 'PUT' : 'POST', $
                .extend(options, {
                    data:this.toString(),
                    contentType:this.contentType
                }));
        }),
        fetch:delegateOrHandle('fetch', function (options) {
            return ajax(this.getUrl(), 'GET', options).then($.proxy(this.inflate, this));
        }),
        destroy:delegateOrHandle('destroy', function (options) {
            return ajax(this.getUrl(), 'DELETE', options);
        }),
        toString:function () {
            return JSON.stringify(this.deflate ? this.deflate() : this);
        },
        parse:function (response) {
            return response;
        },
        contentType:'application/json'
    });


    // Apply.Model
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

    var model = Apply.Model = crud({
        id:'id',
        urlRoot:'',
        init:function (attributes) {
            this.attributes = {};
            this.set(attributes);
        },
        set:function (attributes) {
            $.extend(this.attributes, inflate(attributes, this.mappings, this));
            for (var key in attributes) {
                this.trigger('change:' + key, this.attributes[key], this);
            }
            this.trigger('change', this);
            return this;
        },
        get:function (key) {
            return this.attributes[key];
        },
        getId:function () {
            return this.attributes[this.id];
        },
        getUrl:function () {
            return this.urlRoot + (this.attributes.id ? '/' + this.attributes.id : '');
        },
        deflate:function () {
            return deflate($.extend({}, this.attributes), this.mappings);
        },
        inflate:function (data) {
            return this.set(data);
        }
    });


    // Apply.List
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

    var list = Apply.List = crud({
        urlRoot:'',
        mapping:Apply.Model,
        init:function (list) {
            this.list = [];
            this.add(list);
        },
        size:function () {
            return this.list.length;
        },
        get:function (index) {
            return this.list[index];
        },
        add:function (list) {
            if (isArray(list)) {
                for (var key in list) {
                    addAndTrigger(this, new this.mapping(list[key]));
                }
            } else if (list) {
                if (getPrototypeOf(list) === getPrototypeOf(this.mapping)) {
                    addAndTrigger(this, list);
                } else if (isMixin(list)) {
                    throw 'Attempted to add an incompatible model to a list.';
                } else {
                    addAndTrigger(this, new this.mapping(list));
                }
            }
            return this;
        },
        remove:function (list) {
            if (!isArray(list)) {
                list = [list];
            }
            for (var key in list) {
                removeAndTrigger(this, list[key]);
            }
            return this;
        },
        getUrl:function () {
            return this.urlRoot;
        },
        deflate:function () {
            var array = [];
            for (var i = 0; i < this.list.length; i++) {
                array.push(this.list[i].deflate ? this.list[i].deflate() : this.list[i]);
            }
            return array;
        },
        inflate:function (data) {
            return this.add(data);
        }
    });


    // Apply.View
    // ----------

    var bind = function ($el, events) {
        for (var key in events) {
            var event = key.split(' ').pop();
            $el.on(event, key.replace(event, ''), $.proxy(events[key], this));
        }
    };

    var view = Apply.View = mixin({
        urlRoot:'',
        template:function () {
            return '<div></div>';
        },
        init:function () {
            if (this.resource) {
                dependency(this.urlRoot + this.resource, $.proxy(function (source) {
                    this.template = this.compile(source);
                }, this));
            }
        },
        render:function () {
            var $el = $(this.template(this.data));
            if (this.events) {
                bind($el, this.events);
            }
            if (this.$el) {
                this.$el.replaceWith($el);
            }
            return (this.$el = $el);
        },
        compile:function (source) {
            return function () {
                return source;
            };
        }
    });


    // Apply.router
    // -----------

    var router = Apply.router = new (mixin({
        init: function() {
            this.routes = {};
            this.current = undefined;
        },
        check:function () {
            if (window.location.hash !== this.current) {
                var route = this.current = window.location.hash;
                if (route.indexOf('#') === 0) {
                    route = route.substr(1);
                }
                if (this.routes[route]) {
                    this.routes[route]();
                }
            }
        },
        route:function (routes) {
            $.extend(this.routes, routes);
            if (!this.iid) {
                this.start();
            }
            return this;
        },
        start:function (options) {
            options = options || {};
            var callback = $.proxy(this.check, this);
            this.iid = setInterval(callback, options.interval || 50);
            return this;
        },
        stop:function () {
            clearInterval(this.iid);
            delete this.iid;
        }
    }))();


    // Apply.route
    // -----------

    Apply.route = $.proxy(router.route, router);


    // Apply.ready
    // -----------

    Apply.ready = function (callback) {
        $(document).ready(function () {
            dependency.wait(callback);
        });
    };


    // Apply.toScope
    // -------------

    Apply.toScope = function (scope) {
        $.extend(scope, Apply);
    };


    // Apply.library
    // -------------

    Apply.library = {};

    Apply.library.renderers = {
        child:{
            attachTo:'',
            render:function (view) {
                var $el = Apply.View.prototype.render.call(this);
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
        children:{
            children:{},
            render:function (children) {
                var $el = Apply.View.prototype.render.call(this);
                for (var key in this.children) {
                    var $attachTo = $el.find(key).empty();
                    var views = this.children[key];
                    for (var i = 0; i < views.length; i++) {
                        $attachTo.append(views[i].render());
                    }
                }
                return $el;
            }
        },
        list:{
            attachTo:'',
            itemView:view,
            render:function (data) {
                var $el = Apply.View.prototype.render.call(this);
                var $attachTo = $el.find(this.attachTo);
                var ItemView = this.itemView;
                data = data || this.data || [];
                $.each(data, function (index, value) {
                    $attachTo.append(new ItemView({
                        data:value
                    }).render());
                });
                return $el;
            }
        }
    };

    window.Apply = Apply;

})(jQuery || Zepto);