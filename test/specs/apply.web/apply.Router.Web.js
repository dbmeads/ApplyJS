/*global apply, window, it, expect, jasmine */
describe('apply.Router.Web', function () {
	'use strict';

	var callback;

	beforeEach(function () {
		window.router.current = undefined;
		callback = jasmine.createSpy();
	});

	it('should recognize new routes when called and respond to hash fragment changes', function () {
		apply.router.add('home', callback);
		window.location.hash = '#home';

		apply.router.check();

		expect(callback).toHaveBeenCalled();
	});

});