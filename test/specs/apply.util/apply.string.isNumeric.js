(function (root, apply) {
	'use strict';

	describe('apply.string.isNumeric', function () {

		it('should recognize an integer as numeric', function () {
			expect(apply.string.isNumeric('10231213')).toBe(true);
		});

		it('should not recognize a string as numeric', function () {
			expect(apply.string.isNumeric('test')).toBe(false);
		});

	});
})(this, this.apply);