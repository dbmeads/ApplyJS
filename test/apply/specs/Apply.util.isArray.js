/*global Apply, describe, it, expect */
describe('Apply.util.isArray', function () {
    'use strict';

    it('should be able to tell an object isn\'t an array', function () {
        expect(Apply.util.isArray({})).toBe(false);
    });

    it('should know a function is not an array', function () {
        expect(Apply.util.isArray(function () {
        })).toBe(false);
    });

    it('should properly recognize an array', function () {
        expect(Apply.util.isArray([])).toBe(true);
    });

    it('should properly recognize that the function arguments variable is not an array', function () {
        expect(Apply.util.isArray(arguments)).toBe(false);
    });

});