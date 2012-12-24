(function (root, apply) {
	'use strict';

	describe('apply.isComposed', function () {

		it('should be able to detect a composed instance', function () {
			expect(apply.isComposed(apply.compose())).toBe(true);
		});

		it('should not recognize just any object as a composed object', function () {
			expect(apply.isComposed({})).toBe(false);
		});

	});
})(this, this.apply);