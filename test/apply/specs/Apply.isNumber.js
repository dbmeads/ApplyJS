/*global Apply, describe, it, expect */
describe('Apply.isNumber', function () {
    'use strict';

    it('should be able to tell an object isn\'t a number', function () {
        expect(Apply.isNumber({})).toBe(false);
    });

    it('should be able to tell a string isn\'t a number', function () {
        expect(Apply.isNumber('')).toBe(false);
    });

    it('should be able to tell an array isn\'t a number', function () {
        expect(Apply.isNumber([])).toBe(false);
    });

    it('should be able to tell undefined isn\'t a number', function () {
        expect(Apply.isNumber(undefined)).toBe(false);
    });

    it('should be able to tell a number is a number', function () {
        expect(Apply.isNumber(0)).toBe(true);
    });

});