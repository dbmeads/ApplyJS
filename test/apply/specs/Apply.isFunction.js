/*global Apply, describe, it, expect */
describe('Apply.isFunction', function () {
    'use strict';

    it('should be able to tell an object isn\'t a function', function () {
        expect(Apply.isFunction({})).toBe(false);
    });

    it('should be able to tell a function is a function', function () {
        expect(Apply.isFunction(function () {
        })).toBe(true);
    });

});