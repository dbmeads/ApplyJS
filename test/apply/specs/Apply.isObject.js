/*global Apply, describe, it, expect */
describe('Apply.isObject', function () {
    'use strict';

    it('should be able to tell an object is an object', function () {
        expect(Apply.isObject({})).toBe(true);
    });

    it('should be able to tell a string isn\'t an object', function () {
        expect(Apply.isObject('')).toBe(false);
    });

    it('should be able to tell an array is an object', function () {
        expect(Apply.isObject([])).toBe(true);
    });

    it('should be able to tell a function is an object', function () {
        expect(Apply.isObject(function() {})).toBe(true);
    });

    it('should be able to tell undefined isn\'t an object', function () {
        expect(Apply.isObject(undefined)).toBe(false);
    });

    it('should be able to tell a number isn\'t an object', function () {
        expect(Apply.isObject(0)).toBe(false);
    });

});