/*global apply, describe, it, expect, window, collection, cascade, compose */
describe('apply.cascade', function () {
    'use strict';

    apply.toScope(window);

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

    it('should support a cascade call on a composed constructor', function () {
        var Constructor = compose({math:function (options) {
            options.number += 1;
            return options;
        }}, {math:function (options) {
            options.number *= 2;
            return options;
        }});

        Constructor.cascade('math');

        expect(new Constructor().math({number:1}).number).toBe(4);
    });

    it('should automatically continue previously established cascades when a constructor has more mixins applied', function () {
        var Constructor = compose({build:function (options) {
            options.string += ':1st';
            return options;
        }}).cascade('build').compose({build:function (options) {
            options.string += ':2nd';
            return options;
        }});

        expect(new Constructor().build({string:''}).string).toBe(':1st:2nd');
    });

});