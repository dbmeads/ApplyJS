/*global Apply, describe, it, expect, window, collection, cascade, mixin */
describe('Apply.cascade', function() {
    'use strict';

    Apply.toScope(window);

    it('should cascade a function and add the most recent return as the last argument if available', function () {
        var cascaded = cascade([{math:function () {
            return collection.last(arguments) + 1;
        }}, {math:function () {
            return collection.last(arguments) * 2;
        }}], 'math');

        expect(cascaded(1)).toBe(4);
    });

    it('should support reverse cascading', function() {
        var cascaded = cascade([{math:function () {
            return collection.last(arguments) + ' second ';
        }}, {math:function () {
            return collection.last(arguments) + ' first ';
        }}], 'math', true);

        expect(cascaded('')).toBe(' first  second ');
    });

    it('should support a cascade call on a mixin constructor that will cascade a function and add the most recent return as the last argument if available', function () {
        var Mixin = mixin({math:function () {
            return collection.last(arguments) + 1;
        }}, {math:function () {
            return collection.last(arguments) * 2;
        }});

        Mixin.cascade('math');

        expect(new Mixin().math(1)).toBe(4);
    });

    it('should automatically continue previously established cascades when a constructor has more mixins applied', function() {
        var Mixin = mixin({build: function() { return collection.last(arguments) + ':1st';}}).cascade('build').mixin({build: function() {return collection.last(arguments) + ':2nd';}});

        expect(new Mixin().build('')).toBe(':1st:2nd');
    });

});