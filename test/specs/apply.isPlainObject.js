/*global apply, window, */
describe('apply.isPlainObject', function () {
    'use strict';

    it('should not recognize a function as an object', function () {
        expect(apply.isPlainObject(function () {
        })).toBe(false);
    });

    it('should not recognize an array as a plain object', function() {
        expect(apply.isPlainObject([])).toBe(false);
    });

    it('should recognize {} as a plain object', function () {
        expect(apply.isPlainObject({})).toBe(true);
    });

    it('should recognize that undefined is not a plain object', function() {
        expect(apply.isPlainObject(undefined)).toBe(false);
    });

});