(function (root, apply) {
	'use strict';

	describe('apply.isString', function () {

		it('should not recognize an object as a string', function () {
			expect(apply.isString({})).toBe(false);
		});

		it('should not recognize a number as a string', function () {
			expect(apply.isString(0)).toBe(false);
		});

		it('should not recognize an array as a string', function () {
			expect(apply.isString([])).toBe(false);
		});

		it('should not recognize undefined as a string', function () {
			expect(apply.isString(undefined)).toBe(false);
		});

		it('should not recognize a function as a string', function () {
			expect(apply.isString(function () {})).toBe(false);
		});

		it('should not recognize a string as a string', function () {
			expect(apply.isString('')).toBe(true);
		});

	});
})(this, this.apply);