/*global Apply, window, it, expect, jasmine */
describe('Apply.route', function () {
    'use strict';


    beforeEach(function() {
        Apply.router.autostart = false;
        Apply.router.current = '';
    });

    it('should recognize new routes when called and respond to hash fragment changes', function () {
        var check = jasmine.createSpy('check');
        window.location.hash = '#home';

        Apply.route({
            'home':function () {
                check();
            }
        });

        Apply.router.check();

        expect(check).toHaveBeenCalled();
    });

    it('should be able to handle parameterized routes', function() {
        var check = jasmine.createSpy('check');
        window.location.hash = '#/users/1';

        Apply.route({
            '/users/*' : function(id) {
                expect(id).toBe(1);
                check();
            }
        });

        Apply.router.check();

        expect(check).toHaveBeenCalled();
    });

    it('should be able to handle an empty route', function() {
        var check = jasmine.createSpy('check');
        window.router.current = undefined;
        window.location.hash = '';

        Apply.route({
            '' : function() {
                check();
            }
        });

        Apply.router.check();

        expect(check).toHaveBeenCalled();
    });

});