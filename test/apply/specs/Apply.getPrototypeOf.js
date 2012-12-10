/*global apply, describe, it, expect */
describe('apply.getPrototype', function () {
    'use strict';

    it('should handle undefined parameters', function () {
        expect(apply.getPrototypeOf()).toBe(undefined);
    });

    it('should be able to return an objects prototype', function () {
        var Constructor = function () {
        };

        var obj = new Constructor();

        expect(apply.getPrototypeOf(obj)).toBe(Constructor.prototype);
    });

    it('should be able to detect a function and return it\'s prototype', function () {
        var func = function () {
        };

        expect(apply.getPrototypeOf(func)).toBe(func.prototype);
    });

    it('should recognize that a primitive is not an object and return undefined', function() {
       expect(apply.getPrototypeOf(1)).toBeUndefined();
    });

});