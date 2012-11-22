/*global Apply, describe, it, expect */
describe('Apply.util.isObject', function () {
    'use strict';

    it('should be able to tell an object is an object', function () {
        expect(Apply.util.isObject({})).toBe(true);
    });

    it('should be able to tell a string isn\'t an object', function () {
        expect(Apply.util.isObject('')).toBe(false);
    });

    it('should be able to tell an array is an object', function () {
        expect(Apply.util.isObject([])).toBe(true);
    });

    it('should be able to tell undefined isn\'t an object', function () {
        expect(Apply.util.isObject(undefined)).toBe(false);
    });

    it('should be able to tell a number isn\'t an object', function () {
        expect(Apply.util.isObject(0)).toBe(false);
    });

});