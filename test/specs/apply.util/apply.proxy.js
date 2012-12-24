(function (root, apply) {
	'use strict';

	describe('apply.proxy', function () {
		it('should be able to return a function that will call the original funciton under the passed context', function () {
			var obj = {},
				func = function () {
					this.prop = 'prop';
				};

			apply.proxy(func, obj)();

			expect(obj.prop).toBe('prop');
		});
	});
})(this, this.apply);