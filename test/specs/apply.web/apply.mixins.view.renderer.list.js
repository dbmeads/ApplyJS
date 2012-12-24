(function (root, apply) {
	'use strict';

	describe('apply.mixins.view.renderer.list', function () {

		var ListView = apply.View(apply.mixins.view.renderer.list, {
			itemView: apply.View(apply.mixins.view.dataBinding, {
				source: '<span data="name"></span>'
			})
		});

		it('should render an array of data items utilizing the provided itemView and attaching to the root element by default', function () {
			var view = new ListView({
				data: [{
					name: 'Tom'
				},
				{
					name: 'Frank'
				}]
			});

			view.render();

			expect(view.$el.html()).toBe('<span data="name">Tom</span><span data="name">Frank</span>');
		});

		it('should properly render apply.List data attributes as well', function () {
			var view = new ListView({
				data: new apply.List([{
					name: 'Tom'
				},
				{
					name: 'Frank'
				}])
			});

			view.render();

			expect(view.$el.html()).toBe('<span data="name">Tom</span><span data="name">Frank</span>');
		});

	});
})(this, this.apply);