(function (root, apply) {
	'use strict';

	describe('apply.module', function () {

		var callback;

		beforeEach(function () {
			callback = jasmine.createSpy();
		});

		it('should allow the registration of a module callback that will be invoked only once per apply instance', function () {
			apply.module(callback);
			apply.module(callback);

			expect(callback.callCount).toBe(1);
		});

		it('should pass the instance of apply to itself', function () {
			apply.module(callback);

			expect(callback).toHaveBeenCalledWith(apply);
		});

		it('should have apply as it\'s context', function () {
			apply.module(callback);

			expect(callback.mostRecentCall.object).toBe(apply);
		});

		it('should return the current instance of apply', function () {
			expect(apply.module(callback)).toBe(apply);
		});

		it('should pass any additional arguments on to the callback', function () {
			apply.module(callback, 'test');

			expect(callback).toHaveBeenCalledWith(apply, 'test');
		});
	});

})(this, this.apply);