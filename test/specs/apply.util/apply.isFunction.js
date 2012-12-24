(function (root, apply) {
	'use strict';

	describe('apply.isFunction', function () {

		it('should be able to tell an object isn\'t a function', function () {
			expect(apply.isFunction({})).toBe(false);
		});

		it('should be able to tell a function is a function', function () {
			expect(apply.isFunction(function () {})).toBe(true);
		});

	});
})(this, this.apply);