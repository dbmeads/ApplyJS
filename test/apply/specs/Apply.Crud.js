/*global Apply, describe, it, expect, ajax, jasmine */
describe('Apply.Crud', function () {
    'use strict';

    it('save should delegate to "toString()" for data, "getUrl()" for the url and "contentType" for the contentType needed', function () {
        ajax.getOptions(function (options) {
            expect(options.data).toBe('something');
            expect(options.url).toBe('testUrl');
            expect(options.contentType).toBe('text/xml');
        });

        new (Apply.Crud({
            toString:function () {
                return 'something';
            },
            getUrl:function () {
                return 'testUrl';
            },
            contentType:'text/xml'
        }))().save();
    });

    describe('fetch', function () {

    });

    describe('destroy', function () {

    });

});