/*global Apply, describe, it, expect, window, collection, cascade, mixin */
describe('Apply.cascade', function () {
    'use strict';

    Apply.toScope(window);

    it('should cascade a function', function () {
        var cascaded = cascade([
            {math:function (options) {
                options.number += 1;
                return options;
            }},
            {math:function (options) {
                options.number *= 2;
                return options;
            }}
        ], 'math');

        expect(cascaded({number:1}).number).toBe(4);
    });

    it('should support reverse cascading', function () {
        var cascaded = cascade([
            {math:function (options) {
                options.string += 'second';
                return options;
            }},
            {math:function (options) {
                options.string += 'first';
                return options;
            }}
        ], 'math', true);

        expect(cascaded({string:''}).string).toBe('firstsecond');
    });

    it('should support a cascade call on a mixin constructor', function () {
        var Mixin = mixin({math:function (options) {
            options.number += 1;
            return options;
        }}, {math:function (options) {
            options.number *= 2;
            return options;
        }});

        Mixin.cascade('math');

        expect(new Mixin().math({number:1}).number).toBe(4);
    });

    it('should automatically continue previously established cascades when a constructor has more mixins applied', function () {
        var Mixin = mixin({build:function (options) {
            options.string += ':1st';
            return options;
        }}).cascade('build').mixin({build:function (options) {
            options.string += ':2nd';
            return options;
        }});

        expect(new Mixin().build({string:''}).string).toBe(':1st:2nd');
    });

});