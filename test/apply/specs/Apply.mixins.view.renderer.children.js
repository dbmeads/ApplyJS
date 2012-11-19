/*global Apply, describe, it, expect */
describe('Apply.mixins.view.renderer.children', function () {
    'use strict';

    it('should support a children option that will attach previously instantiated views to a container view by selector', function () {
        var view = Apply.View(Apply.mixins.view.renderer.children, {
            source:'<div><div class="child1"></div><div class="child2"></div></div>',
            children:{
                '.child1':Apply.View({source:'<span>child1</span>'}).instance(),
                '.child2':Apply.View({source:'<span>child2</span>'}).instance() }
        }).instance();

        view.render();

        expect(view.$el.html()).toBe('<div class="child1"><span>child1</span></div><div class="child2"><span>child2</span></div>');
    });

    it('should also support an array of views to be attached to a selector', function () {
        var view = Apply.View(Apply.mixins.view.renderer.children, {
            source:'<div class="children"></div>',
            children:{
                '.children':[Apply.View({source:'<span>child1</span>'}).instance(), Apply.View({source:'<span>child2</span>'}).instance()]}
        }).instance();

        view.render();

        expect(view.$el.html()).toBe('<span>child1</span><span>child2</span>');
    });

    it('should append to the outer element if the selector is empty', function() {

    });

});