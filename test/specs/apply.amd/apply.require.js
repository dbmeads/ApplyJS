describe('apply.require', function() {
    'use strict';

    var called;

    beforeEach(function() {
        called = false;
    });

    xit('should provide a require function', function() {
        expect(typeof apply.require === 'function').toBe(true);
    });

    xit('should accept dependencies as it\'s first argument and a callback that will receive them as the second.', function() {
        apply.require(['jquery'], function($) {
            expect($.fn).toBeDefined();
            called = true;
        });

        expect(called).toBe(true);
    });

    xit('should call a callback at a later time if a dependency is not immediately available', function() {
        apply.require(['dep1'], function() {

        });
    });

});