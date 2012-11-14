/*global Apply, describe, it, expect */
describe('Apply.util.getPrototype', function () {
    'use strict';

    it('should handle undefined parameters', function () {
        expect(Apply.util.getPrototypeOf()).toBe(undefined);
    });

    it('should be able to return an objects prototype', function () {
        var Constructor = function () {
        };

        var obj = new Constructor();

        expect(Apply.util.getPrototypeOf(obj)).toBe(Constructor.prototype);
    });

    it('should be able to detect a function and return it\'s prototype', function () {
        var func = function () {
        };

        expect(Apply.util.getPrototypeOf(func)).toBe(func.prototype);
    });

});