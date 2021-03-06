(function (root, apply) {
	'use strict';

	describe('apply.isArray', function () {

		it('should be able to tell an object isn\'t an array', function () {
			expect(apply.isArray({})).toBe(false);
		});

		it('should know a function is not an array', function () {
			expect(apply.isArray(function () {})).toBe(false);
		});

		it('should properly recognize an array', function () {
			expect(apply.isArray([])).toBe(true);
		});

		it('should properly recognize that the function arguments variable is not an array', function () {
			expect(apply.isArray(arguments)).toBe(false);
		});

	});
})(this, this.apply);