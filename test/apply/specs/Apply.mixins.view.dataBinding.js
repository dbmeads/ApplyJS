/*global Apply, describe, it, expect */
describe('Apply.mixins.view.dataBinding', function() {
    'use strict';

    it('should render text or value for any elements with the "data" attribute', function() {
        var MyView = Apply.View({source: '<div><span data="name"></span><input data="age" /></div>'}, Apply.mixins.view.dataBinding);

        var view = new MyView({data: {name: 'Frank', age: 40}});

        var $el = view.render();

        expect($el.find('[data=name]').text()).toBe('Frank');
        expect($el.find('[data=age]').val()).toBe('40');
    });

    it('should respond to model updates by re-rendering previously identified view elements', function() {
        var MyView = Apply.View({source: '<div><span data="name"></span><input data="age" /></div>'}, Apply.mixins.view.dataBinding);
        var model = new Apply.Model({name: 'Frank', age: 40});
        var view = new MyView({data: model});
        var $el = view.render();

        model.set({name: 'Bill', age: 20});

        expect($el.find('[data=name]').text()).toBe('Bill');
        expect($el.find('[data=age]').val()).toBe('20');
    });

});