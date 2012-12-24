(function (root, apply) {
	'use strict';

	describe('apply.isObject', function () {

		it('should be able to tell an object is an object', function () {
			expect(apply.isObject({})).toBe(true);
		});

		it('should be able to tell a string isn\'t an object', function () {
			expect(apply.isObject('')).toBe(false);
		});

		it('should be able to tell an array is an object', function () {
			expect(apply.isObject([])).toBe(true);
		});

		it('should be able to tell a function is an object', function () {
			expect(apply.isObject(function () {})).toBe(true);
		});

		it('should be able to tell undefined isn\'t an object', function () {
			expect(apply.isObject(undefined)).toBe(false);
		});

		it('should be able to tell a number isn\'t an object', function () {
			expect(apply.isObject(0)).toBe(false);
		});

	});
})(this, this.apply);