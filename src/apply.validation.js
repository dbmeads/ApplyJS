/*
 * Module: apply/validation
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	function module(apply) {

		var validations = {
			'required': function (value) {
				if (value && apply.isObject(value) || (value.length && value.length > 0)) {
					return true;
				}
				return false;
			}
		};

		apply.namespace('apply.mixins.validation', {
			validate: function () {
				if (this.validation) {
					for (var field in this.validation) {
						var rules = this.validation[field];
						for (var i = 0; i < rules.length; i++) {
							if (validations[rules[i]] && !validations[rules[i]].call(this, this.attributes[field])) {
								return false;
							}
						}
					}
				}
				return true;
			}
		});
	}

	define('apply/validation', ['apply/model'], function (apply) {
		return apply.module(module);
	});
})(this);