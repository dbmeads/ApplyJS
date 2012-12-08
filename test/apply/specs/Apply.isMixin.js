/*global Apply, describe, it, expect */
describe('Apply.isMixin', function () {
    'use strict';

    it('should be able to detect a mixin', function () {
        expect(Apply.isMixin(Apply.mixin())).toBe(true);
    });

    it('should not recognize just any object as a mixin', function () {
        expect(Apply.isMixin({})).toBe(false);
    });

});