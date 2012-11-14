/*global Apply, describe, it, expect, ajax, jasmine */
describe('Apply.Crud', function () {
    'use strict';

    var TestCrud = Apply.Crud({
        getUrl:function () {
            return 'testUrl';
        }
    });

    describe('save', function () {
        it('should delegate to "toString()" for data, "getUrl()" for the url and "contentType" for the contentType needed', function () {
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

        it('should POST by default', function () {
            ajax.getOptions(function (options) {
                expect(options.type).toBe("POST");
            });

            new TestCrud().save();
        });

        it('should PUT if the object has a "getId()" function and it returns an id', function () {
            ajax.getOptions(function (options) {
                expect(options.type).toBe("PUT");
            });

            new (TestCrud.mixin({ getId:function () {
                return '1';
            }}))().save();
        });
    });

    describe('fetch', function () {

    });

    describe('destroy', function () {

    });

});