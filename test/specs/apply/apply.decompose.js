describe('apply.decompose', function () {
    'use strict';

    it('should support a decompose function that removes a previously applied mixin', function () {
        var mixin1 = {prop1:true}, mixin2 = {prop2:true};
        var Constructor = apply.compose(mixin1, mixin2);

        apply.decompose(Constructor, mixin1);

        expect(Constructor.prototype.prop1).not.toBeDefined();
        expect(Constructor.prototype.prop2).toBe(true);
    });
});