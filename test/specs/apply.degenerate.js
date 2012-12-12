describe('apply.degenerate', function () {
    'use strict';

    it('should support a degenerate function that removes a previously applied mixin', function () {
        var mixin1 = {prop1:true}, mixin2 = {prop2:true};
        var Constructor = apply.generate(mixin1, mixin2);

        apply.degenerate(Constructor, mixin1);

        expect(Constructor.prototype.prop1).not.toBeDefined();
        expect(Constructor.prototype.prop2).toBe(true);
    });
});