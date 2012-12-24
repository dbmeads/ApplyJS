(function (root) {
	'use strict';

	describe('apply.Router.Web', function () {

		var callback;

		beforeEach(function () {
			apply.router.current = undefined;
			callback = jasmine.createSpy();
		});

		it('should recognize new routes when called and respond to hash fragment changes', function () {
			apply.router.add('home', callback);
			root.location.hash = '#home';

			apply.router.check();

			expect(callback).toHaveBeenCalled();
		});

	});
})(this);