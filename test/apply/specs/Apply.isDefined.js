/*global Apply, window */
describe('Apply.isDefined', function () {
    'use strict';

    it('should recognize undefined objects', function () {
        expect(Apply.isDefined('safaf.dsfaadf.afsf')).toBe(false);
    });

    it('should recognize defined objects', function () {
        window.test = createDeepObject();

        expect(Apply.isDefined('test.object.that.is.really.deep')).toBe(true);
    });

    it('should properly handle an empty key', function() {
        window[''] = true;

        expect(Apply.isDefined('')).toBe(true);
    });

    it('should not consider undefined to be defined', function() {
        expect(Apply.isDefined(undefined)).toBe(false);
    });

    describe('relative to an obj', function() {

        it('should recognize undefined objects', function () {
            expect(Apply.isDefined('safaf.dsfaadf.afsf', {})).toBe(false);
        });

        it('should recognize defined objects', function () {
            var obj = {
                test:createDeepObject()
            };

            expect(Apply.isDefined('test.object.that.is.really.deep', obj)).toBe(true);
        });

        it('should properly handle an empty key', function() {
            var obj = {'':true};

            expect(Apply.isDefined('', obj)).toBe(true);
        });

        it('should not consider undefined to be defined', function() {
            expect(Apply.isDefined(undefined, {})).toBe(false);
        });

    });

    function createDeepObject() {
        return {
            object:{
                that:{
                    is:{
                        really:{
                            deep:true
                        }
                    }
                }
            }
        };
    }

});