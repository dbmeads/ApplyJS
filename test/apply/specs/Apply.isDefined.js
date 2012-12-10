/*global apply, window */
describe('apply.isDefined', function () {
    'use strict';

    it('should recognize undefined objects', function () {
        expect(apply.isDefined('safaf.dsfaadf.afsf')).toBe(false);
    });

    it('should recognize defined objects', function () {
        window.test = createDeepObject();

        expect(apply.isDefined('test.object.that.is.really.deep')).toBe(true);
    });

    it('should properly handle an empty key', function() {
        window[''] = true;

        expect(apply.isDefined('')).toBe(true);
    });

    it('should not consider undefined to be defined', function() {
        expect(apply.isDefined(undefined)).toBe(false);
    });

    describe('relative to an obj', function() {

        it('should recognize undefined objects', function () {
            expect(apply.isDefined('safaf.dsfaadf.afsf', {})).toBe(false);
        });

        it('should recognize defined objects', function () {
            var obj = {
                test:createDeepObject()
            };

            expect(apply.isDefined('test.object.that.is.really.deep', obj)).toBe(true);
        });

        it('should properly handle an empty key', function() {
            var obj = {'':true};

            expect(apply.isDefined('', obj)).toBe(true);
        });

        it('should not consider undefined to be defined', function() {
            expect(apply.isDefined(undefined, {})).toBe(false);
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