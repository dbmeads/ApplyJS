/*global apply, describe, it, expect */
describe('apply.isGenerated', function () {
    'use strict';

    it('should be able to detect a generate', function () {
        expect(apply.isGenerated(apply.generate())).toBe(true);
    });

    it('should not recognize just any object as a generate', function () {
        expect(apply.isGenerated({})).toBe(false);
    });

});