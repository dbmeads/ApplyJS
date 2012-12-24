(function (root) {
	'use strict';

	describe('apply.Router', function () {
		var callback, router;

		beforeEach(function () {
			callback = jasmine.createSpy();
			router = new apply.Router();
		});

		describe('add', function () {

			it('should store the fragmented route in a routes object that references the callback', function () {
				router.add('/this/is/a/route', callback);

				expect(router.routes.this.is.a.route).toBe(callback);
			});

			it('should support an object with multiple routes', function () {
				router.add({
					'/route1': callback,
					'/route2': callback
				});

				expect(router.routes.route1).toBeDefined();
				expect(router.routes.route2).toBeDefined();
			});
		});

		describe('route', function () {

			it('should support a navigate function that will execute any previously set route that matches', function () {
				router.add('/test', callback);

				router.route('/test');

				expect(callback).toHaveBeenCalled();
			});

			it('should pass any additional navigate arguments to the callback function', function () {
				router.add('/test', callback);

				router.route('/test', 'arg1', 'arg2');

				expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
			});

			it('should be able to handle parameterized routes', function () {
				router.add('/users/*', callback);

				router.route('/users/1');

				expect(callback).toHaveBeenCalledWith(1);
			});

			it('should be able to handle an empty route', function () {
				router.add('', callback);

				router.route('');

				expect(callback).toHaveBeenCalled();
			});
		});
	});
})(this);