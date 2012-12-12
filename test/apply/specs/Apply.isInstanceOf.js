/*global apply */
describe('apply.isInstanceOf', function() {
    'use strict';

    var mixin;

    beforeEach(function() {
        mixin = apply.generate({});
    });

    it('should be able to take any generate Constructor and determine if an object contains it', function() {
        expect(apply.isInstanceOf(mixin, mixin({}).singleton())).toBe(true);
    });

    it('should recognize that a seperate generate instance is not an instance of it', function() {
        expect(apply.isInstanceOf(mixin, apply.generate({}).singleton())).toBe(false);
    });

    it('should recognize that a plain object isn\'t an instance of a generate', function() {
        expect(apply.isInstanceOf(mixin, {})).toBe(false);
    });

    it('should recognize that object created with it are in fact instances of it', function() {
        expect(apply.isInstanceOf(mixin, mixin.singleton())).toBe(true);
    });

    it('should be able to be called on a generate instance directly', function() {
        expect(mixin.singleton().isInstanceOf(mixin)).toBe(true);
    });

    xit('should be able to handle more complex generate configurations', function() {
        expect(mixin.isInstanceOf(apply.generate(mixin({})).singleton())).toBe(true);
    });

});