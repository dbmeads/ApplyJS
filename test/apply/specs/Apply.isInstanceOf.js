/*global Apply */
describe('Apply.isInstanceOf', function() {
    'use strict';

    var mixin;

    beforeEach(function() {
        mixin = Apply.mixin({});
    });

    it('should be able to take any mixin Constructor and determine if an object contains it', function() {
        expect(Apply.isInstanceOf(mixin, mixin({}).singleton())).toBe(true);
    });

    it('should recognize that a seperate mixin instance is not an instance of it', function() {
        expect(Apply.isInstanceOf(mixin, Apply.mixin({}).singleton())).toBe(false);
    });

    it('should recognize that a plain object isn\'t an instance of a mixin', function() {
        expect(Apply.isInstanceOf(mixin, {})).toBe(false);
    });

    it('should recognize that object created with it are in fact instances of it', function() {
        expect(Apply.isInstanceOf(mixin, mixin.singleton())).toBe(true);
    });

    it('should be able to be called on a mixin instance directly', function() {
        expect(mixin.singleton().isInstanceOf(mixin)).toBe(true);
    });

    xit('should be able to handle more complex mixin configurations', function() {
        expect(mixin.isInstanceOf(Apply.mixin(mixin({})).singleton())).toBe(true);
    });

});