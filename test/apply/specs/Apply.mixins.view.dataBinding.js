/*global Apply, describe, it, expect */
describe('Apply.mixins.view.dataBinding', function () {
    'use strict';

    it('should render text or value for any elements with the "data" attribute', function () {
        var MyView = Apply.View({source:'<div><span data="name"></span><input data="age" /></div>'}, Apply.mixins.view.dataBinding);

        var view = new MyView({data:{name:'Frank', age:40}});

        var $el = view.render();

        expect($el.find('[data=name]').text()).toBe('Frank');
        expect($el.find('[data=age]').val()).toBe('40');
    });

    it('should respond to model updates by re-rendering previously identified view elements', function () {
        var MyView = Apply.View({source:'<div><span data="name"></span><input data="age" /></div>'}, Apply.mixins.view.dataBinding);
        var model = new Apply.Model({name:'Frank', age:40});
        var view = new MyView({data:model});
        var $el = view.render();

        model.set({name:'Bill', age:20});

        expect($el.find('[data=name]').text()).toBe('Bill');
        expect($el.find('[data=age]').val()).toBe('20');
    });

    it('should be capable of automatically updating a model when input fields and textareas change', function () {
        var MyView = Apply.View({source:'<div><textarea data="name"></textarea><input data="age" /></div>'}, Apply.mixins.view.dataBinding);
        var model = new Apply.Model();
        var view = new MyView({data:model});
        var $el = view.render();

        view.$el.find('[data=name]').val('Bill').change();
        view.$el.find('[data=age]').val(40).change();

        expect(model.get('name')).toBe('Bill');
        expect(model.get('age')).toBe('40');
    });

});