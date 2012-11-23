/*global window, document, jQuery, Zepto, setInterval, clearInterval */

(function ($) {
    'use strict';

    var Apply = {};


    // On Loan
    // -------

    var slice = Array.prototype.slice;
    var push = Array.prototype.push;
    var proxy = $.proxy;
    var extend = $.extend;
    var when = $.when;


    // Apply.util
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

    var isNumber = function (obj) {
        return typeof  obj === 'number';
    };

    var isObject = function (obj) {
        return typeof obj === 'object';
    };

    var isString = function (obj) {
        return typeof obj === 'string';
    };

    var ajax = function (url, type, options) {
        return $.ajax(extend(options || {}, {
            url:url,
            type:type || 'GET'
        }));
    };

    Apply.util = {
        getPrototypeOf:getPrototypeOf,
        isArray:isArray,
        isFunction:isFunction,
        isMixin:isMixin,
        isNumber:isNumber,
        isObject:isObject,
        isString:isString
    };


    // Apply.collection
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

    Apply.collection = {
        last:last,
        loop:loop
    };


    // Apply.string
    // ------------

    var numeric = /^(0|[1-9][0-9]*)$/;

    var isNumeric = function (string) {
        return numeric.test(string);
    };

    var endsWith = function (string, suffix) {
        return string.indexOf(suffix) === string.length - suffix.length;
    };

    Apply.string = {
        endsWith:endsWith,
        isNumeric:isNumeric
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
            var deferred = when.apply($, this.deferreds);
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

    dependency.wait = proxy(outstanding.wait, outstanding);


    // Apply.namespace
    // ---------------

    var namespace = Apply.namespace = function () {
        var args = slice.apply(arguments);
        var obj = window;
        if (!isString(args[0])) {
            obj = args.shift();
            if (!obj) {
                throw 'Attempting to extend/access "' + args[0] + '" on an undefined namespace.';
            }
        }
        var namespace = args[0], object = args[1];
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


    // Apply.cascade
    // -------------

    var cascade = Apply.cascade = function (objects, funcName, reverse) {
        var cascades = [];
        loop(objects, function (object) {
            if (object[funcName]) {
                cascades.push(object[funcName]);
            }
        }, {reverse:reverse});
        if (cascades.length) {
            return function () {
                var result;
                var args = slice.apply(arguments);
                loop(cascades, function (cascade) {
                    result = cascade.apply(this, args);
                }, {context:this});
                return result;
            };
        }
    };


    // Apply.mixin
    // -----------

    var mixinArgs = function (constructor, oldArguments) {
        var args = slice.apply(oldArguments);
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
        constructor.cascade = function (funcName) {
            namespace(constructor, 'cascades.' + funcName, arguments);
            var cascaded = cascade.apply(this, [this.mixins].concat(slice.apply(arguments)));
            if (cascaded) {
                constructor.prototype[funcName] = cascaded;
            }
            return constructor;
        };
        constructor.singleton = function () {
            if (arguments.length === 1 && isString(arguments[0])) {
                return singleton.apply(this, arguments);
            } else if (arguments.length === 0) {
                return singleton.call(this);
            }
            return singleton.apply(this, mixinArgs(constructor, arguments));
        };
        constructor.merge = function (object) {
            extend(constructor.prototype, object);
            return constructor;
        };
        constructor.mixins = [];
        constructor.mixin = function () {
            return mixin.apply(this, mixinArgs(constructor, arguments));
        };
        constructor.callbacks = [];
        constructor.construct = function (callback) {
            if (callback) {
                constructor.callbacks.push(callback);
            }
            return constructor;
        };
        return constructor;
    };

    var mixinCascades = function (constructor, cascades) {
        constructor.cascades = cascades;
        for (var key in cascades) {
            constructor.cascade.apply(constructor, cascades[key]);
        }
    };

    var mixin = Apply.mixin = function () {
        var cascades = {'init':['init']};
        var constructor = mixinConstructor();
        var args = slice.apply(arguments);
        var ns;
        if (isString(args[0])) {
            ns = args.shift();
        }
        var mixin;
        for (var i = 0; i < args.length; i++) {
            mixin = args[i];
            if (isFunction(mixin)) {
                extend(cascades, mixin['cascades']);
                if (mixin.callbacks) {
                    push.apply(constructor.callbacks, mixin.callbacks);
                }
                mixin = mixin.prototype;
            }
            extend(constructor.prototype, mixin);
            constructor.mixins.push(mixin);
        }
        mixinCascades(constructor, cascades);
        loop(constructor.callbacks, function (callback) {
            callback.call(constructor, constructor);
        });
        if (ns) {
            namespace(ns, constructor);
        }
        return constructor;
    };


    // Apply.singleton
    // ---------------

    var singleton = Apply.singleton = function () {
        var ns;
        var args = slice.apply(arguments);
        if (isString(args[0])) {
            ns = args.shift();
        }
        var Constructor = this;
        if (args.length > 0) {
            Constructor = mixin.apply(this, args);
        }
        var singleton = new Constructor();
        if (ns) {
            namespace(ns, singleton);
        }
        return singleton;
    };


    // Apply.logger
    // ------------

    var addLoggers = function () {
        loop(arguments, function(level) {
            this[level] = function (message) {
                return this.log({level:level, message:message});
            };
        }, {context:this});
    };

    var Logger = Apply.Logger = mixin({
        init:function () {
            this.levels = {};
            this.config({debug:true, info:true, warning:true, error:true});
        },
        config:function (levels) {
            extend(this.levels, levels);
            for (var key in levels) {
                if (!this[key]) {
                    addLoggers.call(this, key);
                }
            }
        },
        log:function (options) {
            var level = options.level;
            if (level && this.levels[level] && options.message) {
                console.log(options.message);
            }
            return this;
        }
    }).cascade('log', true);

    var logger = Apply.logger = Logger.singleton();


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
                callback = proxy(callback, context);
            }
            callbacks.push(callback);
        },
        trigger:function (event) {
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
            return ajax(this.getUrl(), 'GET', options).then(proxy(this.inflate, this));
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
            extend(this.attributes, inflate(attributes, this.mappings, this));
            for (var key in attributes) {
                this.trigger('change:' + key, this.attributes[key], this);
            }
            this.trigger('change', this.attributes[key], key);
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
            return deflate(extend({}, this.attributes), this.mappings);
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

    var div = '<div></div>';

    var bind = function ($el, events) {
        for (var key in events) {
            var event = key.split(' ').pop();
            $el.on(event, key.replace(event, ''), proxy(events[key], this));
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

    var view = Apply.View = mixin({
        urlRoot:'',
        rootHtml:div,
        init:function (options) {
            options = options || {};
            this.data = options.data;
            if (this.events) {
                bind(this.$el, this.events);
            }
        },
        template:function () {
            return '';
        },
        render:function () {
            if (!this.template) {
                throw 'Please wait for ' + this.resource + ' before rendering.';
            }
            if (!this.$el) {
                this.$el = $(this.rootHtml);
            }
            return this.$el.html(this.template(this.data));
        },
        compile:function (source) {
            return function () {
                return source || '';
            };
        }
    }).construct(function () {
            var prototype = this.prototype;
            if (prototype.resource) {
                delete prototype.template;
                this.deferred = dependency(prototype.urlRoot + prototype.resource, function (source) {
                    peel(prototype, source);
                });
            } else {
                peel(prototype, prototype.source);
            }
        }).cascade('render');


    // Apply.router
    // -----------

    var router = Apply.router = mixin({
        autostart:true,
        init:function () {
            this.routes = {};
            this.current = undefined;
        },
        compile:function (routes) {
            try {
                for (var key in routes) {
                    namespace(this.routes, key.replace(/^\//, '').replace('\/', '.'), routes[key]);
                }
            } catch (e) {
                console.log(e);
            }
        },
        check:function () {
            if (window.location.hash !== this.current) {
                var route = this.current = window.location.hash;
                var parts = route.replace(/^#?\/?/, '').split('/');
                var args = [];
                var fragments = this.routes;
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    if (fragments[part]) {
                        fragments = fragments[part];
                    } else if (fragments['*']) {
                        args.push(isNumeric(part) ? Number(part) : part);
                        fragments = fragments['*'];
                    } else {
                        break;
                    }
                }
                if (isFunction(fragments)) {
                    fragments.apply(this, args);
                }
            }
        },
        route:function (routes) {
            this.compile(routes);
            if (!this.iid && this.autostart) {
                this.start();
            }
            return this;
        },
        start:function (options) {
            options = options || {};
            var callback = proxy(this.check, this);
            this.iid = setInterval(callback, options.interval || 50);
            return this;
        },
        stop:function () {
            clearInterval(this.iid);
            delete this.iid;
        }
    }).singleton();


    // Apply.route
    // -----------

    Apply.route = proxy(router.route, router);


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
        extend(scope, Apply);
    };


    // Apply.mixins
    // -------------

    var renderDataElement = function (context, el, data, deflatedData) {
        var $el = $(el);
        var key = $el.attr('data');
        context.set($el, namespace(deflatedData, key));
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

    Apply.mixins = {
        view:{
            dataBinding:{
                render:function () {
                    var that = this;
                    var data = this.data || {};
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
                set:function ($el, value) {
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
            },
            renderer:{
                dynamic:{
                    attachTo:'',
                    render:function (view) {
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
                children:{
                    children:{},
                    render:function (children) {
                        var $el = this.$el;
                        for (var key in this.children) {
                            var $attachTo = $el.find(key).empty();
                            if ($attachTo.size() === 0 && $el.is(key)) {
                                $attachTo = $el;
                            }
                            var views = this.children[key];
                            if (isArray(views)) {
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
                list:{
                    itemView:view,
                    render:function () {
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
                                data:value
                            }).render());
                        });
                        return $el;
                    }
                }
            }
        }
    };


    window.Apply = Apply;

})(jQuery || Zepto);