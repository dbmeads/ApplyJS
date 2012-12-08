/*global Apply, describe, it, expect */
describe('Apply.isArray', function () {
    'use strict';

    it('should be able to tell an object isn\'t an array', function () {
        expect(Apply.isArray({})).toBe(false);
    });

    it('should know a function is not an array', function () {
        expect(Apply.isArray(function () {
        })).toBe(false);
    });

    it('should properly recognize an array', function () {
        expect(Apply.isArray([])).toBe(true);
    });

    it('should properly recognize that the function arguments variable is not an array', function () {
        expect(Apply.isArray(arguments)).toBe(false);
    });

});