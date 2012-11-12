/*global Apply, describe, it, expect */
describe('Apply.util.isNumeric', function() {
    'use strict';

    it('should be able to tell an object isn\'t a number', function() {
        expect(Apply.util.isNumeric({})).toBe(false);
    });

    it('should be able to tell an string isn\'t a number', function() {
        expect(Apply.util.isNumeric('')).toBe(false);
    });

    it('should be able to tell an array isn\'t a number', function() {
        expect(Apply.util.isNumeric([])).toBe(false);
    });

    it('should be able to tell undefined isn\'t a number', function() {
        expect(Apply.util.isNumeric(undefined)).toBe(false);
    });

    it('should be able to tell a number is a number', function() {
        expect(Apply.util.isNumeric(0)).toBe(true);
    });

});