/*global Apply, describe, it, expect */
describe('Apply.util.isNumber', function () {
    'use strict';

    it('should be able to tell an object isn\'t a number', function () {
        expect(Apply.util.isNumber({})).toBe(false);
    });

    it('should be able to tell a string isn\'t a number', function () {
        expect(Apply.util.isNumber('')).toBe(false);
    });

    it('should be able to tell an array isn\'t a number', function () {
        expect(Apply.util.isNumber([])).toBe(false);
    });

    it('should be able to tell undefined isn\'t a number', function () {
        expect(Apply.util.isNumber(undefined)).toBe(false);
    });

    it('should be able to tell a number is a number', function () {
        expect(Apply.util.isNumber(0)).toBe(true);
    });

});