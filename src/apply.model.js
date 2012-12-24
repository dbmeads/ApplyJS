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