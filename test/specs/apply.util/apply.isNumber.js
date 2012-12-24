(function (root, apply) {
	'use strict';

	describe('apply.isNumber', function () {

		it('should be able to tell an object isn\'t a number', function () {
			expect(apply.isNumber({})).toBe(false);
		});

		it('should be able to tell a string isn\'t a number', function () {
			expect(apply.isNumber('')).toBe(false);
		});

		it('should be able to tell an array isn\'t a number', function () {
			expect(apply.isNumber([])).toBe(false);
		});

		it('should be able to tell undefined isn\'t a number', function () {
			expect(apply.isNumber(undefined)).toBe(false);
		});

		it('should be able to tell a number is a number', function () {
			expect(apply.isNumber(0)).toBe(true);
		});

	});
})(this, this.apply);