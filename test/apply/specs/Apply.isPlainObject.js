/*global Apply, window, */
describe('Apply.isPlainObject', function () {
    'use strict';

    it('should not recognize a function as an object', function () {
        expect(Apply.isPlainObject(function () {
        })).toBe(false);
    });

    it('should not recognize an array as a plain object', function() {
        expect(Apply.isPlainObject([])).toBe(false);
    });

    it('should recognize {} as a plain object', function () {
        expect(Apply.isPlainObject({})).toBe(true);
    });

    it('should recognize that undefined is not a plain object', function() {
        expect(Apply.isPlainObject(undefined)).toBe(false);
    });

});