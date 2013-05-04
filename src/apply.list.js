/*
 * Module: apply/list
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
define('apply/list', ['apply/events', 'apply/model'], function (apply) {
	'use strict';

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
		},
		toString: function () {
			return JSON.stringify(this.deflate ? this.deflate() : this);
		},
	});

	return apply;
});