/*global window*/
describe('define', function() {
   'use strict';

    var called;

    beforeEach(function() {
       called = false;
    });

    it('should be defined as a function', function() {
       expect(typeof define === 'function').toBe(true);
    });

    it('should define an amd object on the define function', function() {
       expect(typeof define.amd === 'object').toBe(true);
    });

    it('should accept a factory callback as the first argument and call it immediately', function() {
       define(function() {
           called = true;
       });

       expect(called).toBe(true);
    });

    it('should accept a module id as the first argument and a factory callback as the second', function() {
        define('my/module', function() {
            called = true;
        });

        expect(called).toBe(true);
    });

    it('should be able to depend on a previously defined module', function() {
        define('my/module', function() {
            return {prop:1};
        });

        define(['my/module'], function(module) {
            expect(module.prop).toBe(1);
            called = true;
        });

        expect(called).toBe(true);
    });

    it('should be able to resolve dependencies at a later time once they\'re defined.', function() {
        define(['unresolved'], function(module) {
            expect(module.prop).toBe(1);
            called = true;
        });

        define('unresolved', function() {
            return {prop:1};
        });

        expect(called).toBe(true);
    });

    describe('remote resources', function() {

        var xmlHttpRequest;

        beforeEach(function() {
            xmlHttpRequest = jasmine.createSpyObj('',['open','send']);
            spyOn(window, 'XMLHttpRequest').andCallFake(function() {
                return xmlHttpRequest;
            });
        });

        it('should attempt to request a dependency from the server if not resolved', function() {
            define(['lib/test1'], function() {});

            expect(window.XMLHttpRequest).toHaveBeenCalled();
        });

        it('should assume a file with no extension is a .js file', function() {
            define(['lib/test2'], function() {});

            expect(xmlHttpRequest.open.mostRecentCall.args).toEqual(['GET', 'lib/test2.js', false]);
        });

        it('should eval the dependency if it is returned with a status of 200', function() {
            setupFakeResource();

            define(['lib/test3'], function(){});

            expect(eval).toHaveBeenCalledWith('stuff');
        });

        it('should pass non evaluated content to the factory when the resource is not javascript', function() {
            setupFakeResource();

            define(['css/default.css'], function(resource) {
                expect(resource).toBe('stuff');
                called = true;
            });

            expect(called).toBe(true);
        });

        function setupFakeResource(resource) {
            xmlHttpRequest.open = function() {
                this.status = 200;
                this.responseText = 'stuff';
            };
            spyOn(window, 'eval');
        }

    });

});