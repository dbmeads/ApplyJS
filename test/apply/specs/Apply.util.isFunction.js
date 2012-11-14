/*global Apply, describe, it, expect */
describe('Apply.util.isFunction', function () {
    'use strict';

    it('should be able to tell an object isn\'t a function', function () {
        expect(Apply.util.isFunction({})).toBe(false);
    });

    it('should be able to tell a function is a function', function () {
        expect(Apply.util.isFunction(function () {
        })).toBe(true);
    });

});