/*global apply, describe, it, expect */
describe('apply.isMixin', function () {
    'use strict';

    it('should be able to detect a mixin', function () {
        expect(apply.isMixin(apply.mixin())).toBe(true);
    });

    it('should not recognize just any object as a mixin', function () {
        expect(apply.isMixin({})).toBe(false);
    });

});