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

    it('should be able to tell a function is an object', function () {
        expect(Apply.util.isObject(function() {})).toBe(true);
    });

    it('should be able to tell undefined isn\'t an object', function () {
        expect(Apply.util.isObject(undefined)).toBe(false);
    });

    it('should be able to tell a number isn\'t an object', function () {
        expect(Apply.util.isObject(0)).toBe(false);
    });

    it('should support a strict flag that will force only the typeof check', function () {
        expect(Apply.util.isObject(function() {}, true)).toBe(false);
    });

});