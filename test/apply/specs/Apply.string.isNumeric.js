/*global Apply, describe, it, expect */
describe('Apply.string.isNumeric', function() {
    'use strict';

    it('should recognize an integer as numeric', function() {
        expect(Apply.string.isNumeric('10231213')).toBe(true);
    });

    it('should not recognize a string as numeric', function() {
        expect(Apply.string.isNumeric('test')).toBe(false);
    });

});