/*global Apply, describe, it, expect */
describe('Apply.mixins.view.renderer.list', function() {
    'use strict';

    var ListView = Apply.View(Apply.mixins.view.renderer.list, {itemView: Apply.View(Apply.mixins.view.dataBinding, {source: '<span data="name"></span>'})});

    it('should render an array of data items utilizing the provided itemView and attaching to the root element by default', function() {
        var view = new ListView({data: [{name: 'Tom'},{name: 'Frank'}]});

        view.render();

        expect(view.$el.html()).toBe('<span data="name">Tom</span><span data="name">Frank</span>');
    });

    it('should properly render Apply.List data attributes as well', function() {
        var view = new ListView({data: new Apply.List([{name: 'Tom'},{name: 'Frank'}])});

        view.render();

        expect(view.$el.html()).toBe('<span data="name">Tom</span><span data="name">Frank</span>');
    });

});