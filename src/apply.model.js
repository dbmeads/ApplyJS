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