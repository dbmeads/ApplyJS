/*global Apply, window, it, expect, jasmine */
describe('Apply.route', function () {
    'use strict';

    it('should recognize new routes when called and respond to hash fragment changes', function () {
        var check = jasmine.createSpy('check');

        Apply.router.current = '';

        Apply.route({
            'home':function () {
                check();
            }
        });

        window.location.hash = '#home';

        Apply.router.check();

        expect(check.callCount).toBe(1);
    });

});