/*global Apply, window, util */
describe('Apply.util.isPlainObject', function () {
    'use strict';

    Apply.toScope(window);

    it('should not recognize a function as an object', function () {
        expect(util.isPlainObject(function () {
        })).toBe(false);
    });

    it('should not recognize an array as a plain object', function() {
        expect(util.isPlainObject([])).toBe(false);
    });

    it('should recognize {} as a plain object', function () {
        expect(util.isPlainObject({})).toBe(true);
    });

    it('should recognize that undefined is not a plain object', function() {
        expect(util.isPlainObject(undefined)).toBe(false);
    });

});