/*global apply, describe, it, expect */
describe('apply.string.isNumeric', function() {
    'use strict';

    it('should recognize an integer as numeric', function() {
        expect(apply.string.isNumeric('10231213')).toBe(true);
    });

    it('should not recognize a string as numeric', function() {
        expect(apply.string.isNumeric('test')).toBe(false);
    });

});