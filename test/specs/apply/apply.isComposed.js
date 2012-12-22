/*global apply, describe, it, expect */
describe('apply.isComposed', function () {
	'use strict';

	it('should be able to detect a composed instance', function () {
		expect(apply.isComposed(apply.compose())).toBe(true);
	});

	it('should not recognize just any object as a composed object', function () {
		expect(apply.isComposed({})).toBe(false);
	});

});