(function (root, apply) {
	'use strict';

	describe('apply.mixins.view.dataBinding', function () {

		var DataBindingView = apply.View;

		it('should render text or value for any elements with the "data" attribute', function () {
			var MyView = DataBindingView({
				source: '<div><span data="name"></span><input data="age" /></div>'
			});

			var view = new MyView({
				data: {
					name: 'Frank',
					age: 40
				}
			});

			var $el = view.render();

			expect($el.find('[data=name]').text()).toBe('Frank');
			expect($el.find('[data=age]').val()).toBe('40');
		});

		it('should respond to model updates by re-rendering previously identified view elements', function () {
			var MyView = DataBindingView({
				source: '<div><span data="name"></span><input data="age" /></div>'
			});
			var model = new apply.Model({
				name: 'Frank',
				age: 40
			});
			var view = new MyView({
				data: model
			});
			var $el = view.render();

			model.set({
				name: 'Bill',
				age: 20
			});

			expect($el.find('[data=name]').text()).toBe('Bill');
			expect($el.find('[data=age]').val()).toBe('20');
		});

		it('should be capable of automatically updating a model when input fields and textareas change', function () {
			var MyView = DataBindingView({
				source: '<div><textarea data="name"></textarea><input data="age" /></div>'
			});
			var model = new apply.Model();
			var view = new MyView({
				data: model
			});
			var $el = view.render();

			view.$el.find('[data=name]').val('Bill').change();
			view.$el.find('[data=age]').val(40).change();

			expect(model.get('name')).toBe('Bill');
			expect(model.get('age')).toBe('40');
		});

		it('should be able to bind to the outer element of a view as well', function () {
			var MyView = DataBindingView({
				source: '<div data="name"></div>'
			});

			var $el = new MyView({
				data: {
					name: 'Dan'
				}
			}).render();

			expect($el.text()).toBe('Dan');
		});

		it('should provide a default model for data if data is undefined', function () {
			var view = DataBindingView({
				source: '<form><input type="text" data="name"/></form>'
			}).instance();

			view.render().find('[data="name"]').val('Ted').change();

			expect(view.data.get('name')).toBe('Ted');
		});

	});
})(this, this.apply);