/*global apply */
describe('apply.isInstanceOf', function() {
    'use strict';

    var mixin;

    beforeEach(function() {
        mixin = apply.generate({});
    });

    it('should be able to take any generated constructor and determine if an object contains it', function() {
        expect(apply.isInstanceOf(mixin, mixin({}).singleton())).toBe(true);
    });

    it('should recognize that a seperate generated instance is not an instance of it', function() {
        expect(apply.isInstanceOf(mixin, apply.generate({}).singleton())).toBe(false);
    });

    it('should recognize that a plain object isn\'t an instance of a generated constructor', function() {
        expect(apply.isInstanceOf(mixin, {})).toBe(false);
    });

    it('should recognize that object created with it are in fact instances of it', function() {
        expect(apply.isInstanceOf(mixin, mixin.singleton())).toBe(true);
    });

    it('should be able to be called on a generated instance directly', function() {
        expect(mixin.singleton().isInstanceOf(mixin)).toBe(true);
    });

    xit('should be able to handle more complex generated constructors / objects', function() {
        expect(apply.generate(mixin({})).singleton().isInstanceOf(mixin)).toBe(true);
    });

});