/*global apply, window, it, expect, jasmine */
describe('apply.Router.Web', function () {
	'use strict';

	beforeEach(function () {
		apply.router.autostart = false;
		apply.router.current = '';
	});

	it('should recognize new routes when called and respond to hash fragment changes', function () {
		var check = jasmine.createSpy('check');
		window.location.hash = '#home';

		apply.route({
			'home': function () {
				check();
			}
		});

		apply.router.check();

		expect(check).toHaveBeenCalled();
	});

	it('should be able to handle parameterized routes', function () {
		var check = jasmine.createSpy('check');
		window.location.hash = '#/users/1';

		apply.route({
			'/users/*': function (id) {
				expect(id).toBe(1);
				check();
			}
		});

		apply.router.check();

		expect(check).toHaveBeenCalled();
	});

	it('should be able to handle an empty route', function () {
		var check = jasmine.createSpy('check');
		window.router.current = undefined;
		window.location.hash = '';

		apply.route({
			'': function () {
				check();
			}
		});

		apply.router.check();

		expect(check).toHaveBeenCalled();
	});

});