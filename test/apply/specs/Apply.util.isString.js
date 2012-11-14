/*global Apply, describe, it, expect */
describe('Apply.util.isString', function () {
    'use strict';

    it('should not recognize an object as a string', function () {
        expect(Apply.util.isString({})).toBe(false);
    });

    it('should not recognize a number as a string', function () {
        expect(Apply.util.isString(0)).toBe(false);
    });

    it('should not recognize an array as a string', function () {
        expect(Apply.util.isString([])).toBe(false);
    });

    it('should not recognize undefined as a string', function () {
        expect(Apply.util.isString(undefined)).toBe(false);
    });

    it('should not recognize a function as a string', function () {
        expect(Apply.util.isString(function () {
        })).toBe(false);
    });

    it('should not recognize a string as a string', function () {
        expect(Apply.util.isString('')).toBe(true);
    });

});