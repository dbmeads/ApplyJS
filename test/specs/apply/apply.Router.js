(function (root, undefined) {
	'use strict';

	describe('apply.Router', function () {
		var callback, router;

		beforeEach(function () {
			callback = jasmine.createSpy();
			router = new apply.Router();
		});

		describe('route', function () {

			it('should store the fragmented route in a routes object that references the callback', function () {
				router.route('/this/is/a/route', callback);

				expect(router.routes.this.is.a.route).toBe(callback);
			});
		});

		it('should support a navigate function that will execute any previously set route that matches', function () {
			router.route('/test', callback);

			router.navigate('/test');

			expect(callback).toHaveBeenCalled();
		});
	});
})(this);