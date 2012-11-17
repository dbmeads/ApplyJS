/*global Apply, describe, it, expect */
describe('Apply.View.DataBinding', function() {
    'use strict';

    it('should render text or value for any elements with the "data" attribute', function() {
        var MyView = Apply.View({source: '<div><span data="text"></span><input data="value" /></div>'}, Apply.View.DataBinding);

        var view = new MyView({data: {text: 'Frank', value: 'Value'}});

        var $el = view.render();

        expect($el.find('[data=value]').val()).toBe('Value');
        expect($el.html()).toBe('<span data="text">Frank</span><input data="value">');
    });

});