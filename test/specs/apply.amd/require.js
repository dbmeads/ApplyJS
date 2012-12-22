describe('require', function() {
    'use strict';

    var called;

    beforeEach(function() {
        called = false;
    });

    it('should be defined as a function', function() {
        expect(typeof require === 'function').toBe(true);
    });

    xit('should accept dependencies as it\'s first argument and a callback that will receive them as the second.', function() {
        require(['jquery'], function($) {
            expect($.fn).toBeDefined();
            called = true;
        });

        expect(called).toBe(true);
    });

    xit('should call a callback at a later time if a dependency is not immediately available', function() {
        require(['dep1'], function() {

        });
    });

});