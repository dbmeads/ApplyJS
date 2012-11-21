/*global Apply, describe, it, expect */
describe('Apply.mixins.view.renderer.dynamic', function() {
    'use strict';

    it('should accept a view and attach that view to the container element by default', function() {
        var view = Apply.View(Apply.mixins.view.renderer.dynamic).instance();

        view.render(Apply.View({source: '<span>hi</span>'}).instance());

        expect(view.$el.html()).toBe('<span>hi</span>');
    });

    it('should accept an "attachTo" selector that the dynamic view will be placed in', function() {
        var view = Apply.View(Apply.mixins.view.renderer.dynamic, {source: '<div><div class="dynamic"></div></div>', attachTo: '.dynamic'}).instance();

        view.render(Apply.View({source: '<span>hi</span>'}).instance());

        expect(view.$el.html()).toBe('<div class="dynamic"><span>hi</span></div>');
    });

});