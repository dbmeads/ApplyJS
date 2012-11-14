/*global Apply, describe, it, expect */
describe('Apply.util.isMixin', function () {
    'use strict';

    it('should be able to detect a mixin', function () {
        expect(Apply.util.isMixin(Apply.mixin())).toBe(true);
    });

    it('should not recognize just any object as a mixin', function () {
        expect(Apply.util.isMixin({})).toBe(false);
    });

});