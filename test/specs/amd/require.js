(function (root, undefined) {
	'use strict';

	describe('require', function () {

		var callback;

		define('required', function () {
			return 'hi';
		});

		beforeEach(function () {
			callback = jasmine.createSpy();
			root.xhr.spy();
		});

		it('should be defined as a function', function () {
			expect(typeof require === 'function').toBe(true);
		});

		it('should accept dependencies as it\'s first argument and a callback that will receive them as the second.', function () {
			require(['required'], callback);

			expect(callback).toHaveBeenCalledWith('hi');
		});

		it('should call a callback at a later time if a dependency is not immediately available', function () {
			require(['dep1'], callback);

			define('dep1', function () {
				return 'hi again';
			});

			expect(callback).toHaveBeenCalledWith('hi again');
		});

	});
})(this);