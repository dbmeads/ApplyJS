/*global apply, describe, it, expect */
describe('apply.isFunction', function () {
    'use strict';

    it('should be able to tell an object isn\'t a function', function () {
        expect(apply.isFunction({})).toBe(false);
    });

    it('should be able to tell a function is a function', function () {
        expect(apply.isFunction(function () {
        })).toBe(true);
    });

});